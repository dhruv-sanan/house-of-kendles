"use server"

import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { CartItem } from "@/lib/cart"
import { type OrderStatus } from "@/types/order.types"

const CustomerDetailsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  giftMessage: z.string().optional(),
  wrap: z.boolean().default(false),
  couponCode: z.string().optional(),
})

// --- Helper to generate ID ---
async function generateUniqueOrderId(retryCount = 0): Promise<string> {
  const supabase = await createClient()
  // 1. Define length: Starts at 4, increases if we hit too many retries (exhaustion safety)
  const length = retryCount > 6 ? 5 : 4;

  // 2. Generate Random Number
  // Math.random() generates 0-1. We multiply to get e.g. 0-9999.
  const max = Math.pow(10, length);
  const randomNum = Math.floor(Math.random() * max);
  const numericPart = randomNum.toString().padStart(length, "0");

  const newId = `HOK-${numericPart}`;

  // 3. Check DB for collision
  const { data } = await supabase
    .from("orders")
    .select("id")
    .eq("order_uid", newId)
    .single();

  // 4. If collision (data exists), recursive retry
  if (data) {
    return generateUniqueOrderId(retryCount + 1);
  }

  return newId;
}

export async function createOrder(cartItems: CartItem[], formData: FormData) {
  const supabase = await createClient()
  const validatedFields = CustomerDetailsSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    giftMessage: formData.get("giftMessage"),
    wrap: formData.get("wrap") === "on",
    couponCode: formData.get("couponCode"),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    }
  }
  const customerData = validatedFields.data

  try {
    // 1. Calculate Subtotal from DB prices (Security)
    const variantIds = cartItems.map((item) => item.variant_id)
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("id, price")
      .in("id", variantIds)
    if (variantsError) throw new Error("Could not fetch product prices.")

    let subtotal = cartItems.reduce((sum, item) => {
      const variant = variants.find((v) => v.id === item.variant_id)
      return sum + (variant?.price || 0) * item.qty
    }, 0)

    // 2. Apply Coupon Logic
    let discountAmount = 0
    if (customerData.couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", customerData.couponCode)
        .eq("is_active", true)
        .single()

      if (coupon && subtotal >= (coupon.min_order_value || 0)) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = (subtotal * coupon.discount_value) / 100
        } else {
          discountAmount = coupon.discount_value
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount)

    // 3. Create/Get Customer
    let { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", customerData.email)
      .single()

    if (!customer) {
      const { data: newCustomer, error: newCustomerError } = await supabase
        .from("customers")
        .insert({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
        })
        .select("id")
        .single()
      if (newCustomerError) throw new Error("Could not create new customer.")
      customer = newCustomer
    }
    const customerId = customer.id

    // 4. Create Order (Initial Insert)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        total_amount: totalAmount,
        status: "pending_payment",
        gift_wrap: customerData.wrap,
      })
      .select("id")
      .single()

    if (orderError) throw new Error("Could not create order.")

    const orderId = order.id

    // 5. Generate Unique ID and Update
    // We do this AFTER creating the ID row to avoid race conditions on "checking"
    // although generating first is also fine, updating specific row is safer.
    const uniqueOrderUid = await generateUniqueOrderId();

    const { error: updateError } = await supabase
      .from("orders")
      .update({ order_uid: uniqueOrderUid })
      .eq("id", orderId)

    if (updateError) throw new Error("Could not assign Order ID.")

    // 6. Add Items
    const orderItems = cartItems.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.qty,
      price_at_purchase: variants.find((v) => v.id === item.variant_id)?.price || 0,
    }))

    await supabase.from("order_items").insert(orderItems)

    // 7. Decrement Stock
    for (const item of cartItems) {
      await supabase.rpc("decrement_stock", {
        variant_id_to_update: item.variant_id,
        quantity_to_decrement: item.qty,
      })
    }

    revalidatePath(`/order/${uniqueOrderUid}`)

    return { success: true, orderUid: uniqueOrderUid }
  } catch (error) {
    console.error("Order creation failed:", error)
    return { success: false, error: "Something went wrong. Please try again." }
  }
}

export async function updateOrderStatus(orderId: number, newStatus: string) {
  const supabase = await createClient()


  const { data, error } = await supabase
    .from("orders")
    .update({ status: newStatus as OrderStatus })
    .eq("id", orderId)
    .select('id, status')
    .single()

  if (error) {
    console.error('[Admin] Error updating order status:', error)
    return { success: false, error: `Failed to update status: ${error.message}` }
  }


  revalidatePath("/admin/orders")
  revalidatePath(`/order/${orderId}`)
  return { success: true, data }
}

export async function getOrders() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_uid,
      order_date,
      total_amount,
      status,
      customers ( name, phone, email, address ),
      addresses ( street, city, state, zip_code ),
      order_items ( 
        quantity,
        product_variants (
          size,
          image_url,
          products ( name )
        )
      ) 
    `)
    .order("order_date", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }



  return data.map(order => {
    const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers
    const deliveryAddress = Array.isArray(order.addresses) ? order.addresses[0] : order.addresses

    let formattedAddress = customer?.address
    if (deliveryAddress) {
      formattedAddress = `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.zip_code}`
    } else {

    }

    return {
      ...order,
      customer_name: customer?.name || "N/A",
      customer_email: customer?.email,
      customer_phone: customer?.phone,
      customer_address: formattedAddress
    }
  })
}

export type OrderWithItems = Awaited<ReturnType<typeof getOrders>>[number]