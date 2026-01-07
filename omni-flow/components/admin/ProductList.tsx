'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Zap, Star, Pin } from 'lucide-react'
import { toggleProductPin, toggleProductFlashSale } from '@/actions/product-actions'

interface Product {
    id: string
    title: string
    category: string
    price: number
    views: number
    images: string[]
    isFlashSale: boolean
    flashPrice?: number | null
    isPinned: boolean
}

export default function ProductList({ products: initialProducts }: { products: Product[] }) {
    const [products, setProducts] = useState(initialProducts)
    const [searchTerm, setSearchTerm] = useState('')

    const handleTogglePin = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setProducts(products.map(p => p.id === id ? { ...p, isPinned: !currentStatus } : p))

        const result = await toggleProductPin(id, !currentStatus)
        if (!result.success) {
            // Revert on failure
            setProducts(products.map(p => p.id === id ? { ...p, isPinned: currentStatus } : p))
            alert("Failed to update pin")
        }
    }

    const handleToggleFlashSale = async (id: string, currentStatus: boolean, price?: number | null) => {
        const newStatus = !currentStatus
        // Optimistic update
        setProducts(products.map(p => p.id === id ? { ...p, isFlashSale: newStatus } : p))

        const result = await toggleProductFlashSale(id, newStatus, price || undefined)
        if (!result.success) {
            // Revert
            setProducts(products.map(p => p.id === id ? { ...p, isFlashSale: currentStatus } : p))
            alert("Failed to update flash sale")
        }
    }

    const handleUpdateFlashPrice = async (id: string, price: number) => {
        // Optimistic update
        setProducts(products.map(p => p.id === id ? { ...p, flashPrice: price } : p))

        // Debouncing could be good here, but for now direct update on blur/enter would be better or just rely on the toggle to save strictly? 
        // Actually, let's just save it.
        const product = products.find(p => p.id === id)
        // If the product is ON sale, update the DB immediately too
        if (product && product.isFlashSale) {
            await toggleProductFlashSale(id, true, price)
        }
    }


    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                    <Search className="text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Find products..."
                        className="bg-transparent w-full text-white outline-none placeholder:text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="divide-y divide-slate-800">
                <AnimatePresence>
                    {products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
                        <motion.div
                            key={product.id}
                            layout
                            className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-xs font-mono text-slate-500 overflow-hidden">
                                    {product.images && product.images[0] ? (
                                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                        "IMG"
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                        {product.title}
                                        {product.isPinned && <Star size={16} className="text-pink-400 fill-pink-400" />}
                                    </h3>
                                    <p className="text-slate-500 text-sm">{product.category} • {product.views} views</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                {/* Pricing / Flash Sale logic */}
                                {product.isFlashSale ? (
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-2 text-yellow-400 font-bold">
                                            <Zap size={14} fill="currentColor" />
                                            <input
                                                type="number"
                                                defaultValue={product.flashPrice || 0}
                                                onBlur={(e) => handleUpdateFlashPrice(product.id, parseFloat(e.target.value))}
                                                className="w-20 bg-yellow-500/10 border border-yellow-500/30 rounded px-2 py-1 text-right outline-none focus:border-yellow-500"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 line-through">${product.price}</p>
                                    </div>
                                ) : (
                                    <div className="text-right font-bold text-white">
                                        ${product.price}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleFlashSale(product.id, product.isFlashSale, product.flashPrice)}
                                        className={`p-2 rounded-lg transition-colors border ${product.isFlashSale ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' : 'border-transparent text-slate-500 hover:bg-slate-800 hover:text-white'}`}
                                        title="Toggle Flash Sale"
                                    >
                                        <Zap size={20} fill={product.isFlashSale ? "currentColor" : "none"} />
                                    </button>
                                    <button
                                        onClick={() => handleTogglePin(product.id, product.isPinned)}
                                        className={`p-2 rounded-lg transition-colors border ${product.isPinned ? 'bg-pink-500/10 border-pink-500/50 text-pink-400' : 'border-transparent text-slate-500 hover:bg-slate-800 hover:text-white'}`}
                                        title="Pin Product"
                                    >
                                        <Pin size={20} fill={product.isPinned ? "currentColor" : "none"} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
