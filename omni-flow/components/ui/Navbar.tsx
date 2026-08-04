'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, User, Shield, Zap, Search, Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { useStore } from '@/lib/store'

import { Session } from "next-auth"

export default function Navbar({ session }: { session: Session | null }) {
    const pathname = usePathname()
    const isLoginPage = pathname === '/login'
    const { cart } = useStore()
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    // Check if user is admin
    const isAdmin = (session?.user as any)?.role === 'ADMIN'

    // Don't show public navbar on Admin routes or Login
    if (pathname.startsWith('/admin') || isLoginPage) return null

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
            <div className="glass-panel pointer-events-auto rounded-full px-6 md:px-8 py-4 flex items-center justify-between gap-4 md:gap-8 min-w-[320px] md:min-w-[600px] backdrop-blur-xl border border-white/10">
                {/* Logo */}
                <Link href="/" className="flex-shrink-0">
                    <div className="font-bold text-lg flex items-center gap-2 group">
                        <div className="relative">
                            <Zap className="text-indigo-400 fill-indigo-400 group-hover:text-indigo-300 transition-colors" />
                            <div className="absolute inset-0 blur-md bg-indigo-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-white tracking-widest">OMNI<span className="text-indigo-500">FLOW</span></span>
                    </div>
                </Link>

                {/* Center Links */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
                        Shop
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300" />
                    </Link>
                    <Link href="/categories" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
                        Categories
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300" />
                    </Link>
                    {isAdmin && (
                        <Link href="/admin/dashboard" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                            <Shield size={14} />
                            Admin
                        </Link>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Search Button */}
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <Search size={18} />
                    </button>

                    {/* Cart */}
                    <Link href="/cart">
                        <button className="relative p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                            <ShoppingCart size={18} />
                            {cartCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </button>
                    </Link>

                    {/* User / Login */}
                    {session?.user ? (
                        <Link href="/profile">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white border-2 border-indigo-400/30 hover:border-white/50 transition-all shadow-lg shadow-indigo-500/20">
                                {session.user.image ? (
                                    <img src={session.user.image} alt={session.user.name || "User"} className="rounded-full w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-sm">
                                        {session.user.name?.[0]?.toUpperCase() || "U"}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                                Login
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </motion.nav>
    )
}
