import React, { useState } from 'react'
import questions, { categories, difficultyColors } from './QuestionBank'
import './HomeScreen.css'

export default function HomeScreen({ onStartSession, onOpenApiModal, hasConfig }) {
    const [activeCategory, setActiveCategory] = useState('behavioral')

    const catQuestions = questions[activeCategory] || []

    return (
        <div className="home">
            {/* NAV */}
            <nav className="home-nav glass">
                <div className="nav-brand">
                    <span className="nav-logo">⚡</span>
                    <span className="nav-title">InterviewAI</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={onOpenApiModal}>
                    {hasConfig ? '⚙️ Local AI ✓' : '⚙️ Setup Local AI'}
                </button>
            </nav>

            {/* HERO */}
            <section className="hero">
                <div className="hero-badge animate-fade-in">🚀 AI-Powered Interview Coach</div>
                <h1 className="hero-title animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    Ace Your Next{' '}
                    <span className="gradient-text">Interview</span>
                </h1>
                <p className="hero-sub animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    Speak your answer. Get scored on clarity, structure, depth, and more — instantly processed on your GPU!
                </p>

                {!hasConfig && (
                    <div className="hero-warning animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <span>⚠️</span>
                        <span>Setup your local inference AI settings to enable feedback</span>
                        <button className="btn btn-primary btn-sm" onClick={onOpenApiModal}>Setup Local AI</button>
                    </div>
                )}

                {/* Stats row */}
                <div className="hero-stats animate-fade-in" style={{ animationDelay: '0.35s' }}>
                    <div className="stat-item"><span className="stat-num">24</span><span className="stat-label">Questions</span></div>
                    <div className="stat-divider" />
                    <div className="stat-item"><span className="stat-num">5</span><span className="stat-label">Score Dimensions</span></div>
                    <div className="stat-divider" />
                    <div className="stat-item"><span className="stat-num">4</span><span className="stat-label">Categories</span></div>
                </div>
            </section>

            {/* QUESTION BANK */}
            <section className="question-section">
                {/* Category tabs */}
                <div className="category-tabs">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`cat-tab ${activeCategory === cat.id ? 'cat-tab--active' : ''}`}
                            style={{ '--cat-color': cat.color }}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Question grid */}
                <div className="question-grid">
                    {catQuestions.map((q, i) => (
                        <div
                            key={q.id}
                            className="q-card card animate-fade-in"
                            style={{ animationDelay: `${i * 0.07}s` }}
                        >
                            <div className="q-card-header">
                                <span
                                    className="q-difficulty"
                                    style={{
                                        background: difficultyColors[q.difficulty].bg,
                                        color: difficultyColors[q.difficulty].text,
                                    }}
                                >
                                    {q.difficulty}
                                </span>
                                <span className="q-tip-icon" title={q.tip}>💡</span>
                            </div>
                            <p className="q-text">{q.question}</p>
                            <div className="q-card-footer">
                                <span className="q-tip-text">{q.tip}</span>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => onStartSession(q)}
                                    id={`start-q-${q.id}`}
                                >
                                    Practice →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
