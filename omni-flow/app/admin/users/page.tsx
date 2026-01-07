import { prisma } from '@/lib/prisma'
import UserList from '@/components/admin/UserList'
import { UserPlus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                    <p className="text-slate-400">Total Database Population: {users.length}</p>
                </div>
                {/* 
                  Future AI Feature: "Summon User" could be an AI Generator creating fake users for testing 
                  or an invite system. For now, it's a visual placeholder.
                */}
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-indigo-500/20 transition-all">
                    <UserPlus size={18} />
                    <span>Invite User</span>
                </button>
            </div>

            <UserList users={users.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                status: u.status,
                createdAt: u.createdAt
            }))} />
        </div>
    )
}
