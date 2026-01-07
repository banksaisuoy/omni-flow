'use server'

import { prisma } from '@/lib/prisma'
import { generateObject } from 'ai'
import { z } from 'zod'
import { google } from '@/lib/ai'
import { revalidatePath } from 'next/cache'

// --- Schemas ---
const OrderInputSchema = z.object({
    userId: z.string(),
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number(),
        price: z.number()
    })),
    total: z.number(),
    slipImage: z.string().optional() // Base64
})

const FraudCheckSchema = z.object({
    extractedAmount: z.number().describe("The total amount found on the transfer slip"),
    extractedDate: z.string().describe("The date and time found on the slip"),
    isAmountMatching: z.boolean().describe("True if extractedAmount matches or exceeds expectedTotal"),
    fraudScore: z.number().describe("0-100 score, where 100 is likely fraud. Check for forgery signs."),
    reasoning: z.string().describe("Why this score was given")
})

// --- Actions ---

export async function placeOrder(orderData: any) {
    try {
        const order = await prisma.order.create({
            data: {
                userId: orderData.userId,
                total: orderData.total,
                status: 'PENDING',
                slipImage: orderData.slipImage, // In prod, upload to storage
                items: {
                    create: orderData.items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        })

        // Trigger Async Fraud Check if slip exists
        if (orderData.slipImage) {
            // We don't await this so the UI is fast. Fire and forget (or queue).
            // For this demo, we await to show the result instantly.
            await verifyPaymentSlip(order.id, orderData.slipImage, orderData.total)
        }

        revalidatePath('/admin/orders')
        return { success: true, orderId: order.id }

    } catch (error) {
        console.error("Order Error:", error)
        return { success: false, error: 'Failed to place order' }
    }
}

export async function verifyPaymentSlip(orderId: string, slipBase64: string, expectedTotal: number) {
    try {
        const { object } = await generateObject({
            model: google('models/gemini-1.5-flash-latest'),
            schema: FraudCheckSchema,
            messages: [
                {
                    role: 'user', content: [
                        {
                            type: 'text', text: `Analyze this bank transfer slip. The expected amount is ${expectedTotal}. 
                  Check for:
                  1. Does the amount match?
                  2. Does the date look recent?
                  3. Any signs of Photoshop/Forgery?
                  Return a JSON assessment.`
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
        await prisma.order.update({
            where: { id: orderId },
            data: { status: status as any } // Cast to fit enum if strict
        })
        revalidatePath('/admin/orders')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update order status' }
    }
}
