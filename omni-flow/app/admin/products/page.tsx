import { prisma } from '@/lib/prisma'
import ProductList from '@/components/admin/ProductList'
import { Zap, Star, Tag } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    })

    const totalProducts = products.length
    const activeFlashSales = products.filter(p => p.isFlashSale).length
    const pinnedItems = products.filter(p => p.isPinned).length

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Product Operations</h1>
                    <p className="text-slate-400">Manage catalog, flash sales, and featured items.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <Tag size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-bold uppercase">Total SKUs</p>
                        <p className="text-2xl font-bold text-white">{totalProducts}</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-bold uppercase">Active Flash Sales</p>
                        <p className="text-2xl font-bold text-white">{activeFlashSales}</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400">
                        <Star size={24} fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-bold uppercase">Pinned Items</p>
                        <p className="text-2xl font-bold text-white">{pinnedItems}</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <ProductList products={products} />
        </div>
    )
}
