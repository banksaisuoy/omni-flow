'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function FlashSaleCard() {
    const [stock, setStock] = useState(15) // Initial Stock
    const [timeLeft, setTimeLeft] = useState({ h: 2, m: 14, s: 59 })

    // Realtime Stock Logic
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel('flash-sale-stock')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
                // In real app, filter by ID. Demo: just update stock randomly or decrease
                if (payload.new.stock < stock) {
                    setStock(payload.new.stock)
                }
            })
            .subscribe()

        // Fake ticker for demo effect if no real DB updates happen
        const interval = setInterval(() => {
            if (Math.random() > 0.7) setStock(prev => Math.max(0, prev - 1))
        }, 3000)

        return () => {
            supabase.removeChannel(channel)
            clearInterval(interval)
        }
    }, [])

    // Countdown Logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.s > 0) return { ...prev, s: prev.s - 1 }
                if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 }
                if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 }
                return prev
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const percentage = (stock / 20) * 100

    return (
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-br-lg z-10 flex items-center gap-1">
                <Zap size={12} fill="currentColor" /> FLASH SALE
            </div>

            <div className="p-4">
                <div className="h-40 bg-gray-100 rounded-lg mb-4 relative overflow-hidden group">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" alt="Nike Shoe" />
                </div>

                <h3 className="font-bold text-gray-900 leading-tight">Nike Air Max 270 - Special Edition</h3>

                <div className="flex items-end gap-2 mt-2">
                    <span className="text-xl font-bold text-red-600">$120</span>
                    <span className="text-sm text-gray-400 line-through mb-1">$210</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                    <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-orange-600">Going fast!</span>
                        <span className="text-gray-500">{stock} left</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
                            initial={{ width: '100%' }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ type: 'spring' }}
                        />
                    </div>
                </div>

                {/* Timer */}
                <div className="mt-4 flex items-center gap-2 justify-center bg-gray-900 text-white py-2 rounded-lg text-sm font-mono tracking-widest">
                    <Clock size={16} className="text-orange-400" />
                    {timeLeft.h.toString().padStart(2, '0')}:{timeLeft.m.toString().padStart(2, '0')}:{timeLeft.s.toString().padStart(2, '0')}
                </div>
            </div>
        </div>
    )
}
