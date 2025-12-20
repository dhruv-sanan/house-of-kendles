import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/footer'
import { OrderStatusTracker } from '@/components/order-status-tracker'
import { getOrderByUid, userOwnsOrder } from '@/app/actions/orders'
import { getCurrentUser } from '@/lib/auth'
import { ORDER_STATUS_INFO, type OrderStatus } from '@/types/order.types'
import { MapPin, Phone, Mail, User, Gift, ShoppingBag, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

// Disable caching so order status is always current
export const dynamic = 'force-dynamic'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { id } = await params
  return {
    title: `Order ${id} | House of Kendles`,
    description: 'View your order details and track delivery status',
  }
}

/**
 * Order detail page - shows full order information
 * Can be viewed by the order owner or as a guest with the order link
 */
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const order = await getOrderByUid(id)

  if (!order) {
    notFound()
  }

  const user = await getCurrentUser()
  const isOwner = user ? await userOwnsOrder(id) : false
  const statusInfo = ORDER_STATUS_INFO[order.status as OrderStatus]
  const formattedDate = order.order_date
    ? format(new Date(order.order_date), 'MMMM d, yyyy')
    : 'Unknown date'

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-b from-white via-brand-50/20 to-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          {/* Back Link */}
          {isOwner && (
            <Link
              href="/orders"
              className="inline-flex items-center text-sm text-gray-600 hover:text-brand-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Orders
            </Link>
          )}

          {/* Order Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl text-brand-900">
              {order.status === 'pending_payment'
                ? 'Order Placed!'
                : order.status === 'delivered'
                  ? 'Order Delivered!'
                  : 'Order Details'}
            </h1>
            <p className="text-gray-600 mt-2">
              Order <span className="font-medium text-brand-900">{order.order_uid}</span>
            </p>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>

          {/* Status Tracker */}
          <div className="bg-white rounded-xl border border-brand/10 p-6 mb-6">
            <OrderStatusTracker status={order.status as OrderStatus} />
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl border border-brand/10 p-6 mb-6">
            <h2 className="font-semibold text-lg text-brand-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {item.product_variants?.image_url ? (
                      <Image
                        src={item.product_variants.image_url}
                        alt={item.product_variants.products?.name || 'Product'}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {item.product_variants?.products?.name || 'Product'}
                    </p>
                    {item.product_variants?.size && (
                      <p className="text-sm text-gray-500">Size: {item.product_variants.size}</p>
                    )}
                    {item.product_variants?.flavor && (
                      <p className="text-sm text-gray-500">Flavor: {item.product_variants.flavor}</p>
                    )}
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-brand-900">₹{item.price_at_purchase * item.quantity}</p>
                    <p className="text-xs text-gray-500">₹{item.price_at_purchase} each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t mt-4 pt-4 space-y-2">
              {order.gift_wrap && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Gift className="h-4 w-4" />
                    Gift Wrap
                  </span>
                  <span>₹50</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-brand-900">
                <span>Total</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Info */}
          <div className="grid gap-6 sm:grid-cols-2 mb-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl border border-brand/10 p-6">
              <h2 className="font-semibold text-lg text-brand-900 mb-4">Customer Details</h2>
              <div className="space-y-3 text-sm">
                {order.customers?.name && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{order.customers.name}</span>
                  </div>
                )}
                {order.customers?.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{order.customers.email}</span>
                  </div>
                )}
                {order.customers?.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{order.customers.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl border border-brand/10 p-6">
              <h2 className="font-semibold text-lg text-brand-900 mb-4">Delivery Address</h2>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-700">
                  {order.addresses ? (
                    <>
                      <p>{order.addresses.street}</p>
                      <p>
                        {order.addresses.city}, {order.addresses.state} {order.addresses.zip_code}
                      </p>
                    </>
                  ) : order.customers?.address ? (
                    <p>{order.customers.address}</p>
                  ) : (
                    <p className="text-gray-400">No address on file</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/candles"
              className="inline-flex items-center justify-center rounded-lg bg-brand-900 px-6 py-3 text-white font-medium hover:bg-brand transition-colors"
            >
              Continue Shopping
            </Link>
            {isOwner && (
              <Link
                href="/orders"
                className="inline-flex items-center justify-center rounded-lg border border-brand-900 px-6 py-3 text-brand-900 font-medium hover:bg-brand-50 transition-colors"
              >
                View All Orders
              </Link>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}