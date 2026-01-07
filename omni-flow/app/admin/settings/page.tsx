'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, RefreshCw, CheckCircle, AlertTriangle, Key } from 'lucide-react'

export default function SettingsPage() {
    const [googleKey, setGoogleKey] = useState('')
    const [supabaseUrl, setSupabaseUrl] = useState('')
    const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')

    // Simulate loading existing keys (in reality these are server-side envs, so we might mask them)
    useEffect(() => {
        setGoogleKey('AIzaSyC-***************************')
    }, [])

    const handleSave = () => {
        setStatus('checking')
        // Mock verification process
        setTimeout(() => {
            setStatus('valid')
        }, 1500)
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">System Configuration</h1>
            <p className="text-slate-400 mb-8">Manage critical system parameters and API connections.</p>

            <div className="space-y-6">
                {/* API Key Section */}
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Key size={100} />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Key className="text-indigo-400" />
                        API Keys & Connections
                    </h2>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400">Google Gemini API Key</label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={googleKey}
                                    onChange={(e) => {
                                        setGoogleKey(e.target.value)
                                        setStatus('idle')
                                    }}
                                    className="flex-1 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono focus:border-indigo-500 outline-none transition-colors"
                                    placeholder="AIza..."
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={status === 'checking'}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {status === 'checking' ? <RefreshCw className="animate-spin" /> : <Save size={18} />}
                                    Save & Test
                                </button>
                            </div>

                            {/* Validation Status */}
                            {status === 'valid' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-green-400 text-sm font-bold mt-2"
                                >
                                    <CheckCircle size={16} />
                                    Connection Validated. AI Services Operational.
                                </motion.div>
                            )}
                            {status === 'invalid' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-red-400 text-sm font-bold mt-2"
                                >
                                    <AlertTriangle size={16} />
                                    Connection Failed. Invalid API Key.
                                </motion.div>
                            )}
                        </div>

                        <div className="divider h-px bg-slate-800 my-4" />

                        <div className="space-y-2 opacity-60">
                            <label className="text-sm font-bold text-slate-400">Supabase URL (Read Only)</label>
                            <input
                                type="text"
                                readOnly
                                value="https://placeholder.supabase.co"
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 font-mono cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Site Config Section */}
                <div className="glass-panel p-8 rounded-3xl">
                    <h2 className="text-xl font-bold text-white mb-6">Interface Customization</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-indigo-500 bg-indigo-500/10 cursor-pointer relative overflow-hidden">
                            <h3 className="font-bold text-white mb-1">God Mode (Dark)</h3>
                            <p className="text-xs text-indigo-300">Premium neon aesthetics</p>
                            <div className="absolute top-2 right-2 text-indigo-400">
                                <CheckCircle size={20} />
                            </div>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/20 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                            <h3 className="font-bold text-white mb-1">Corporate (Light)</h3>
                            <p className="text-xs text-slate-400">Standard business aesthetics</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
