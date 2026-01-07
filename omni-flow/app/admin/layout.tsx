'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Users,
    Settings,
    ShoppingBag,
    LogOut,
    Cpu,
    Menu,
    X,
    Shield,
    Package
} from 'lucide-react'

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Command Center', href: '/admin/dashboard' },
    { icon: Users, label: 'User Management', href: '/admin/users' },
    { icon: ShoppingBag, label: 'Products & Sales', href: '/admin/products' },
    { icon: Package, label: 'Orders', href: '/admin/orders' },
    { icon: Settings, label: 'System Settings', href: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex overflow-hidden font-sans">
            {/* Sidebar */}
            <motion.aside
                initial={{ width: 280 }}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="bg-slate-900 border-r border-slate-800 flex-shrink-0 relative z-20 hidden md:flex flex-col"
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800">
                    <div className="flex items-center gap-3 text-indigo-400">
                        <Shield className="w-8 h-8" />
                        {isSidebarOpen && (
                            <span className="font-bold text-xl tracking-wider text-white neon-text">
                                OMNI<span className="text-indigo-500">FLOW</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-8 px-4 space-y-2">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={`
                                    flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                                        : 'hover:bg-slate-800 hover:text-white text-slate-400'}
                                `}>
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'group-hover:text-indigo-400 transition-colors'}`} />
                                    {isSidebarOpen && (
                                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                                    )}
                                    {isActive && isSidebarOpen && (
                                        <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_currentColor]" />
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer / User */}
                <div className="p-4 border-t border-slate-800">
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800 ${!isSidebarOpen && 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            AD
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">Admin User</p>
                                <p className="text-xs text-indigo-400">God Mode Active</p>
                            </div>
                        )}
                        {isSidebarOpen && (
                            <button className="text-slate-500 hover:text-red-400 transition-colors">
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Nav Toggle (Optional implementation detail) */}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative bg-[url('/grid.svg')]">
                {/* Top Bar */}
                <header className="h-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-mono text-slate-500">SYSTEM STATUS</h2>
                        <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            OPERATIONAL
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all">
                            <Cpu size={20} />
                        </button>
                    </div>
                </header>

                <div className="p-8 pb-32">
                    {children}
                </div>
            </main>
        </div>
    )
}
