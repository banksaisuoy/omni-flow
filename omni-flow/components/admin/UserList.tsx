'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MoreVertical, Trash2, Shield, UserCheck, UserX, UserPlus, Mail } from 'lucide-react'
import { toggleUserStatus, deleteUser } from '@/actions/admin-actions'

interface User {
    id: string
    name: string | null
    email: string
    role: string
    status: string
    createdAt: Date
}

export default function UserList({ users: initialUsers }: { users: User[] }) {
    const [users, setUsers] = useState(initialUsers)
    const [searchTerm, setSearchTerm] = useState('')

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u)) // Optimistic
        
        const result = await toggleUserStatus(id, currentStatus)
        if (!result.success) {
            setUsers(users.map(u => u.id === id ? { ...u, status: currentStatus } : u)) // Revert
            alert("Failed to update user status")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Start 'Termination Protocol' for this user? This cannot be undone.")) return

        setUsers(users.filter(u => u.id !== id)) // Optimistic
        const result = await deleteUser(id)
        if (!result.success) {
             setUsers(initialUsers) // Revert (simplified)
             alert("Failed to delete user")
        }
    }

    return (
        <div>
             {/* Search Bar */}
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mb-6 relative group focus-within:border-indigo-500/50 transition-colors">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" />
                <input
                    type="text"
                    placeholder="Search database..."
                    className="bg-transparent w-full pl-10 text-white outline-none placeholder:text-slate-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-4">
                <AnimatePresence>
                    {users.filter(u => 
                        (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') || 
                        u.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((user) => (
                        <motion.div
                            key={user.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-indigo-500/30 transition-all hover:bg-slate-800/30"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-inner
                                    ${user.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'}
                                `}>
                                    {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        {user.name || 'Unknown Agent'}
                                        {user.role === 'ADMIN' && <Shield size={14} className="text-indigo-400" />}
                                    </h3>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border
                                    ${user.status === 'active' ? 'bg-green-500/5 text-green-400 border-green-500/20' : 'bg-red-500/5 text-red-400 border-red-500/20'}
                                `}>
                                    {user.status}
                                </span>
                                
                                <div className="text-right text-sm text-slate-500 hidden md:block">
                                    <p className="text-xs font-bold uppercase text-slate-600">Joined</p>
                                    <p className="text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.location.href = `mailto:${user.email}`}
                                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                        title="Email User"
                                    >
                                        <Mail size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(user.id, user.status)}
                                        className={`p-2 rounded-lg transition-colors ${user.status === 'active' ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-green-500/10 text-slate-400 hover:text-green-400'}`}
                                        title={user.status === 'active' ? 'Suspend' : 'Activate'}
                                    >
                                        {user.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
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
