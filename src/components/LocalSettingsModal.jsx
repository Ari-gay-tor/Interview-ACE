import React, { useState } from 'react'
import './LocalSettingsModal.css'

export default function LocalSettingsModal({ onSave, onClose, initialEndpoint, initialModel, hasExistingKey }) {
    const [endpoint, setEndpoint] = useState(initialEndpoint || 'http://localhost:11434/api/generate')
    const [model, setModel] = useState(initialModel || 'llama3')
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        const eTrimmed = endpoint.trim()
        const mTrimmed = model.trim()

        if (!eTrimmed || !eTrimmed.startsWith('http')) {
            setError('Please enter a valid HTTP URL.')
            return
        }
        if (!mTrimmed) {
            setError('Please enter a model name.')
            return
        }

        setError('')
        onSave({ endpoint: eTrimmed, modelName: mTrimmed })
    }

    return (
        <div className="modal-overlay" onClick={hasExistingKey ? onClose : undefined}>
            <div
                className="modal-box glass-strong animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-icon">⚙️</div>
                <h2 className="modal-title">Local AI Settings</h2>
                <p className="modal-desc">
                    Configure your local AI inference server (e.g., Ollama, LM Studio).
                </p>

                <form onSubmit={handleSubmit} className="modal-form">
                    <label className="modal-label">API Endpoint</label>
                    <input
                        type="text"
                        className="modal-input"
                        placeholder="http://localhost:11434/api/generate"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                    />

                    <label className="modal-label">Model Name</label>
                    <input
                        type="text"
                        className="modal-input"
                        placeholder="llama3, phi3, mistral..."
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                    />

                    {error && <p className="modal-error">⚠️ {error}</p>}

                    <button type="submit" className="btn btn-primary" id="save-settings-btn" style={{ marginTop: '1rem' }}>
                        Save &amp; Continue
                    </button>
                </form>

                <div className="modal-instructions">
                    <p className="modal-note"><strong>Model Recommendations (RTX 2050):</strong></p>
                    <ul className="modal-list">
                        <li><strong>Llama 3.2 (3B)</strong>: Best balance of speed and logic.</li>
                        <li><strong>Qwen 2.5 (7B-q4)</strong>: Higher quality, fits in 4GB VRAM.</li>
                        <li><strong>Phi-3.5 Mini</strong>: Lightweight and very fast.</li>
                    </ul>

                    <p className="modal-note" style={{ marginTop: '1rem' }}><strong>Exposing to Internet (for others to test):</strong></p>
                    <ol className="modal-list">
                        <li>Install <a href="https://ngrok.com" target="_blank" rel="noreferrer" className="modal-link">Ngrok</a>.</li>
                        <li>In terminal: <code>ngrok http 11434</code> (Ollama's port).</li>
                        <li>Copy the <strong>Forwarding</strong> URL (e.g. <code>https://xyz.ngrok.io</code>) and paste it in the API Endpoint field above.</li>
                        <li>Note: Ensure Ollama is running with <code>OLLAMA_ORIGINS="*"</code> environment variable set to allow cross-origin requests.</li>
                    </ol>
                </div>

                {hasExistingKey && (
                    <button className="btn btn-ghost btn-sm modal-close" onClick={onClose}>
                        Cancel
                    </button>
                )}
            </div>
        </div>
    )
}
