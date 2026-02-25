import React from 'react'
import './FeedbackPanel.css'

export default function FeedbackPanel({ feedback, onRetry }) {
    return (
        <div className="feedback-panel animate-fade-in">
            {/* Summary */}
            <div className="feedback-summary card">
                <div className="feedback-summary-header">
                    <span className="fb-icon">🤖</span>
                    <span className="fb-label">AI Assessment</span>
                </div>
                <p className="fb-summary-text">{feedback.summary}</p>
            </div>

            {/* Strengths */}
            <div className="feedback-section card">
                <h3 className="feedback-section-title feedback-section-title--green">
                    <span>✅</span> Strengths
                </h3>
                <ul className="feedback-list">
                    {feedback.strengths?.map((s, i) => (
                        <li key={i} className="feedback-item feedback-item--green"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <span className="feedback-item-dot feedback-item-dot--green" />
                            {s}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Improvements */}
            <div className="feedback-section card">
                <h3 className="feedback-section-title feedback-section-title--amber">
                    <span>📈</span> Areas to Improve
                </h3>
                <ul className="feedback-list">
                    {feedback.improvements?.map((imp, i) => (
                        <li key={i} className="feedback-item feedback-item--amber"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <span className="feedback-item-dot feedback-item-dot--amber" />
                            {imp}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Pro tip */}
            {feedback.tip && (
                <div className="feedback-tip">
                    <div className="tip-header">
                        <span className="tip-badge">💡 Pro Tip</span>
                    </div>
                    <p className="tip-text">{feedback.tip}</p>
                </div>
            )}

            {/* Actions */}
            <div className="feedback-actions">
                <button className="btn btn-primary" onClick={onRetry} id="retry-btn">
                    🔄 Try Again
                </button>
            </div>
        </div>
    )
}
