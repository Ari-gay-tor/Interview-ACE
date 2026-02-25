import React, { useState, useEffect } from 'react'
import HomeScreen from './components/HomeScreen'
import SessionScreen from './components/SessionScreen'
import LocalSettingsModal from './components/LocalSettingsModal'
import './App.css'

export default function App() {
  const [screen, setScreen] = useState('home') // 'home' | 'session'
  const [selectedQuestion, setSelectedQuestion] = useState(null)

  const [aiConfig, setAiConfig] = useState(() => {
    const saved = localStorage.getItem('local_ai_config')
    if (saved) return JSON.parse(saved)

    // Default to env var if available (useful for hosted version)
    const envEndpoint = import.meta.env.VITE_LOCAL_AI_ENDPOINT
    if (envEndpoint) {
      return { endpoint: envEndpoint, modelName: 'llama3' }
    }
    return null
  })
  const [showApiModal, setShowApiModal] = useState(false)

  useEffect(() => {
    if (!aiConfig) setShowApiModal(true)
  }, [aiConfig])

  const handleStartSession = (question) => {
    if (!aiConfig) { setShowApiModal(true); return }
    setSelectedQuestion(question)
    setScreen('session')
  }

  const handleBackHome = () => {
    setScreen('home')
    setSelectedQuestion(null)
  }

  const handleSaveAiConfig = (config) => {
    localStorage.setItem('local_ai_config', JSON.stringify(config))
    setAiConfig(config)
    setShowApiModal(false)
  }

  return (
    <div className="app">
      {/* Ambient background blobs */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />

      {showApiModal && (
        <LocalSettingsModal
          onSave={handleSaveAiConfig}
          onClose={() => setShowApiModal(false)}
          initialEndpoint={aiConfig?.endpoint}
          initialModel={aiConfig?.modelName}
          hasExistingKey={!!aiConfig}
        />
      )}

      {screen === 'home' && (
        <HomeScreen
          onStartSession={handleStartSession}
          onOpenApiModal={() => setShowApiModal(true)}
          hasConfig={!!aiConfig}
        />
      )}

      {screen === 'session' && (
        <SessionScreen
          question={selectedQuestion}
          aiConfig={aiConfig}
          onBack={handleBackHome}
        />
      )}
    </div>
  )
}
