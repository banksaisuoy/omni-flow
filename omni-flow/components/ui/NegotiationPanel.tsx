import React, { useRef, useEffect } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NegotiationPhase } from '../../hooks/useAgentConfig';

export interface Message {
    role: 'user' | 'model';
    parts: string;
}

interface NegotiationPanelProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    messages: Message[];
    input: string;
    setInput: (input: string) => void;
    handleSend: () => void;
    isTyping: boolean;
    phase: NegotiationPhase;
}

export function NegotiationPanel({
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    handleSend,
    isTyping,
    phase,
}: NegotiationPanelProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="mb-4 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col h-[500px]"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white shrink-0">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Bot size={20} />
                                <span className="font-bold">NeuroNegotiator</span>
                            </div>
                            <div className="text-xs mt-1 text-indigo-100 flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${
                                    phase === 'resolved' ? 'bg-green-400' :
                                    phase === 'negotiation' ? 'bg-yellow-400' :
                                    phase === 'active' ? 'bg-blue-400' :
                                    'bg-gray-400'
                                }`} />
                                <span>Status: {phase}</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user'
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
                    <div className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
                        <input
                            className="flex-1 bg-gray-100 rounded-full px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="Ask for a discount..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            disabled={phase === 'resolved' || phase === 'initialized'}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping || phase === 'resolved' || phase === 'initialized'}
                            className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}