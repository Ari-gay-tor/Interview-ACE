import React, { useState } from 'react'
import './SessionHistory.css'

export default function SessionHistory({ history }) {
    const [expanded, setExpanded] = useState(null)

    const toggle = (id) => setExpanded((prev) => (prev === id ? null : id))

    return (
        <div className="session-history card">
            <h3 className="history-title">
                <span>📋</span>
                Session History
                <span className="history-count">{history.length}</span>
            </h3>
            <div className="history-list">
                {history.map((entry, idx) => (
                    <div key={entry.id} className="history-entry animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <button
                            className="history-entry-header"
                            onClick={() => toggle(entry.id)}
                            id={`history-toggle-${entry.id}`}
                        >
                            <div className="history-entry-left">
                                <span className="history-num">#{history.length - idx}</span>
                                <span className="history-q-snippet">
                                    {entry.question.question.length > 60
                                        ? entry.question.question.slice(0, 60) + '…'
                                        : entry.question.question}
                                </span>
                            </div>
                            <div className="history-entry-right">
                                <span
                                    className="history-score"
                                    style={{ color: scoreColor(entry.feedback?.overall) }}
                                >
                                    {entry.feedback?.overall ?? '?'}/10
                                </span>
                                <span className={`history-chevron ${expanded === entry.id ? 'history-chevron--open' : ''}`}>
                                    ›
                                </span>
                            </div>
                        </button>

                        {expanded === entry.id && (
                            <div className="history-entry-body animate-fade-in">
                                <p className="history-full-q">{entry.question.question}</p>
                                {entry.feedback?.summary && (
                                    <p className="history-summary">{entry.feedback.summary}</p>
                                )}
                                {entry.feedback?.strengths?.length > 0 && (
                                    <div className="history-quick-tags">
                                        {entry.feedback.strengths.slice(0, 2).map((s, i) => (
                                            <span key={i} className="tag tag-success">{s.slice(0, 40)}{s.length > 40 ? '…' : ''}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function scoreColor(score) {
    if (!score) return 'var(--clr-text-muted)'
    if (score >= 8) return 'var(--clr-success)'
    if (score >= 6) return 'var(--clr-warning)'
    if (score >= 4) return '#f97316'
    return 'var(--clr-danger)'
}
