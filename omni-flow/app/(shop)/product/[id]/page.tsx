import { submitReviewAction } from '@/app/actions/review'
import { motion, AnimatePresence } from 'framer-motion'
import ReviewSection from '@/components/ReviewSection' // Extract client part if needed, or keep page server side
import NegotiationBot from '@/components/features/NegotiationBot'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
                    </div>
                </div>
            </div>

            {/* AI Negotiation Bot */}
            <NegotiationBot productPrice={product.price} />
        </div>
    )
}