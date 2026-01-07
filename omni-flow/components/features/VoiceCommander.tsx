'use client'

import { useVoiceCommander } from '@/hooks/useVoiceCommander'
import { Mic, MicOff, Loader } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function VoiceCommander() {
    const { isListening, transcript, startListening, error, setTranscript } = useVoiceCommander()
    const [processing, setProcessing] = useState(false)
    const [response, setResponse] = useState('')

    // Auto-send when transcript changes (debounce logic usually, but here simple effect)
    // Actually, we should wait for silence or manual stop. Use transcript in useEffect?
    // Better: Trigger manually or on silence. For demo, let's use a "Send" effect or just show transcript.

    useEffect(() => {
        if (transcript && !isListening) {
            handleProcess()
        }
    }, [transcript, isListening])

    const handleProcess = async () => {
        if (!transcript) return
        setProcessing(true)
        try {
            const res = await fetch('/api/ai/commander', {
                method: 'POST',
                body: JSON.stringify({ command: transcript })
            })
            const data = await res.json()
            if (data.success) {
                setResponse(data.intent.response_speech)
                const speech = new SpeechSynthesisUtterance(data.intent.response_speech)
                window.speechSynthesis.speak(speech)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <div className={`transition-all duration-300 bg-black text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 ${isListening ? 'ring-4 ring-green-500' : ''}`}>
                <button onClick={startListening} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
                    {processing ? <Loader className="animate-spin" /> : (isListening ? <MicOff className="text-red-400" /> : <Mic />)}
                </button>

                <div className="w-48">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                        {isListening ? 'Listening...' : processing ? 'Processing...' : 'AI Commander'}
                    </p>
                    <p className="text-sm truncate font-mono text-green-400">
                        {transcript || response || "Ready for orders."}
                    </p>
                </div>
            </div>
        </div>
    )
}
