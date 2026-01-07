import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Star, MessageSquare, Send, ShieldCheck, AlertTriangle } from 'lucide-react'
import { submitReviewAction } from '@/app/actions/review'
import { motion, AnimatePresence } from 'framer-motion'
import ReviewSection from '@/components/ReviewSection' // Extract client part if needed, or keep page server side

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Fetch Real Product
    const product = await prisma.product.findUnique({
        where: { id }
    })

    if (!product) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-white pt-20">
            {/* Product Header */}
            <div className="h-96 relative bg-slate-900 overflow-hidden">
                <img
                    src={product.images[0] || "/placeholder.jpg"}
                    alt={product.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />

                <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
                    <span className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-2">{product.category}</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{product.title}</h1>
                    <p className="text-xl text-slate-300 max-w-2xl line-clamp-2">{product.description}</p>
                    <div className="mt-6 flex items-center gap-6">
                        <span className="text-4xl font-bold text-white">${product.price}</span>
                        <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Description */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="prose prose-lg text-slate-600">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">About this item</h3>
                        <p>{product.description}</p>
                    </div>

                    {/* AI Review Section (Client Component) */}
                    <ReviewSection productId={product.id} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4">Delivery & Returns</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="text-green-600 mt-1" />
                                <div>
                                    <p className="font-bold text-sm">Authenticity Guarantee</p>
                                    <p className="text-xs text-slate-500">Verified by our experts</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-slate-400 mt-1" />
                                <div>
                                    <p className="font-bold text-sm">Return Policy</p>
                                    <p className="text-xs text-slate-500">30-day money back guarantee</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
