'use server'

import { prisma } from '@/lib/prisma'
import { generateText } from 'ai'
import { google } from '@/lib/ai'

export async function askBusinessAnalyst(question: string) {
    // 1. Gather Context (RAG-lite)
    // Fetch key stats to feed the AI
    const totalRevenue = await prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'PAID' }
    })

    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    })

    const productStats = await prisma.product.count()

    const systemHealth = await prisma.systemLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    })

    // 2. Ask Gemini
    const { text } = await generateText({
        model: google('models/gemini-1.5-flash'),
        system: `You are the Chief Business Intelligence Officer for OmniFlow. 
      You have access to the latest database stats.
      Answer the user's question concisely and professionally.
      
      Current Data:
      - Total Revenue: $${totalRevenue._sum.total || 0}
      - Total Products: ${productStats}
      - Recent Orders: ${JSON.stringify(recentOrders)}
      - System Alerts: ${JSON.stringify(systemHealth)}
      `,
        prompt: question
    })


    return { answer: text }
}

import { revalidatePath } from 'next/cache'

export async function toggleUserStatus(userId: string, currentStatus: string) {
    try {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
        await prisma.user.update({
            where: { id: userId },
            data: { status: newStatus }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error("Toggle Status Error:", error)
        return { success: false, error: 'Failed to update status' }
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({ where: { id: userId } })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error("Delete User Error:", error)
        return { success: false, error: 'Failed to delete user' }
    }
}
