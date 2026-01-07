'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { visualSearchAction } from '@/app/actions/search'

export default function VisualSearch() {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsAnalyzing(true)

        try {
            const formData = new FormData()
            formData.append('image', file)

            const result = await visualSearchAction(formData)

            // Store results temporarily for the demo (in prod uses global state/server cache)
            sessionStorage.setItem('visualSearchResults', JSON.stringify(result.products))
            sessionStorage.setItem('visualSearchQuery', result.description)

            router.push('/search?source=visual')
        } catch (error) {
            console.error(error)
            alert('Failed to analyze image. Please try again.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="relative w-full max-w-md mx-auto z-50">
            <div className="relative flex items-center w-full h-12 rounded-full border-2 border-gray-200 bg-white overflow-hidden shadow-sm focus-within:border-primary transition-colors">
                <div className="pl-4 text-gray-400">
                    <Search size={20} />
                </div>

                <input
                    type="text"
                    placeholder="Snap a photo to shop..."
                    className="flex-1 h-full px-3 outline-none text-sm text-gray-700 placeholder:text-gray-400"
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="h-full px-4 flex items-center justify-center text-primary hover:bg-gray-50 transition-colors border-l border-gray-100"
                    disabled={isAnalyzing}
                    title="Snap to Shop"
                >
                    {isAnalyzing ? (
                        <Loader2 className="animate-spin text-primary" size={20} />
                    ) : (
                        <Camera size={20} />
                    )}
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
            />

            <AnimatePresence>
                {isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-14 left-0 right-0 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
                                <Camera size={20} className="text-indigo-600 relative z-10" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">Gemini Vision is analyzing...</p>
                            <div className="h-1 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                                <motion.div
                                    className="h-full bg-indigo-600 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
