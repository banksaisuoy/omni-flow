'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, Loader2, Minimize2 } from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { useStore } from '@/lib/store'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY || '') // Ideally env var

export default function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: "Hello! I'm OmniAuth, your AI shopping assistant. Ask me anything about our products or flash sales!" }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { products } = useStore() // Real data context

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg = input
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setIsLoading(true)

        try {
            // Prepare context
            const productContext = products.map(p =>
                `- ${p.title} (${p.category}): $${p.price} ${p.isFlashSale ? `(ON SALE: $${p.flashPrice})` : ''} - ${p.description}`
            ).join('\n')

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
            const prompt = `
            You are a helpful AI shopping assistant for "OmniFlow". 
            Here is our current product catalog context:
            ${productContext}

            User Question: ${userMsg}

            Answer the user in a friendly, concise way. If they ask about products, recommend from the list. If they ask about sales, mention the flash sales. Do not make up products not in the list.
            `

            const result = await model.generateContent(prompt)
            const response = result.response.text()

            setMessages(prev => [...prev, { role: 'ai', content: response }])
        } catch (error) {
            console.error("AI Chat Error", error)
            setMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble connecting to the neural network. Please try again later." }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center group"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {!isOpen && (
                    <span className="absolute right-full mr-4 bg-white text-indigo-900 px-3 py-1 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        Chat with AI
                    </span>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-indigo-600/20 border-b border-indigo-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-indigo-400" size={18} />
                                <h3 className="font-bold text-white">OmniAuth AI</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                                <Minimize2 size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
                                        <Loader2 size={16} className="animate-spin text-indigo-400" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-800 bg-slate-900">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    handleSend()
                                }}
                                className="relative"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about products..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-lg text-white disabled:opacity-50 disabled:bg-slate-700 transition-all hover:bg-indigo-500"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
