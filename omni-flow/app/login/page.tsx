'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react' // Client side sign in
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Mail, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false, // Handle redirect manually to avoid full page reload flicker if we want
            })

            if (result?.error) {
                setError("Access Denied: Invalid Credentials")
            } else {
                router.push('/admin/dashboard')
            }
        } catch (err: any) {
            setError("System Malfunction")
        } finally {
            setLoading(false)
        }
    }

    const handleMagicLogin = async () => {
        // Dev backdoor for demo if needed, or just a fancy button
        // For now, let's keep it as a secondary option visual
        alert("Magic Link feature coming soon to God Mode!")
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-700" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="glass-panel w-full max-w-md rounded-3xl p-8 relative"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30"
                    >
                        <ShieldCheck className="text-white w-8 h-8" />
                    </motion.div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
                        System Access
                    </h1>
                    <p className="text-slate-400 text-sm">Restricted Area. God Mode functionality.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Identifier</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-12 py-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                                placeholder="admin@omniflow.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Passkey</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-12 py-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)" }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {loading ? 'Authenticating...' : 'Initialize Session'}
                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </span>
                        {/* Shimmer Effect */}
                        <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shimmer" />
                    </motion.button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm mb-4">Or authenticate with</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={handleMagicLogin} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 transition-all group">
                            <Zap className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
