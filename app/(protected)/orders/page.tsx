import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getUserOrders } from '@/app/actions/orders'
import { OrderCard } from '@/components/order-card'
import { EmptyState } from '@/components/empty-state'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/footer'
import { ShoppingBag, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/motion-wrappers'

export const metadata = {
    title: 'My Orders | House of Kendles',
    description: 'View your order history and track your orders',
}

/**
 * Order list component that fetches and displays orders
 */
async function OrderList() {
    const orders = await getUserOrders()

    if (orders.length === 0) {
        return (
            <EmptyState
                icon={<ShoppingBag className="h-16 w-16" />}
                title="No orders yet"
                description="When you place an order, it will appear here. Start shopping to discover our handcrafted candles!"
                actionLabel="Start Shopping"
                onAction={undefined}
            />
        )
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
            ))}
        </div>
    )
}

/**
 * Empty state with link instead of action (for server component)
 */
function OrdersEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="mb-4 text-gray-300">
                <ShoppingBag className="h-16 w-16" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
                When you place an order, it will appear here. Start shopping to discover our handcrafted candles!
            </p>
            <Link
                href="/candles"
                className="inline-flex items-center justify-center rounded-lg bg-brand-900 px-6 py-3 text-white font-medium hover:bg-brand transition-colors"
            >
                Start Shopping
            </Link>
        </div>
    )
}

/**
 * Orders page - displays order history for authenticated users
 * Protected route - requires authentication
 */
export default async function OrdersPage() {
    const user = await getCurrentUser()

    // Redirect to sign-in if not authenticated
    if (!user) {
        redirect('/sign-in?redirect=/orders')
    }

    return (
        <>
            <SiteHeader />
            <main className="min-h-screen bg-surface">
                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                    {/* Header */}
                    <FadeIn className="mb-10 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-brand-900 font-heading">My Orders</h1>
                        <p className="mt-3 text-brand-900/60 font-medium tracking-wide uppercase text-sm">Track and manage your history</p>
                    </FadeIn>

                    {/* Order List */}
                    <Suspense
                        fallback={
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-brand-900" />
                            </div>
                        }
                    >
                        <OrderListWrapper />
                    </Suspense>
                </div>
            </main>
            <SiteFooter />
        </>
    )
}

/**
 * Wrapper component to handle empty state rendering for server component
 */
async function OrderListWrapper() {
    const orders = await getUserOrders()

    if (orders.length === 0) {
        return <OrdersEmptyState />
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
            ))}
        </div>
    )
}
