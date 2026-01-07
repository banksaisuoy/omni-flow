import { Suspense } from 'react'
import DashboardStats from '@/components/admin/DashboardStats'
import AiAnalystChat from '@/components/admin/AiAnalystChat'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">God Mode Dashboard</h1>
                    <p className="text-slate-400">System Overview & Intelligence</p>
                </div>
                <div className="flex gap-4">
                    <a href="/" className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
                        View Store
                    </a>
                    <a href="/admin/products/add" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
                        + Add Product
                    </a>
                </div>
            </div>

            {/* AI Analyst Section */}
            <AiAnalystChat />

            {/* Stats Grid - Server Component with real data */}
            <Suspense fallback={<div className="text-slate-500 text-center py-8">Loading stats...</div>}>
                <DashboardStats />
            </Suspense>
        </div>
    )
}
