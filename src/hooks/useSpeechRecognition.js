import { useState, useRef, useCallback } from 'react'
import useAudioMetrics from './useAudioMetrics'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export default function useSpeechRecognition() {
    const [transcript, setTranscript] = useState('')
    const [isListening, setIsListening] = useState(false)
    const [error, setError] = useState(null)
    const [isSupported] = useState(() => !!SpeechRecognition)
    const [metrics, setMetrics] = useState({
        pauses: [],
        avgStability: 100,
        startTime: null,
        totalSpeakingTime: 0
    })

    const recognitionRef = useRef(null)
    const finalTranscriptRef = useRef('')
    const lastResultTimeRef = useRef(null)
    const stabilityHistoryRef = useRef([])

    const { voiceStability, isSilent, startAudioAnalysis, stopAudioAnalysis } = useAudioMetrics()

    const start = useCallback(() => {
        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
            return
        }
        setError(null)
        setTranscript('')
        finalTranscriptRef.current = ''
        lastResultTimeRef.current = Date.now()
        setMetrics({
            pauses: [],
            avgStability: 100,
            startTime: Date.now(),
            totalSpeakingTime: 0
        })
        stabilityHistoryRef.current = []

        startAudioAnalysis()

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => setIsListening(true)

        recognition.onresult = (event) => {
            const now = Date.now()
            let interim = ''
            let final = finalTranscriptRef.current

            // Check for pause since last result
            if (lastResultTimeRef.current) {
                const pauseDuration = (now - lastResultTimeRef.current) / 1000
                if (pauseDuration > 1.5) { // Threshold for a "significant" pause
                    setMetrics(prev => ({
                        ...prev,
                        pauses: [...prev.pauses, pauseDuration.toFixed(1)]
                    }))
                }
            }
            lastResultTimeRef.current = now

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i]
                if (result.isFinal) {
                    final += result[0].transcript + ' '
                    finalTranscriptRef.current = final

                    // Track stability during final results
                    stabilityHistoryRef.current.push(voiceStability)
                    const avg = stabilityHistoryRef.current.reduce((a, b) => a + b, 0) / stabilityHistoryRef.current.length
                    setMetrics(prev => ({ ...prev, avgStability: Math.round(avg) }))
                } else {
                    interim += result[0].transcript
                }
            }
            setTranscript((final + interim).trim())
        }

        recognition.onerror = (event) => {
            if (event.error === 'no-speech') return
            setError(`Mic error: ${event.error}`)
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
            stopAudioAnalysis()
        }

        recognitionRef.current = recognition
        recognition.start()
    }, [startAudioAnalysis, stopAudioAnalysis, voiceStability])

    const stop = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            recognitionRef.current = null
        }
        setIsListening(false)
        stopAudioAnalysis()
    }, [stopAudioAnalysis])

    const reset = useCallback(() => {
        stop()
        setTranscript('')
        setError(null)
        finalTranscriptRef.current = ''
        setMetrics({
            pauses: [],
            avgStability: 100,
            startTime: null,
            totalSpeakingTime: 0
        })
    }, [stop])

    return { transcript, isListening, error, isSupported, start, stop, reset, metrics }
}
