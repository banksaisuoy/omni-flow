'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Key } from 'lucide-react'

export default function SettingsPage() {
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
                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3">
                                <p className="text-sm text-slate-300 font-mono">Managed by deployment secret</p>
                                <p className="text-xs text-slate-500 mt-1">API keys are never stored or tested in the browser. Configure GOOGLE_GENERATIVE_AI_API_KEY in the deployment platform.</p>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 text-sm mt-2">
                                <CheckCircle size={16} />
                                Runtime configuration is managed outside the application.
                            </div>
                        </div>

                        <div className="divider h-px bg-slate-800 my-4" />

                        <div className="space-y-2 opacity-60">
                            <label className="text-sm font-bold text-slate-400">Supabase URL (Read Only)</label>
                            <input
                                type="text"
                                readOnly
                                value="Configured in deployment environment"
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
