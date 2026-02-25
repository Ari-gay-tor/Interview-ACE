import React, { useEffect, useRef } from 'react'
import './ScoreCard.css'

const DIMENSIONS = [
    { key: 'clarity', label: 'Clarity', icon: '💬', color: '#a78bfa' },
    { key: 'relevance', label: 'Relevance', icon: '🎯', color: '#06b6d4' },
    { key: 'confidence', label: 'Confidence', icon: '💪', color: '#10b981' },
    { key: 'structure', label: 'Structure', icon: '🏗️', color: '#f59e0b' },
    { key: 'depth', label: 'Depth', icon: '🔬', color: '#f472b6' },
    { key: 'delivery', label: 'Delivery', icon: '🎙️', color: '#ec4899' },
]

function gradeColor(grade) {
    if (!grade) return '#94a3b8'
    if (grade.startsWith('A')) return '#10b981'
    if (grade.startsWith('B')) return '#06b6d4'
    if (grade.startsWith('C')) return '#f59e0b'
    return '#ef4444'
}

function ArcMeter({ value, color, size = 80 }) {
    const canvasRef = useRef(null)
    const animRef = useRef(null)
    const currentRef = useRef(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const cx = size / 2
        const cy = size / 2
        const r = size / 2 - 8
        const target = (value / 10)

        const startAngle = Math.PI * 0.75
        const totalAngle = Math.PI * 1.5

        const draw = (progress) => {
            ctx.clearRect(0, 0, size, size)
            // Track
            ctx.beginPath()
            ctx.arc(cx, cy, r, startAngle, startAngle + totalAngle)
            ctx.strokeStyle = 'rgba(255,255,255,0.07)'
            ctx.lineWidth = 7
            ctx.lineCap = 'round'
            ctx.stroke()

            // Fill arc
            const endAngle = startAngle + totalAngle * progress
            const grad = ctx.createLinearGradient(0, 0, size, size)
            grad.addColorStop(0, color)
            grad.addColorStop(1, color + 'aa')
            ctx.beginPath()
            ctx.arc(cx, cy, r, startAngle, endAngle)
            ctx.strokeStyle = grad
            ctx.lineWidth = 7
            ctx.lineCap = 'round'
            ctx.stroke()

            // Value text
            ctx.fillStyle = '#f1f5f9'
            ctx.font = `bold ${size * 0.22}px 'Space Grotesk', sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(value, cx, cy)
        }

        const animate = () => {
            currentRef.current += (target - currentRef.current) * 0.08
            if (Math.abs(currentRef.current - target) < 0.001) {
                currentRef.current = target
                draw(target)
                return
            }
            draw(currentRef.current)
            animRef.current = requestAnimationFrame(animate)
        }

        currentRef.current = 0
        animRef.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animRef.current)
    }, [value, color, size])

    return <canvas ref={canvasRef} width={size} height={size} className="arc-canvas" />
}

export default function ScoreCard({ scores, overall, grade, deliveryFeedback }) {
    const gColor = gradeColor(grade)

    return (
        <div className="score-card card animate-fade-in">
            {/* Overall */}
            <div className="score-overall">
                <div className="overall-arc-wrapper">
                    <ArcMeter value={overall} color={gColor} size={100} />
                </div>
                <div className="overall-info">
                    <div className="overall-grade" style={{ color: gColor }}>{grade}</div>
                    <div className="overall-label">Overall Score</div>
                </div>
            </div>

            <div className="score-divider" />

            {/* Dimension scores */}
            <div className="score-dimensions">
                {DIMENSIONS.map((dim) => {
                    const val = scores?.[dim.key] ?? 0
                    return (
                        <div key={dim.key} className="score-dim">
                            <div className="score-dim-left">
                                <ArcMeter value={val} color={dim.color} size={64} />
                            </div>
                            <div className="score-dim-right">
                                <span className="score-dim-icon">{dim.icon}</span>
                                <span className="score-dim-label">{dim.label}</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {deliveryFeedback && (
                <>
                    <div className="score-divider" />
                    <div className="delivery-metrics">
                        <h4 className="delivery-metrics-title">🎙️ Technical Delivery</h4>
                        <p className="delivery-metrics-text">{deliveryFeedback}</p>
                    </div>
                </>
            )}
        </div>
    )
}
