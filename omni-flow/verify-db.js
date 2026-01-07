const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const product = await prisma.product.findFirst()
        if (product) {
            console.log("Check fields:", 'isPinned' in product, 'isFlashSale' in product)
        } else {
            console.log("No products found, but query succeeded.")
        }
    } catch (e) {
        console.error("Error:", e.message)
    }
}

main()
