import React, { useState, useEffect, useRef } from 'react'
import Recorder from './Recorder'
import FeedbackPanel from './FeedbackPanel'
import ScoreCard from './ScoreCard'
import SessionHistory from './SessionHistory'
import { analyzeAnswer } from '../services/localAIService'
import { categories, difficultyColors } from './QuestionBank'
import './SessionScreen.css'

export default function SessionScreen({ question, aiConfig, onBack }) {
    const [status, setStatus] = useState('idle') // idle | recording | analyzing | done | error
    const [transcript, setTranscript] = useState('')
    const [feedback, setFeedback] = useState(null)
    const [error, setError] = useState(null)   // null | { type: 'quota_zero' } | { type: 'rate_limit', seconds: N } | { type: 'generic', msg: '' }
    const [history, setHistory] = useState([])
    const countdownRef = useRef(null)
    const [countdown, setCountdown] = useState(0)

    const categoryInfo = categories.find((c) => c.id === question.category)

    // No singleton AI to reset for local fetch

    const [lastMetrics, setLastMetrics] = useState(null)

    const handleRecordingComplete = async (finalTranscript, deliveryMetrics) => {
        if (!finalTranscript.trim()) {
            setError('No speech detected. Please try again.')
            setStatus('idle')
            return
        }
        setTranscript(finalTranscript)
        setLastMetrics(deliveryMetrics)
        setStatus('analyzing')
        setError(null)
        setFeedback(null)

        try {
            const result = await analyzeAnswer(aiConfig?.endpoint, aiConfig?.modelName, question.question, finalTranscript, deliveryMetrics)
            setFeedback(result)
            setStatus('done')
            // Add to history
            setHistory((prev) => [
                { question, transcript: finalTranscript, feedback: result, metrics: deliveryMetrics, id: Date.now() },
                ...prev,
            ])
        } catch (err) {
            setError({ type: 'generic', msg: err?.message || 'Analysis failed. Make sure your local AI (Ollama) is running.' })
            setStatus('error')
        }
    }

    const handleRetry = () => {
        clearInterval(countdownRef.current)
        setStatus('idle')
        setTranscript('')
        setLastMetrics(null)
        setFeedback(null)
        setError(null)
        setCountdown(0)
    }

    const handleRetryAnalysis = () => {
        clearInterval(countdownRef.current)
        setCountdown(0)
        // Re-run the analysis without wiping the user's audio transcript
        handleRecordingComplete(transcript, lastMetrics)
    }

    return (
        <div className="session">
            {/* TOP BAR */}
            <div className="session-topbar glass">
                <button className="btn btn-ghost btn-sm" onClick={onBack} id="back-home-btn">
                    ← Home
                </button>
                <div className="session-cat" style={{ '--cat-color': categoryInfo?.color }}>
                    {categoryInfo?.icon} {categoryInfo?.label}
                </div>
                <div className="session-topbar-right">
                    {history.length > 0 && (
                        <span className="history-badge">{history.length} answered</span>
                    )}
                </div>
            </div>

            <div className="session-layout">
                {/* LEFT COL — question + recorder + transcript */}
                <div className="session-main">
                    {/* Question card */}
                    <div className="session-question card animate-fade-in">
                        <div className="question-meta">
                            <span
                                className="q-difficulty-badge"
                                style={{
                                    background: difficultyColors[question.difficulty].bg,
                                    color: difficultyColors[question.difficulty].text,
                                }}
                            >
                                {question.difficulty}
                            </span>
                            <span className="question-label">Interview Question</span>
                        </div>
                        <p className="question-text">{question.question}</p>
                        <div className="question-tip">
                            <span>💡</span>
                            <span>{question.tip}</span>
                        </div>
                    </div>

                    {/* Recorder */}
                    <Recorder
                        status={status}
                        onRecordingComplete={handleRecordingComplete}
                        onStatusChange={setStatus}
                    />

                    {/* Error */}
                    {error && error.type === 'generic' && (
                        <div className="session-error animate-fade-in">
                            <span>⚠️</span>
                            <span>{error.msg}</span>
                            <button className="btn btn-sm btn-primary" onClick={handleRetryAnalysis}>Try Again</button>
                        </div>
                    )}

                    {/* Transcript */}
                    {transcript && (
                        <div className="transcript-panel card animate-fade-in">
                            <div className="transcript-header">
                                <span className="transcript-label">📝 Your Answer (Transcript)</span>
                                <span className="transcript-words">{transcript.split(' ').filter(Boolean).length} words</span>
                            </div>
                            <p className="transcript-text">{transcript}</p>
                        </div>
                    )}

                    {/* Analyzing skeleton */}
                    {status === 'analyzing' && (
                        <div className="analyzing-state animate-fade-in">
                            <div className="analyzing-spinner" />
                            <div>
                                <p className="analyzing-title">Analyzing your answer...</p>
                                <p className="analyzing-sub">Your local GPU is processing the response</p>
                            </div>
                        </div>
                    )}

                    {/* Feedback */}
                    {feedback && status === 'done' && (
                        <FeedbackPanel feedback={feedback} onRetry={handleRetry} />
                    )}
                </div>

                {/* RIGHT COL — score card + history */}
                <div className="session-sidebar">
                    {feedback && status === 'done' && (
                        <ScoreCard
                            scores={feedback.scores}
                            overall={feedback.overall}
                            grade={feedback.grade}
                            deliveryFeedback={feedback.deliveryFeedback}
                        />
                    )}

                    {status !== 'done' && !feedback && (
                        <div className="sidebar-placeholder card">
                            <div className="placeholder-icon">📊</div>
                            <p className="placeholder-text">Your scores will appear here after you record an answer.</p>
                        </div>
                    )}

                    {history.length > 0 && (
                        <SessionHistory history={history} />
                    )}
                </div>
            </div>
        </div>
    )
}
