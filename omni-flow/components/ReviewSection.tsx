'use client'

import { useState } from 'react'
import { Star, MessageSquare, Send, ShieldCheck, AlertTriangle } from 'lucide-react'
import { submitReviewAction } from '@/app/actions/review'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReviewSection({ productId }: { productId: string }) {
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
    const [reply, setReply] = useState<string | null>(null)

    const handleSubmit = async () => {
        if (!comment) return
        setStatus('submitting')
        setReply(null)

        const formData = new FormData()
        formData.append('productId', productId)
        formData.append('rating', rating.toString())
        formData.append('comment', comment)

        try {
            const res = await submitReviewAction(formData)
            if (res.success) {
                setStatus('success')
                setReply(res.reply || null)
                setComment('')
            } else {
                setStatus('error')
                setReply(res.message || 'Error')
            }
        } catch (e) {
            console.error(e)
            setStatus('error')
        }
    }

    return (
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-6 text-gray-800">
                <ShieldCheck className="text-green-600" />
                <h2 className="text-xl font-bold">Review Sentinel</h2>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setRating(star)} className={`transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                            <Star fill="currentColor" size={24} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                <textarea
                    className="w-full h-32 p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Tell us what you think..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={status === 'submitting' || !comment}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
                {status === 'submitting' ? 'AI Analyzing...' : 'Submit Review'}
                <Send size={18} />
            </button>

            {/* AI Response Area */}
            <AnimatePresence>
                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 bg-green-50 border border-green-100 rounded-xl p-4"
                    >
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center shrink-0">
                                <MessageSquare size={20} className="text-green-700" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-green-800 mb-1">Owner Replied (Auto-Generated)</p>
                                <p className="text-gray-700 italic">"{reply}"</p>
                            </div>
                        </div>
                    </motion.div>
                )}
                {status === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4"
                    >
                        <div className="flex items-center gap-2 text-red-700 font-bold">
                            <AlertTriangle size={20} />
                            {reply}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
