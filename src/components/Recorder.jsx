import React, { useState, useRef, useEffect } from 'react'
import useSpeechRecognition from '../hooks/useSpeechRecognition'
import useWaveform from '../hooks/useWaveform'
import './Recorder.css'

export default function Recorder({ status, onRecordingComplete, onStatusChange }) {
    const { transcript, isListening, error: speechError, isSupported, start, stop, metrics } = useSpeechRecognition()
    const { canvasRef, startViz, stopViz } = useWaveform()
    const streamRef = useRef(null)
    const [localError, setLocalError] = useState(null)

    // Canvas size
    const CANVAS_W = 600
    const CANVAS_H = 80

    const handleStart = () => {
        setLocalError(null)
        try {
            start() // Trigger SpeechRecognition first
            onStatusChange('recording')
        } catch (err) {
            setLocalError('Speech recognition could not start.')
        }
    }

    // Effect to start visual metrics ONLY after speech recognition is active
    useEffect(() => {
        if (isListening && !streamRef.current) {
            const startMetrics = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                    streamRef.current = stream
                    startViz(stream)
                } catch (err) {
                    console.warn('Visual metrics could not start (mic priority given to speech):', err)
                }
            }
            startMetrics()
        }
    }, [isListening, startViz])

    const handleStop = () => {
        stop()
        stopViz()
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop())
            streamRef.current = null
        }
    }

    // When speech recognition stops, emit the transcript and metrics
    useEffect(() => {
        if (status === 'recording' && !isListening && transcript) {
            onRecordingComplete(transcript, metrics)
        }
    }, [isListening, status, transcript, metrics])

    const displayError = localError || speechError

    const isRecording = status === 'recording'
    const isDone = status === 'done'
    const isAnalyzing = status === 'analyzing'

    if (!isSupported) {
        return (
            <div className="recorder-unsupported card">
                <span>🎤</span>
                <div>
                    <p><strong>Speech recognition not supported</strong></p>
                    <p>Please use Chrome or Edge for full functionality. Transcription won't be available in this browser.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="recorder card">
            {/* Waveform */}
            <div className={`waveform-wrapper ${isRecording ? 'waveform-wrapper--active' : ''}`}>
                <canvas
                    ref={canvasRef}
                    width={CANVAS_W}
                    height={CANVAS_H}
                    className="waveform-canvas"
                />
                {!isRecording && (
                    <div className="waveform-idle">
                        {isDone || isAnalyzing
                            ? '✅ Recording complete'
                            : '🎤 Press Record to begin'}
                    </div>
                )}
            </div>

            {/* Live transcript preview */}
            {isRecording && (
                <div className="live-transcript">
                    <span className="live-dot" />
                    <p className="live-text">
                        {transcript || <em className="live-placeholder">Listening…</em>}
                    </p>
                </div>
            )}

            {/* Controls */}
            <div className="recorder-controls">
                {!isRecording && !isDone && !isAnalyzing && (
                    <button
                        className="record-btn record-btn--start"
                        onClick={handleStart}
                        id="record-start-btn"
                        disabled={isAnalyzing}
                    >
                        <span className="record-btn-icon">
                            <span className="mic-icon">🎙</span>
                            <span className="pulse-ring" />
                        </span>
                        Start Recording
                    </button>
                )}

                {isRecording && (
                    <button
                        className="record-btn record-btn--stop"
                        onClick={handleStop}
                        id="record-stop-btn"
                    >
                        <span className="stop-square" />
                        Stop Recording
                    </button>
                )}

                {(isDone || isAnalyzing) && (
                    <div className="recorder-done-state">
                        {isAnalyzing ? (
                            <span className="done-label">⚙️ Analyzing response…</span>
                        ) : (
                            <span className="done-label done-label--success">✅ Recording saved</span>
                        )}
                    </div>
                )}
            </div>

            {displayError && (
                <p className="recorder-error">⚠️ {displayError}</p>
            )}
        </div>
    )
}
