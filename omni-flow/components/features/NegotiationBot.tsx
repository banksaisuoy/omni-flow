'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { negotiatePrice } from '@/app/actions/negotiate'

export default function NegotiationBot({ productPrice = 100 }: { productPrice?: number }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'model', parts: string }[]>([
        { role: 'model', parts: `Hi! I can help you get a deal on this item. Current price is $${productPrice}. Make me an offer!` }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg = input
        setInput('')
        setMessages(prev => [...prev, { role: 'user', parts: userMsg }])
        setIsTyping(true)

        try {
            const { text } = await negotiatePrice(messages, userMsg, productPrice)
            setMessages(prev => [...prev, { role: 'model', parts: text }])
        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: 'model', parts: "My brain is freezing... try again later." }])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="fixed bottom-24 right-4 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Bot size={20} />
                                <span className="font-bold">NeuroNegotiator</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div ref={scrollRef} className="h-80 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm'
                                        }`}>
                                        {m.parts}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                            <input
                                className="flex-1 bg-gray-100 rounded-full px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="Ask for a discount..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full shadow-lg shadow-indigo-500/40 flex items-center justify-center text-white"
            >
                <MessageCircle size={28} />
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full" />
            </motion.button>
        </div>
    )
}
