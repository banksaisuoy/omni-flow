'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, CheckCircle, Clock, Truck, Package, AlertTriangle } from 'lucide-react'
import { updateOrderStatus } from '@/actions/order-actions'

interface Order {
    id: string
    user: { email: string; name: string | null }
    total: number
    status: string
    isVerified: boolean
    createdAt: Date
    items: { quantity: number; product: { title: string } }[]
}

const statusColors: any = {
    PENDING: 'bg-yellow-500/10 text-yellow-500',
    PAID: 'bg-blue-500/10 text-blue-500',
    SHIPPED: 'bg-indigo-500/10 text-indigo-500',
    DELIVERED: 'bg-green-500/10 text-green-500',
    CANCELLED: 'bg-red-500/10 text-red-500'
}

const statusIcons: any = {
    PENDING: Clock,
    PAID: CheckCircle,
    SHIPPED: Truck,
    DELIVERED: Package,
    CANCELLED: AlertTriangle
}

export default function OrderList({ orders: initialOrders }: { orders: Order[] }) {
    const [orders, setOrders] = useState(initialOrders)
    const [searchTerm, setSearchTerm] = useState('')

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        const result = await updateOrderStatus(id, newStatus)
        if (result.success) {
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o))
        } else {
            alert('Failed to update status')
        }
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                    <Search className="text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="bg-transparent w-full text-white outline-none placeholder:text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="divide-y divide-slate-800">
                {orders.filter(o => o.id.includes(searchTerm) || o.user.email.includes(searchTerm)).map((order) => {
                    const StatusIcon = statusIcons[order.status] || Clock

                    return (
                        <div key={order.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`p-3 rounded-xl ${statusColors[order.status]}`}>
                                    <StatusIcon size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-white">#{order.id.slice(0, 8)}</p>
                                    <p className="text-sm text-slate-500">{order.user.email}</p>
                                    <p className="text-xs text-slate-600">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-1 gap-4 items-center justify-center md:justify-start">
                                <div className="text-center md:text-left">
                                    <p className="text-xs text-slate-500 uppercase font-bold">Total</p>
                                    <p className="text-white font-bold">${order.total}</p>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-xs text-slate-500 uppercase font-bold">Items</p>
                                    <p className="text-white">{order.items.length}</p>
                                </div>
                                {order.isVerified ? (
                                    <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded-full border border-green-500/20">Verified</span>
                                ) : order.status === 'PENDING' ? (
                                    <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-1 rounded-full border border-yellow-500/20">Unverified</span>
                                ) : null}
                            </div>

                            <div className="relative group">
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                    className="appearance-none bg-slate-950 border border-slate-700 text-white pl-4 pr-10 py-2 rounded-xl focus:border-indigo-500 outline-none cursor-pointer"
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="PAID">Paid</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
