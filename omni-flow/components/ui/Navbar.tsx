'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, Shield, Zap, Search, Menu, X, ArrowRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar({ session }: { session: Session | null }) {
    const pathname = usePathname()
    const isLoginPage = pathname === '/login'
    const { cart, products } = useStore()
    const [searchQuery, setSearchQuery] = useState('')
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    if (pathname.startsWith('/admin') || isLoginPage) return null

    return (
        <>
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
                </div>
            </div>
        </motion.nav>

        {/* Search Overlay */}
        <AnimatePresence>
            {isSearchOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-md"
                >
                    <div className="absolute inset-0" onClick={() => setIsSearchOpen(false)} />
                    
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="relative w-full max-w-3xl glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/10"
                    >
                        <div className="p-6 border-b border-white/10 flex items-center gap-4">
                            <Search className="text-indigo-400" size={24} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search for products, categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder:text-slate-500"
                            />
                            <button
                                onClick={() => setIsSearchOpen(false)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {searchQuery.trim() === '' ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Zap className="mx-auto mb-4 text-slate-600 opacity-50" size={48} />
                                    <p>Start typing to search our catalog</p>
                                </div>
                            ) : (
                                (() => {
                                    const results = products.filter(p => 
                                        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        p.description.toLowerCase().includes(searchQuery.toLowerCase())
                                    );
                                    
                                    if (results.length === 0) {
                                        return (
                                            <div className="text-center py-12 text-slate-500">
                                                <p>No results found for "{searchQuery}"</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {results.map(product => (
                                                <Link
                                                    key={product.id}
                                                    href={`/product/${product.id}`}
                                                    onClick={() => setIsSearchOpen(false)}
                                                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                                                >
                                                    <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                                                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                                                            {product.title}
                                                        </h4>
                                                        <p className="text-sm text-slate-400 truncate">{product.category}</p>
                                                        <div className="mt-1 font-bold text-indigo-300">
                                                            ${(product.flashPrice || product.price).toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="text-slate-600 group-hover:text-indigo-400 mr-2" size={20} />
                                                </Link>
                                            ))}
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        </>
    )
}
