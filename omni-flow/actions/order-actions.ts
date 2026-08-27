'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { generateObject } from 'ai'
import { z } from 'zod'
import { google } from '@/lib/ai'
import { revalidatePath } from 'next/cache'

// --- Schemas ---
const OrderInputSchema = z.object({
    // userId/price/total may still be sent by the existing client, but are never trusted.
    userId: z.string().optional(),
    items: z.array(z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(999),
        price: z.number().finite().nonnegative().optional()
    })).min(1).max(100),
    total: z.number().finite().nonnegative().optional(),
    slipImage: z.string().max(8_000_000).optional() // Base64
})

const FraudCheckSchema = z.object({
    extractedAmount: z.number().describe("The total amount found on the transfer slip"),
    extractedDate: z.string().describe("The date and time found on the slip"),
    isAmountMatching: z.boolean().describe("True if extractedAmount matches or exceeds expectedTotal"),
    fraudScore: z.number().describe("0-100 score, where 100 is likely fraud. Check for forgery signs."),
    reasoning: z.string().describe("Why this score was given")
})

// --- Actions ---

export async function placeOrder(orderData: unknown) {
    try {
        const session = await auth()
        const userId = session?.user?.id
        if (!userId) return { success: false, error: 'กรุณาเข้าสู่ระบบก่อนสั่งซื้อ' }

        const input = OrderInputSchema.parse(orderData)
        const quantities = new Map<string, number>()
        for (const item of input.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity)
        const productIds = Array.from(quantities.keys())

        const order = await prisma.$transaction(async (tx) => {
            const products = await tx.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, price: true, stock: true, isFlashSale: true, flashPrice: true },
            })
            if (products.length !== productIds.length) throw new Error('สินค้าบางรายการไม่พบในระบบ')
            const productMap = new Map(products.map((p) => [p.id, p]))
            const items = productIds.map((productId) => {
                const product = productMap.get(productId)!
                const quantity = quantities.get(productId)!
                const unitPrice = product.isFlashSale && product.flashPrice != null ? product.flashPrice : product.price
                return { productId, quantity, price: unitPrice, lineTotal: unitPrice * quantity, stock: product.stock }
            })
            for (const item of items) {
                const updated = await tx.product.updateMany({
                    where: { id: item.productId, stock: { gte: item.quantity } },
                    data: { stock: { decrement: item.quantity } },
                })
                if (updated.count !== 1) throw new Error('สินค้าในตะกร้ามีจำนวนไม่พอ')
            }
            const total = items.reduce((sum, item) => sum + item.lineTotal, 0)
            return tx.order.create({
                data: {
                    userId,
                    total,
                    status: 'PENDING',
                    slipImage: input.slipImage, // In prod, upload to storage
                    items: { create: items.map(({ productId, quantity, price }) => ({ productId, quantity, price })) },
                },
            })
        })

        if (input.slipImage) await verifyPaymentSlip(order.id, input.slipImage, order.total)
        revalidatePath('/admin/orders')
        return { success: true, orderId: order.id }
    } catch (error) {
        console.error('Order Error:', error)
        return { success: false, error: error instanceof z.ZodError ? 'ข้อมูลคำสั่งซื้อไม่ถูกต้อง' : 'ไม่สามารถสร้างคำสั่งซื้อได้' }
    }
}

export async function verifyPaymentSlip(orderId: string, slipBase64: string, expectedTotal?: number) {
    try {
        const session = await auth()
        if (!session?.user?.id) return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }
        const order = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true, total: true } })
        const isAdmin = String(session.user.role || '').toUpperCase() === 'ADMIN'
        if (!order || (!isAdmin && order.userId !== session.user.id)) return { success: false, error: 'ไม่พบคำสั่งซื้อ' }
        const verifiedTotal = order.total

        const { object } = await generateObject({
            model: google('models/gemini-1.5-flash-latest'),
            schema: FraudCheckSchema,
            messages: [
                {
                    role: 'user', content: [
                        {
                            type: 'text',
                            text: `Analyze this bank transfer slip. The expected amount is ${verifiedTotal}.
Check for:
1. Does the amount match?
2. Does the date look recent?
3. Any signs of Photoshop/Forgery?
Return a JSON assessment.`,
                        },
                        { type: 'image', image: slipBase64 }
                    ]
                }
            ]
        })

        // Update Order with Fraud Status
        await prisma.order.update({
            where: { id: orderId },
            data: {
                isVerified: object.isAmountMatching && object.fraudScore < 20,
                // In a real app we would store the fraud score/reasoning in a separate table or JSON field
            }
        })

        // Log AI Diagnosis (Module G: System Health)
        if (!object.isAmountMatching || object.fraudScore > 50) {
            await prisma.systemLog.create({
                data: {
                    level: "WARN",
                    message: `Possible Fraud Detected on Order ${orderId}`,
                    aiDiagnosis: object.reasoning
                }
            })
        }

        return { success: true, analysis: object }

    } catch (error) {
        console.error("Fraud Check Error:", error)
        return { success: false, error: "AI Verification Failed" }
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        const session = await auth()
        const role = String(session?.user?.role || '').toUpperCase()
        if (!session?.user?.id || !['ADMIN', 'SELLER'].includes(role)) {
            return { success: false, error: 'ไม่มีสิทธิ์เปลี่ยนสถานะคำสั่งซื้อ' }
        }
        const statusValue = z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']).parse(status)
        await prisma.order.update({ where: { id: orderId }, data: { status: statusValue } })
        revalidatePath('/admin/orders')
        return { success: true }
    } catch (error) {
        console.error('Order status error:', error)
        return { success: false, error: 'ไม่สามารถเปลี่ยนสถานะคำสั่งซื้อได้' }
    }
}
