import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const userEmail = session.user.email

    // Fetch orders
    const orders = await prisma.order.findMany({
        where: {
            user: {
                email: userEmail!
            }
        },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Account Details</h2>
                    <div className="space-y-2 text-slate-600">
                        <p><span className="font-medium text-slate-900">Name:</span> {session.user.name}</p>
                        <p><span className="font-medium text-slate-900">Email:</span> {session.user.email}</p>
                        <p><span className="font-medium text-slate-900">Role:</span> {session.user.role || 'User'}</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-6">Order History</h2>

                {orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <p className="text-slate-500">You haven't placed any orders yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Order #{order.id.slice(0, 8)}</p>
                                        <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-slate-900">${order.total.toFixed(2)}</p>
                                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-bold ${order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-slate-100 text-slate-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-md overflow-hidden">
                                                    {/* Ideally display image here */}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{item.product.title}</p>
                                                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-medium text-slate-900">${item.price.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
