'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingCart, Filter, Sparkles, Tag } from 'lucide-react'
import { smartSearchProducts } from '@/actions/search-actions'
import { useStore } from '@/lib/store' // Keep for Cart actions
import Link from 'next/link'

export default function ShopPage() {
    const { addToCart } = useStore()
    const [query, setQuery] = useState('')
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [aiContext, setAiContext] = useState<any>(null)

    // Initial Load
    useEffect(() => {
        handleSearch('')
    }, [])

    const handleSearch = async (term: string) => {
        setLoading(true)
        // Debounce could be added here in a real app
        const result = await smartSearchProducts(term)
        if (result.success) {
            setProducts(result.results)
            setAiContext(result.aiContext)
        }
        setLoading(false)
    }

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleSearch(query)
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
                        OmniFlow Market
                    </h1>
                    <p className="text-slate-400">Next-Gen Shopping Experience</p>
                </div>

                <form onSubmit={onSearchSubmit} className="relative w-full md:w-96 group z-10">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-100 transition duration-500 blur" />
                    <div className="relative flex items-center bg-slate-900 rounded-xl overflow-hidden">
                        <Search className="ml-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search... (e.g., 'Cheap gaming mouse')"
                            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 py-4 px-3"
                        />
                        <button type="submit" disabled={loading} className="px-6 h-full bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-medium transition-colors">
                            {loading ? 'Thinking...' : 'Go'}
                        </button>
                    </div>
                </form>
            </div>

            {/* AI Insights (If Search Active) */}
            <AnimatePresence>
                {aiContext && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-8 overflow-hidden"
                    >
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-4">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <Sparkles className="text-indigo-400 w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-indigo-300 text-sm uppercase tracking-wider mb-1">AI Search Logic</h4>
                                <p className="text-slate-300 text-sm italic">"{aiContext.aiReasoning}"</p>
                                <div className="flex gap-2 mt-2">
                                    {aiContext.keywords?.map((kw: string) => (
                                        <span key={kw} className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-md">#{kw}</span>
                                    ))}
                                    {aiContext.maxPrice && (
                                        <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-md">Max: ${aiContext.maxPrice}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Products Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-[3/4] bg-slate-900/50 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -10 }}
                            className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800/50 overflow-hidden group hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
                        >
                            <Link href={`/product/${product.id}`}>
                                <div className="aspect-square relative overflow-hidden bg-slate-800">
                                    {product.images && product.images[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">
                                        {product.category}
                                    </div>
                                </div>
                            </Link>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <Link href={`/product/${product.id}`} className="hover:text-indigo-400 transition-colors">
                                        <h3 className="font-bold text-lg text-white line-clamp-1">{product.title}</h3>
                                    </Link>
                                </div>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-2xl font-bold text-white">${product.price}</span>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="w-12 h-12 rounded-full bg-slate-800 hover:bg-indigo-600 text-white flex items-center justify-center transition-all group/btn"
                                    >
                                        <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 text-slate-500">
                    <p className="text-xl">No products found matching your search.</p>
                </div>
            )}
        </div>
    )
}
