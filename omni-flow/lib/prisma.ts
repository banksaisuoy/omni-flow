import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    const configuredUrl = process.env.DATABASE_URL
    if (!configuredUrl && process.env.NODE_ENV === 'production') {
        throw new Error('DATABASE_URL is required in production')
    }
    // Keep the local fallback only for development/test environments.
    const url = configuredUrl || "postgresql://postgres:postgres@127.0.0.1:5433/omniflow?schema=public"
    return new PrismaClient({
        datasources: {
            db: {
                url,
            },
        },
    })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
