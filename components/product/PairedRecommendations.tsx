'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { RecommendationCard } from '@/components/shared/RecommendationCard'
import { getPairedRecommendations } from '@/lib/recommendations'
import type { RecommendedProduct } from '@/types/recommendation.types'
import { Loader2, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PairedRecommendationsProps {
    productId: number
    className?: string
}

/**
 * Paired recommendations for product detail page
 * Shows complementary high-ticket items
 */
export function PairedRecommendations({ productId, className }: PairedRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const pathname = usePathname()

    useEffect(() => {
        async function fetchRecommendations() {
            setIsLoading(true)
            setError(null)

            try {
                const recs = await getPairedRecommendations(productId, 4)
                setRecommendations(recs)
            } catch (err) {
                console.error('Error fetching paired recommendations:', err)
                setError('Could not load recommendations')
            } finally {
                setIsLoading(false)
            }
        }

        fetchRecommendations()
    }, [productId])

    // Don't render if no recommendations
    if (!isLoading && recommendations.length === 0) return null

    return (
        <section className={cn('mt-12 md:mt-16', className)}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <Heart className="w-5 h-5 text-gold fill-gold" />
                <h2 className="font-heading text-2xl md:text-3xl text-brand-900">
                    People Also Paired This With
                </h2>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-900/50" />
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <p className="text-sm text-muted-foreground py-4">{error}</p>
            )}

            {/* Card Grid / Carousel */}
            {!isLoading && recommendations.length > 0 && (
                <div className="relative">
                    {/* Mobile: Horizontal Scroll */}
                    <div className="flex md:hidden overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                        {recommendations.map((product) => (
                            <div key={product.variantId} className="snap-start shrink-0">
                                <RecommendationCard
                                    product={product}
                                    size="large"
                                    clickLocation="item_page_paired"
                                    sourceProductId={productId}
                                    sourcePageUrl={pathname}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Desktop: Grid */}
                    <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {recommendations.map((product) => (
                            <RecommendationCard
                                key={product.variantId}
                                product={product}
                                size="large"
                                clickLocation="item_page_paired"
                                sourceProductId={productId}
                                sourcePageUrl={pathname}
                                className="max-w-none"
                            />
                        ))}
                    </div>

                    {/* Fade edge for mobile scroll */}

                </div>
            )}
        </section>
    )
}
