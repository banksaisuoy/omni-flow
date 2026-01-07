'use client'

import { useState } from 'react'
import { Send, Bot } from 'lucide-react'
import { askBusinessAnalyst } from '@/actions/admin-actions'

export default function AiAnalystChat() {
    const [chatQuery, setChatQuery] = useState('')
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([])
    const [loading, setLoading] = useState(false)

    const handleAskAI = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!chatQuery.trim()) return

        const newHistory = [...chatHistory, { role: 'user' as const, text: chatQuery }]
        setChatHistory(newHistory)
        setChatQuery('')
        setLoading(true)

        const result = await askBusinessAnalyst(chatQuery)

        setChatHistory([...newHistory, { role: 'ai' as const, text: result.answer }])
        setLoading(false)
    }

    return (
        <div className="bg-slate-900/50 border border-slate-700 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Bot size={120} className="text-indigo-500" />
            </div>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Bot className="text-indigo-400" />
                AI Business Analyst
            </h2>

            <div className="bg-black/40 rounded-xl p-4 h-64 overflow-y-auto mb-4 space-y-4">
                {chatHistory.length === 0 && (
                    <p className="text-slate-500 text-center mt-20">Ask me anything about your sales, users, or system health.</p>
                )}
                {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 text-indigo-400 rounded-2xl px-4 py-2 animate-pulse">
                            Analyzing Database...
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleAskAI} className="relative">
                <input
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    placeholder="Ex: How much revenue did we make today? Any fraud alerts?"
                    className="w-full bg-slate-950 border border-slate-600 rounded-xl px-4 py-3 pr-12 text-white focus:border-indigo-500 outline-none"
                />
                <button type="submit" disabled={loading} className="absolute right-2 top-2 p-1 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors">
                    <Send size={20} className="text-white" />
                </button>
            </form>
        </div>
    )
}
