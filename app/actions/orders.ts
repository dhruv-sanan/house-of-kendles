'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUser, getCurrentUserWithCustomer } from '@/lib/auth'
import type {
    OrderWithDetails,
    OrderSummary,
    OrderStatus
} from '@/types/order.types'
import type { CartItem } from '@/lib/cart'
import { z } from 'zod'

/**
 * Schema for order creation validation
 */
const CreateOrderSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    delivery_address_id: z.string().optional(),
    gift_wrap: z.boolean().default(false),
    gift_message: z.string().optional(),
    coupon_code: z.string().optional(),
})

/**
 * Generate a unique order ID with format HOK-XXXX
 */
async function generateUniqueOrderId(
    supabase: Awaited<ReturnType<typeof createClient>>,
    retryCount = 0
): Promise<string> {
    const length = retryCount > 6 ? 5 : 4
    const max = Math.pow(10, length)
    const randomNum = Math.floor(Math.random() * max)
    const numericPart = randomNum.toString().padStart(length, '0')
    const newId = `HOK-${numericPart}`

    const { data } = await supabase
        .from('orders')
        .select('id')
        .eq('order_uid', newId)
        .single()

    if (data) {
        return generateUniqueOrderId(supabase, retryCount + 1)
    }

    return newId
}

/**
 * Create a new order from cart items
 * Links to authenticated user's customer record
 */
export async function createOrderFromCart(
    cartItems: CartItem[],
    formData: FormData
): Promise<{ success: boolean; orderUid?: string; error?: string }> {
    try {
        const supabase = await createClient()

        // Validate form data
        const validatedFields = CreateOrderSchema.safeParse({
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            delivery_address_id: formData.get('delivery_address_id') || undefined,
            gift_wrap: formData.get('wrap') === 'on',
            gift_message: formData.get('giftMessage') || undefined,
            coupon_code: formData.get('couponCode') || undefined,
        })

        if (!validatedFields.success) {
            return {
                success: false,
                error: 'Please fill in all required fields correctly',
            }
        }

        const orderData = validatedFields.data

        // Get current user (optional - can checkout as guest)
        const user = await getCurrentUser()

        // Calculate subtotal from DB prices (security)
        const variantIds = cartItems.map((item) => item.variant_id)
        const { data: variants, error: variantsError } = await supabase
            .from('product_variants')
            .select('id, price')
            .in('id', variantIds)

        if (variantsError || !variants) {
            return { success: false, error: 'Could not fetch product prices' }
        }

        let subtotal = cartItems.reduce((sum, item) => {
            const variant = variants.find((v) => v.id === item.variant_id)
            return sum + (variant?.price || 0) * item.qty
        }, 0)

        // Apply coupon logic
        let discountAmount = 0
        if (orderData.coupon_code) {
            const { data: coupon } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', orderData.coupon_code)
                .eq('is_active', true)
                .single()

            if (coupon && subtotal >= (coupon.min_order_value || 0)) {
                if (coupon.discount_type === 'percentage') {
                    discountAmount = (subtotal * coupon.discount_value) / 100
                } else {
                    discountAmount = coupon.discount_value
                }
            }
        }

        // Add gift wrap cost
        const giftWrapCost = orderData.gift_wrap ? 50 : 0
        const totalAmount = Math.max(0, subtotal - discountAmount) + giftWrapCost

        // Get or create customer
        let customerId: number

        if (user) {
            // Authenticated user - use their customer record


            const { data: customer, error: customerFetchError } = await supabase
                .from('customers')
                .select('id, name, email, phone')
                .eq('user_id', user.id)
                .single()

            if (customerFetchError && customerFetchError.code !== 'PGRST116') {
                console.error('[Order] Error fetching customer:', customerFetchError)
                return { success: false, error: 'Error looking up customer record' }
            }

            if (customer) {

                customerId = customer.id

                // Update customer info with checkout details (phone, etc.)
                const updateData: Record<string, string> = {}
                if (orderData.phone && orderData.phone !== customer.phone) {
                    updateData.phone = orderData.phone
                }
                if (orderData.name && orderData.name !== customer.name) {
                    updateData.name = orderData.name
                }

                if (Object.keys(updateData).length > 0) {

                    const { error: updateError } = await supabase
                        .from('customers')
                        .update(updateData)
                        .eq('id', customer.id)

                    if (updateError) {
                        console.error('[Order] Error updating customer:', updateError)
                        // Non-fatal, continue with order
                    }
                }
            } else {
                // Customer doesn't exist - create one (shouldn't happen if auth callback worked)
                const { data: newCustomer, error: customerError } = await supabase
                    .from('customers')
                    .insert({
                        user_id: user.id,
                        name: orderData.name,
                        email: orderData.email,
                        phone: orderData.phone,
                    })
                    .select('id')
                    .single()

                if (customerError) {
                    console.error('[Order] Error creating customer:', customerError)
                    return { success: false, error: `Could not create customer record: ${customerError.message}` }
                }

                if (!newCustomer) {
                    return { success: false, error: 'Could not create customer record: No data returned' }
                }


                customerId = newCustomer.id
            }
        } else {
            // Guest checkout (this shouldn't happen since checkout is protected, but just in case)
            return { success: false, error: 'You must be signed in to place an order' }
        }

        // Generate unique order UID first (before insert)
        const uniqueOrderUid = await generateUniqueOrderId(supabase)


        // Create order with order_uid included


        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                order_uid: uniqueOrderUid,
                customer_id: customerId,
                total_amount: totalAmount,
                status: 'pending_payment' as OrderStatus,
                gift_wrap: orderData.gift_wrap,
                delivery_address_id: orderData.delivery_address_id || null,
            })
            .select('id, order_uid')
            .single()

        if (orderError) {
            console.error('[Order] Error creating order:', orderError)
            return { success: false, error: `Could not create order: ${orderError.message}` }
        }

        if (!order) {
            console.error('[Order] No order data returned')
            return { success: false, error: 'Could not create order: No data returned' }
        }



        // Add order items
        const orderItems = cartItems.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.qty,
            price_at_purchase: variants.find((v) => v.id === item.variant_id)?.price || 0,
        }))

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

        if (itemsError) {
            console.error('[Order] Error adding order items:', itemsError)
            // Try to rollback
            await supabase.from('orders').delete().eq('id', order.id)
            return { success: false, error: `Could not add order items: ${itemsError.message}` }
        }

        // Decrement stock
        for (const item of cartItems) {
            const { error: stockError } = await supabase.rpc('decrement_stock', {
                variant_id_to_update: item.variant_id,
                quantity_to_decrement: item.qty,
            })

            if (stockError) {
                console.error('[Order] Error decrementing stock for variant', item.variant_id, ':', stockError)
                // Non-fatal, continue
            }
        }



        revalidatePath(`/order/${uniqueOrderUid}`)
        revalidatePath('/orders')

        return { success: true, orderUid: uniqueOrderUid }
    } catch (error) {
        console.error('Order creation failed:', error)
        return { success: false, error: 'Something went wrong. Please try again.' }
    }
}

/**
 * Get orders for the current authenticated user
 */
export async function getUserOrders(): Promise<OrderSummary[]> {
    try {
        const { user, customer } = await getCurrentUserWithCustomer()

        if (!user || !customer) {
            return []
        }

        const supabase = await createClient()

        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
        id,
        order_uid,
        order_date,
        status,
        total_amount,
        order_items (
          id,
          quantity,
          product_variants (
            image_url,
            products (name)
          )
        )
      `)
            .eq('customer_id', customer.id)
            .order('order_date', { ascending: false })

        if (error || !orders) {
            console.error('Error fetching orders:', error)
            return []
        }

        // Transform to OrderSummary format
        return orders.map((order) => {
            const items = order.order_items || []
            const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
            const firstItem = items[0]

            return {
                id: order.id,
                order_uid: order.order_uid,
                order_date: order.order_date,
                status: order.status as OrderStatus,
                total_amount: order.total_amount,
                item_count: itemCount,
                first_item_image: firstItem?.product_variants?.image_url || null,
                first_item_name: firstItem?.product_variants?.products?.name || null,
            }
        })
    } catch (error) {
        console.error('Error getting user orders:', error)
        return []
    }
}

/**
 * Get a single order by order_uid
 */
export async function getOrderByUid(orderUid: string): Promise<OrderWithDetails | null> {
    try {
        const supabase = await createClient()

        // Fetch order with customer and items (no address join)
        const { data: order, error } = await supabase
            .from('orders')
            .select(`
        *,
        customers (*),
        order_items (
          *,
          product_variants (
            size,
            flavor,
            image_url,
            price,
            products (name, slug)
          )
        )
      `)
            .eq('order_uid', orderUid)
            .single()

        if (error || !order) {
            console.error('Error fetching order:', error)
            return null
        }

        // Fetch address separately if delivery_address_id exists
        let address = null
        if (order.delivery_address_id) {
            const { data: addressData, error: addressError } = await supabase
                .from('addresses')
                .select('*')
                .eq('id', order.delivery_address_id)
                .single()

            if (!addressError && addressData) {
                address = addressData
            }
        }

        // Combine the results
        return {
            ...order,
            addresses: address,
        } as OrderWithDetails
    } catch (error) {
        console.error('Error getting order:', error)
        return null
    }
}

/**
 * Check if the current user owns an order
 */
export async function userOwnsOrder(orderUid: string): Promise<boolean> {
    try {
        const { user, customer } = await getCurrentUserWithCustomer()

        if (!user || !customer) {
            return false
        }

        const supabase = await createClient()

        const { data: order, error } = await supabase
            .from('orders')
            .select('customer_id')
            .eq('order_uid', orderUid)
            .single()

        if (error || !order) {
            return false
        }

        return order.customer_id === customer.id
    } catch {
        return false
    }
}

/**
 * Cancel an order (only if pending_payment)
 */
export async function cancelOrder(
    orderUid: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { user, customer } = await getCurrentUserWithCustomer()

        if (!user || !customer) {
            return { success: false, error: 'You must be signed in to cancel an order' }
        }

        const supabase = await createClient()

        // Verify ownership and status
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('id, customer_id, status')
            .eq('order_uid', orderUid)
            .single()

        if (fetchError || !order) {
            return { success: false, error: 'Order not found' }
        }

        if (order.customer_id !== customer.id) {
            return { success: false, error: 'You do not have permission to cancel this order' }
        }

        if (order.status !== 'pending_payment') {
            return { success: false, error: 'This order cannot be cancelled' }
        }

        // Cancel the order
        const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'cancelled' as OrderStatus })
            .eq('id', order.id)

        if (updateError) {
            return { success: false, error: 'Failed to cancel order' }
        }

        revalidatePath('/orders')
        revalidatePath(`/order/${orderUid}`)

        return { success: true }
    } catch (error) {
        console.error('Cancel order error:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
