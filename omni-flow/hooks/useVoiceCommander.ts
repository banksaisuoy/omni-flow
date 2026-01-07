'use client'

import { useState, useEffect, useCallback } from 'react'

export function useVoiceCommander() {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setError('Browser not supported')
        }
    }, [])

    const startListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) return

        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onstart = () => {
            setIsListening(true)
            setError(null)
        }

        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript
            setTranscript(text)
        }

        recognition.onerror = (event: any) => {
            console.error("Voice Error", event.error)
            setError(event.error)
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        recognition.start()
    }, [])

    return { isListening, transcript, startListening, error, setTranscript }
}
