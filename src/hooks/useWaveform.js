import { useRef, useCallback } from 'react'

export default function useWaveform() {
    const canvasRef = useRef(null)
    const animFrameRef = useRef(null)
    const analyserRef = useRef(null)
    const sourceRef = useRef(null)
    const audioCtxRef = useRef(null)

    const startViz = useCallback((stream) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        audioCtxRef.current = audioCtx
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        analyserRef.current = analyser

        const source = audioCtx.createMediaStreamSource(stream)
        sourceRef.current = source
        source.connect(analyser)

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        const ctx = canvas.getContext('2d')

        const draw = () => {
            animFrameRef.current = requestAnimationFrame(draw)
            analyser.getByteFrequencyData(dataArray)

            const W = canvas.width
            const H = canvas.height
            ctx.clearRect(0, 0, W, H)

            // Background gradient
            const bg = ctx.createLinearGradient(0, 0, 0, H)
            bg.addColorStop(0, 'rgba(28,37,64,0)')
            bg.addColorStop(1, 'rgba(28,37,64,0)')
            ctx.fillStyle = bg
            ctx.fillRect(0, 0, W, H)

            const barCount = 48
            const barW = (W / barCount) * 0.7
            const gap = (W / barCount) * 0.3
            let x = 0

            for (let i = 0; i < barCount; i++) {
                const dataIdx = Math.floor((i / barCount) * bufferLength)
                const barH = (dataArray[dataIdx] / 255) * (H * 0.85) + 4

                // Gradient per bar
                const grad = ctx.createLinearGradient(0, H - barH, 0, H)
                grad.addColorStop(0, '#a78bfa')
                grad.addColorStop(1, '#06b6d4')

                ctx.fillStyle = grad
                ctx.beginPath()
                ctx.roundRect(x, H - barH, barW, barH, 3)
                ctx.fill()

                x += barW + gap
            }
        }
        draw()
    }, [])

    const stopViz = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current)
            animFrameRef.current = null
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect()
            sourceRef.current = null
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close()
            audioCtxRef.current = null
        }
        // Clear canvas
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
    }, [])

    return { canvasRef, startViz, stopViz }
}
