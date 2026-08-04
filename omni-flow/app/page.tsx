import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ShoppingCart, Sparkles, Zap, Star } from 'lucide-react'
import StoreHydrator from '@/components/StoreHydrator'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let rawProducts: any[] = [];
  try {
    rawProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    // DB might be unreachable or schema mismatch
    console.error("Failed to fetch products:", e);
  }

  const products = rawProducts.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    category: p.category,
    image: p.images?.[0] || '/placeholder.jpg',
    views: p.views,
    isFlashSale: p.isFlashSale,
    flashPrice: p.flashPrice,
    isPinned: p.isPinned
  }))

  const pinnedProducts = products.filter(p => p.isPinned)
  const flashSaleProducts = products.filter(p => p.isFlashSale)
  const regularProducts = products.filter(p => !p.isPinned && !p.isFlashSale)

  return (
    <div className="min-h-screen pt-24 pb-12">
      <StoreHydrator products={products} />
      
      {products.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <Sparkles className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to OmniFlow</h1>
          <p className="text-gray-400">AI-Powered Commerce System</p>
          <p className="text-gray-500 text-sm mt-4">No products available yet. Database may be initializing.</p>
        </div>
      )}

      {pinnedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Star className="text-yellow-400" /> Featured
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pinnedProducts.map(p => (
              <div key={p.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                <div className="aspect-square bg-gray-800" />
                <div className="p-4">
                  <h3 className="text-white font-semibold">{p.title}</h3>
                  <p className="text-indigo-400">${p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {regularProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-6">All Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {regularProducts.map(p => (
              <div key={p.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                <div className="aspect-square bg-gray-800" />
                <div className="p-4">
                  <h3 className="text-white font-semibold">{p.title}</h3>
                  <p className="text-indigo-400">${p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
