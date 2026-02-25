import { useState, useRef, useEffect, useCallback } from 'react'

export default function useAudioMetrics() {
    const [voiceStability, setVoiceStability] = useState(100)
    const [isSilent, setIsSilent] = useState(true)
    const audioContextRef = useRef(null)
    const analyzerRef = useRef(null)
    const dataArrayRef = useRef(null)
    const streamRef = useRef(null)
    const frameIdRef = useRef(null)

    const startAudioAnalysis = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream

            const AudioContext = window.AudioContext || window.webkitAudioContext
            audioContextRef.current = new AudioContext()

            const analyzer = audioContextRef.current.createAnalyser()
            analyzer.fftSize = 256
            analyzerRef.current = analyzer

            const source = audioContextRef.current.createMediaStreamSource(stream)
            source.connect(analyzer)

            const bufferLength = analyzer.frequencyBinCount
            dataArrayRef.current = new Uint8Array(bufferLength)

            let lastVolumes = []
            const VOL_WINDOW = 20

            const analyze = () => {
                analyzer.getByteFrequencyData(dataArrayRef.current)

                // Calculate RMS Volume
                let sum = 0
                for (let i = 0; i < dataArrayRef.current.length; i++) {
                    sum += dataArrayRef.current[i] * dataArrayRef.current[i]
                }
                const rms = Math.sqrt(sum / dataArrayRef.current.length)

                // Silence detection (threshold can be adjusted)
                const currentIsSilent = rms < 2
                setIsSilent(currentIsSilent)

                // Stability detection (variance in volume over a window)
                if (!currentIsSilent) {
                    lastVolumes.push(rms)
                    if (lastVolumes.length > VOL_WINDOW) lastVolumes.shift()

                    if (lastVolumes.length === VOL_WINDOW) {
                        const mean = lastVolumes.reduce((a, b) => a + b) / VOL_WINDOW
                        const variance = lastVolumes.reduce((a, b) => a + (b - mean) ** 2, 0) / VOL_WINDOW
                        const stdDev = Math.sqrt(variance)

                        // Map stdDev to a 1-100 stability score
                        // Higher stdDev = lower stability (quiver)
                        const stability = Math.max(0, 100 - (stdDev * 5))
                        setVoiceStability(prev => {
                            // Smoothen the result
                            return Math.round(prev * 0.9 + stability * 0.1)
                        })
                    }
                }

                frameIdRef.current = requestAnimationFrame(analyze)
            }

            analyze()
        } catch (err) {
            console.error('Audio metrics error:', err)
        }
    }, [])

    const stopAudioAnalysis = useCallback(() => {
        if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
        }
        if (audioContextRef.current) {
            audioContextRef.current.close()
        }
    }, [])

    return { voiceStability, isSilent, startAudioAnalysis, stopAudioAnalysis }
}
