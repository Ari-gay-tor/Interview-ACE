export async function analyzeAnswer(endpoint, modelName, question, transcript, deliveryMetrics) {
    if (!transcript || transcript.trim().length < 10) {
        throw new Error('Your answer is too short to analyze. Please record a longer response.')
    }

    const payload = {
        model: modelName || 'llama3.2',
        stream: false,
        format: 'json',
        prompt: `You are an expert senior interviewer and career coach. Analyze the following interview answer and provide structured feedback.

INTERVIEW QUESTION:
"${question}"

CANDIDATE'S ANSWER (transcribed from speech):
"${transcript}"

SPEECH DELIVERY METRICS:
- Pauses detected (durations in seconds): [${deliveryMetrics?.pauses?.join(', ') || 'None'}]
- Voice Stability Index (1-100, higher is smoother): ${deliveryMetrics?.avgStability || 'N/A'}

Please evaluate this answer and the delivery. Respond ONLY in valid JSON format:
{
  "scores": {
    "clarity": <integer 1-10>,
    "relevance": <integer 1-10>,
    "confidence": <integer 1-10>,
    "structure": <integer 1-10>,
    "delivery": <integer 1-10>
  },
  "overall": <integer 1-10>,
  "grade": "<A+|A|B+|B|C+|C|D|F>",
  "summary": "<one sentence executive summary of the answer quality>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "deliveryFeedback": "<specific feedback on pauses and voice stability>",
  "tip": "<one specific, actionable pro tip to make this answer stronger>"
}

Scoring rubric:
- clarity: How clearly and understandably the ideas were communicated (1-10)
- relevance: How directly the answer addressed the interview question (1-10)
- confidence: Tone, assertiveness, and conviction in the answer (1-10)
- structure: Logical flow and organization (e.g., STAR method usage) (1-10)
- delivery: Pacing, use of pauses, and vocal steadiness (1-10)

Be constructive but honest. Respond ONLY with the JSON object.`
    }

    const baseUrl = endpoint || 'http://localhost:11434'
    const finalEndpoint = baseUrl.endsWith('/api/generate')
        ? baseUrl
        : `${baseUrl.replace(/\/$/, '')}/api/generate`

    const pingEndpoint = baseUrl.replace(/\/api\/generate$/, '').replace(/\/$/, '') + '/api/tags'

    // Diagnostic Ping
    try {
        console.log('Diagnostic ping to:', pingEndpoint)
        const ping = await fetch(pingEndpoint, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        console.log('Ping status:', ping.status)
    } catch (pingErr) {
        console.error('Diagnostic ping failed:', pingErr)
    }

    let response
    try {
        response = await fetch(finalEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(payload),
        })
    } catch (err) {
        console.error('Fetch error:', err)
        throw new Error(`Failed to connect to local AI. Network error or CORS block. Is Ollama running and accessible via Ngrok?`)
    }

    // Handle 204 No Content explicitly
    if (response.status === 204) {
        throw new Error('Local AI returned "204 No Content". This often means Ngrok or Ollama is blocking the request (CORS/Preflight). Check your OLLAMA_ORIGINS setting.')
    }

    if (!response.ok) {
        throw new Error(`Local AI returned error: ${response.status} ${response.statusText}`)
    }

    let result
    try {
        result = await response.json()
    } catch (parseErr) {
        console.error('JSON Parse error:', parseErr)
        // If it's not JSON, it might be the Ngrok warning page HTML
        const responseText = await response.text()
        if (responseText.includes('ngrok-skip-browser-warning') || responseText.includes('visit the site')) {
            throw new Error('Still hitting Ngrok warning page. The X-Requested-With bypass header might not be working.')
        }
        throw new Error('Could not parse AI response as JSON. The server might be sending an error page instead.')
    }
    const text = result.response || ''

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
        return JSON.parse(cleaned)
    } catch {
        const match = cleaned.match(/\{[\s\S]*\}/)
        if (match) return JSON.parse(match[0])
        throw new Error('Could not parse AI response. Ensure the model supports JSON format.')
    }
}
