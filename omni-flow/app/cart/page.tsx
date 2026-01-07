'use client'

import { placeOrder } from '@/actions/order-actions'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ArrowRight, Zap, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart, createOrder } = useStore()
    const router = useRouter()
    const total = getCartTotal()

    const handleCheckout = async () => {
        if (cart.length === 0) return

        // Create Order (Database)
        const result = await placeOrder({
            userId: "user-123-demo-id", // Hardcoded for simplified flow, ideally comes from auth() session
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.isFlashSale ? (item.flashPrice || item.price) : item.price
            })),
            total: total,
            // slipImage: "base64..." - In a full flow, we'd have a file upload step here. 
            // For now, we omit it to just test Order Creation, or we could add a fake one for testing fraud.
        })

        if (result.success) {
            // Clear Cart
            clearCart()
            alert("Payment Successful! Order #" + result.orderId + " has been placed.")
            router.push('/products')
        } else {
            alert("Order Failed: " + result.error)
        }
    }

    return (
        <div className="min-h-screen p-6 md:p-12 pb-24 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <ShoppingBag className="text-indigo-400" />
                Shopping Cart
            </h1>

            {cart.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl">
                    <p className="text-slate-500 mb-6">Your cart is empty.</p>
                    <Link href="/products">
                        <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors">
                            Browse Shop
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <AnimatePresence>
                            {cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center gap-4"
                                >
                                    <div className="w-20 h-20 bg-slate-950 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white line-clamp-1">{item.title}</h3>
                                        <p className="text-xs text-slate-500 mb-2">{item.category}</p>
                                        <div className="flex items-center gap-2">
                                            {item.isFlashSale ? (
                                                <>
                                                    <span className="text-yellow-400 font-bold">${item.flashPrice}</span>
                                                    <span className="text-xs text-slate-500 line-through">${item.price}</span>
                                                </>
                                            ) : (
                                                <span className="text-indigo-400 font-bold">${item.price}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-slate-950 rounded-lg p-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="text-sm w-4 text-center font-bold text-white">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-2 hover:bg-red-500/10 hover:text-red-500 text-slate-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary */}
                    <div className="h-fit space-y-6">
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
                            <h3 className="font-bold text-white mb-6">Order Summary</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-slate-400 text-sm">
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400 text-sm">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="pt-3 border-t border-slate-800 flex justify-between text-white font-bold text-lg">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                            >
                                Checkout
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-3">
                            <Zap className="text-indigo-400 flex-shrink-0 mt-1" size={18} />
                            <div>
                                <h4 className="font-bold text-indigo-300 text-sm">Instant Delivery</h4>
                                <p className="text-xs text-indigo-400/70">Your digital assets will be available immediately after payment.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
