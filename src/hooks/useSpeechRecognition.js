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
    const isListeningRef = useRef(false)
    const finalTranscriptRef = useRef('')
    const lastResultTimeRef = useRef(null)
    const stabilityHistoryRef = useRef([])

    const { voiceStability, isSilent, startAudioAnalysis, stopAudioAnalysis } = useAudioMetrics()

    const start = useCallback(() => {
        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in this browser.')
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

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => {
            setIsListening(true)
            isListeningRef.current = true
        }

        recognition.onresult = (event) => {
            const now = Date.now()
            let interim = ''
            let final = finalTranscriptRef.current

            if (lastResultTimeRef.current) {
                const pauseDuration = (now - lastResultTimeRef.current) / 1000
                if (pauseDuration > 1.5) {
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
            console.error('Speech recognition error:', event.error)
            if (event.error === 'no-speech') return

            // On mobile, 'aborted' is common if another app or process takes mic 
            // or if the user locks the screen. We don't want to show a scary error immediately.
            if (event.error === 'aborted') {
                console.warn('Speech recognition aborted (common on mobile).')
                return
            }

            if (event.error === 'not-allowed') {
                setError('Microphone permission denied. Please enable mic access in your browser settings.')
            } else {
                setError(`Mic error: ${event.error}.`)
            }
            setIsListening(false)
            isListeningRef.current = false
        }

        recognition.onend = () => {
            console.log('Speech recognition ended. isListeningRef:', isListeningRef.current)
            if (isListeningRef.current) {
                // Mobile restart with a small delay
                setTimeout(() => {
                    if (isListeningRef.current) {
                        try {
                            recognition.start()
                        } catch (e) {
                            console.error('Speech restart failed:', e)
                        }
                    }
                }, 200)
            } else {
                setIsListening(false)
                isListeningRef.current = false
            }
        }

        recognitionRef.current = recognition
        recognition.start()
    }, [startAudioAnalysis, stopAudioAnalysis, voiceStability])

    const stop = useCallback(() => {
        isListeningRef.current = false
        setIsListening(false)
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            recognitionRef.current = null
        }
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
