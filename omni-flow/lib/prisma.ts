import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    // Fallback for local development if env is missing at runtime
    const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5433/omniflow?schema=public"
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
