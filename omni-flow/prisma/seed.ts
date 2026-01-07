import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5433/omniflow?schema=public"
const prisma = new PrismaClient({
    datasources: {
        db: {
            url,
        },
    },
})

async function main() {
    const password = await bcrypt.hash('password123', 10)

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'user@demo.com' },
        update: {},
        create: {
            email: 'user@demo.com',
            password,
            name: 'Admin User',
            role: 'ADMIN',
        },
    })

    // Create Sample Product
    await prisma.product.create({
        data: {
            title: 'Future Sneakers X1',
            description: 'The future of footwear is here. AI-designed comfort.',
            price: 299.99,
            category: 'Footwear',
            stock: 50,
            images: ['/placeholder.jpg'],
            aiTags: ['sneakers', 'future', 'ai', 'comfort'],
        }
    })

    console.log({ admin })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
