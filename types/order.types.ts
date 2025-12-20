import type { Tables } from './database.types'

/**
 * Order type from database
 */
export type Order = Tables<'orders'>

/**
 * Order item type from database
 */
export type OrderItem = Tables<'order_items'>

/**
 * Order status enum values
 */
export type OrderStatus =
    | 'pending_payment'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'

/**
 * Order status display information
 */
export type OrderStatusInfo = {
    label: string
    color: string
    bgColor: string
    description: string
}

/**
 * Map of order status to display information
 */
export const ORDER_STATUS_INFO: Record<OrderStatus, OrderStatusInfo> = {
    pending_payment: {
        label: 'Pending Payment',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50 border-yellow-200',
        description: 'Awaiting payment confirmation',
    },
    processing: {
        label: 'Processing',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50 border-blue-200',
        description: 'Your order is being prepared',
    },
    shipped: {
        label: 'Shipped',
        color: 'text-purple-700',
        bgColor: 'bg-purple-50 border-purple-200',
        description: 'Your order is on its way',
    },
    delivered: {
        label: 'Delivered',
        color: 'text-green-700',
        bgColor: 'bg-green-50 border-green-200',
        description: 'Order has been delivered',
    },
    cancelled: {
        label: 'Cancelled',
        color: 'text-red-700',
        bgColor: 'bg-red-50 border-red-200',
        description: 'Order was cancelled',
    },
}

/**
 * Order with related customer data
 */
export type OrderWithCustomer = Order & {
    customers: Tables<'customers'> | null
}

/**
 * Order item with product and variant details
 */
export type OrderItemWithDetails = OrderItem & {
    product_variants: {
        size: string | null
        flavor: string | null
        image_url: string | null
        price: number
        products: {
            name: string
            slug: string | null
        } | null
    } | null
}

/**
 * Full order with all related data for display
 */
export type OrderWithDetails = Order & {
    customers: Tables<'customers'> | null
    order_items: OrderItemWithDetails[]
    addresses?: Tables<'addresses'> | null
}

/**
 * Order summary for list views
 */
export type OrderSummary = {
    id: number
    order_uid: string | null
    order_date: string
    status: OrderStatus
    total_amount: number
    item_count: number
    first_item_image: string | null
    first_item_name: string | null
}

/**
 * Order creation input from checkout
 */
export type CreateOrderInput = {
    customer_id: number
    delivery_address_id?: string
    total_amount: number
    gift_wrap?: boolean
    items: {
        variant_id: number
        product_id: number
        quantity: number
        price_at_purchase: number
    }[]
    coupon_code?: string
}
