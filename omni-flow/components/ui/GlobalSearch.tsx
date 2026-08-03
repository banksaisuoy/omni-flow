'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, FileCode2, FileText, FileJson, X, Code, Terminal, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function GlobalSearch({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                if (isOpen) {
                    onClose()
                } else {
                    window.dispatchEvent(new CustomEvent('open-global-search'))
                }
            }
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
            setQuery('')
            setResults([])
            setError(null)
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim() || query.length < 2) {
                setResults([])
                setError(null)
                return
            }

            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
                if (!res.ok) {
                    if (res.status === 403) {
                        setError('Search is disabled in this environment or requires admin access.')
                        setResults([])
                        return
                    }
                    throw new Error('Search failed')
                }
                const data = await res.json()
                setResults(data.results || [])
            } catch (e) {
                console.error(e)
                setError('Failed to execute search. Check console for details.')
            } finally {
                setLoading(false)
            }
        }

        const debounce = setTimeout(fetchResults, 300)
        return () => clearTimeout(debounce)
    }, [query])

    const getFileIcon = (path: string) => {
        if (path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.js') || path.endsWith('.jsx')) {
            return <FileCode2 className="text-blue-400" size={16} />
        }
        if (path.endsWith('.json')) {
            return <FileJson className="text-yellow-400" size={16} />
        }
        return <FileText className="text-slate-400" size={16} />
    }

    const renderSnippet = (snippet: string) => {
        if (!query) return snippet;
        const terms = query.split(' ').filter(Boolean);
        let highlighted = snippet;
        
        terms.forEach(term => {
            const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const regex = new RegExp(`(${escapedTerm})`, 'gi');
            highlighted = highlighted.replace(regex, '<span class="bg-indigo-500/30 text-indigo-200 rounded px-0.5">$1</span>');
        });

        return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-[10%] left-1/2 -translate-x-1/2 w-[90vw] max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-[101] flex flex-col max-h-[80vh]"
                    >
                        {/* Search Input */}
                        <div className="relative border-b border-slate-800 flex-shrink-0 bg-slate-900">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={20} />
                            <input
                                ref={inputRef as React.RefObject<HTMLInputElement>}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search codebase (Admin only)..."
                                className="w-full bg-transparent text-white placeholder-slate-500 pl-12 pr-12 py-4 focus:outline-none text-lg font-medium"
                            />
                            {loading ? (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Results Area */}
                        <div className="overflow-y-auto flex-grow bg-slate-900/50 min-h-[300px]">
                            {error ? (
                                <div className="p-8 text-center text-red-400 flex flex-col items-center justify-center h-full gap-3">
                                    <AlertTriangle size={32} />
                                    <p className="font-medium">{error}</p>
                                </div>
                            ) : !query ? (
                                <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                                    <Code size={48} className="mb-4 opacity-20" />
                                    <p className="font-medium">Search across .ts, .tsx, .md, .json files</p>
                                    <p className="text-sm mt-2 opacity-70">Results appear instantly as you type</p>
                                </div>
                            ) : results.length > 0 ? (
                                <div className="p-2 space-y-1">
                                    {results.map((result, idx) => (
                                        <div
                                            key={idx}
                                            className="group flex flex-col p-3 rounded-xl hover:bg-indigo-500/10 cursor-default transition-colors border border-transparent hover:border-indigo-500/20"
                                        >
                                            <div className="flex items-center gap-2 mb-1.5 text-sm">
                                                {getFileIcon(result.path)}
                                                <span className="text-slate-200 font-semibold truncate group-hover:text-indigo-300 transition-colors">{result.path}</span>
                                            </div>
                                            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                                                <p className="text-xs text-slate-400 font-mono leading-relaxed break-words whitespace-pre-wrap">
                                                    {renderSnippet(result.snippet)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : query.length >= 2 && !loading ? (
                                <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                                    <Terminal size={32} className="mb-3 opacity-20" />
                                    No results found for "{query}"
                                </div>
                            ) : null}
                        </div>
                        
                        {/* Footer */}
                        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md font-mono border border-slate-700 shadow-sm flex items-center gap-1">
                                    <span className="text-[10px]">⌘</span>K
                                </span>
                                <span>to toggle</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md font-mono border border-slate-700 shadow-sm">esc</span>
                                <span>to close</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}