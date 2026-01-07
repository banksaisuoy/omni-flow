'use client'

import { motion } from 'framer-motion'
import { Sparkles, Zap, Globe, Cpu } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <span className="text-indigo-400 font-bold uppercase tracking-widest text-sm bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
                        Our Story
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mt-6 mb-6 tracking-tight">
                        We Are <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">OmniFlow</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Forged in the digital fires of the 22nd century, we bridge the gap between biological desire and synthetic fulfillment.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl font-bold text-white">The Genesis Protocol</h2>
                        <p className="text-slate-400 leading-relaxed">
                            It began with a simple question: What if commerce wasn&apos;t just a transaction, but a transfer of energy? OmniFlow was initialized by the legendary <span className="text-indigo-400">Architect Zero</span> (User ID: 1) to solve the latency of human satisfaction.
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            Using quantum-entangled logistics and AI-driven predictive fulfillment, we ship products before you even realize you want them.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="aspect-video bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 group-hover:opacity-75 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Cpu size={64} className="text-white/20" />
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Zap,
                            title: "Instant Transfer",
                            desc: "Zero-latency delivery protocols ensure your digital assets arrive at the speed of light."
                        },
                        {
                            icon: Globe,
                            title: "Pan-Dimensional",
                            desc: "From Neo-Tokyo to the Lunar Colonies, our network spans the known and unknown sectors."
                        },
                        {
                            icon: Sparkles,
                            title: "AI Curated",
                            desc: "Every item is hand-picked by our sentient algorithm, tailored to your neurological profile."
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            viewport={{ once: true }}
                            className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:bg-slate-800/50 transition-colors"
                        >
                            <item.icon size={32} className="text-indigo-400 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-slate-400">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
