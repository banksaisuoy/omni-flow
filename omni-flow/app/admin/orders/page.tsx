import { prisma } from '@/lib/prisma'
import OrderList from '@/components/admin/OrderList'
import { Package, Clock, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { email: true, name: true }
            },
            items: {
                include: {
                    product: { select: { title: true } }
                }
            }
        }
    })

    const pendingCount = orders.filter(o => o.status === 'PENDING').length
    const paidCount = orders.filter(o => o.status === 'PAID').length
    const shippedCount = orders.filter(o => o.status === 'SHIPPED').length

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Order Command</h1>
                    <p className="text-slate-400">Track shipments, verify slips, and manage fulfillment.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-bold uppercase">Pending Verification</p>
                        <p className="text-2xl font-bold text-white">{pendingCount}</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-bold uppercase">Ready to Ship</p>
                        <p className="text-2xl font-bold text-white">{paidCount}</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-bold uppercase">In Transit</p>
                        <p className="text-2xl font-bold text-white">{shippedCount}</p>
                    </div>
                </div>
            </div>

            <OrderList orders={orders.map(o => ({
                ...o,
                items: o.items.map(i => ({
                    quantity: i.quantity,
                    product: { title: i.product.title }
                }))
            }))} />
        </div>
    )
}
