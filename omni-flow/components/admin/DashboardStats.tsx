import { prisma } from '@/lib/prisma'
import { DollarSign, Users, Activity } from 'lucide-react'

export default async function DashboardStats() {
    // Fetch real stats from database
    const [totalRevenue, totalUsers, activeOrders] = await Promise.all([
        prisma.order.aggregate({
            _sum: { total: true },
            where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } }
        }),
        prisma.user.count(),
        prisma.order.count({ where: { status: { in: ['PENDING', 'PAID', 'SHIPPED'] } } })
    ])

    const revenue = totalRevenue._sum.total || 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 hover:border-green-500/20 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-500/10 rounded-xl">
                        <DollarSign className="text-green-400" />
                    </div>
                    <span className="text-green-400 text-sm font-bold">Live</span>
                </div>
                <h3 className="text-slate-400 text-sm">Total Revenue</h3>
                <p className="text-2xl font-bold text-white">${revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 hover:border-blue-500/20 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <Users className="text-blue-400" />
                    </div>
                    <span className="text-blue-400 text-sm font-bold">All Time</span>
                </div>
                <h3 className="text-slate-400 text-sm">Registered Users</h3>
                <p className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/20 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <Activity className="text-indigo-400" />
                    </div>
                    <span className="text-indigo-400 text-sm font-bold">Active</span>
                </div>
                <h3 className="text-slate-400 text-sm">Pending Orders</h3>
                <p className="text-2xl font-bold text-white">{activeOrders}</p>
            </div>
        </div>
    )
}
