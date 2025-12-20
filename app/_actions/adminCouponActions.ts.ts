"use server"

import { supabase } from "@/lib/supabase/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CouponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().positive(),
  min_order_value: z.coerce.number().nonnegative().default(0),
})

export async function addCoupon(formData: FormData) {
  const validated = CouponSchema.safeParse(Object.fromEntries(formData))

  if (!validated.success) {
    return { success: false, error: "Invalid input" }
  }

  const { error } = await supabase.from("coupons").insert([{
    ...validated.data,
    is_active: true
  }])

  if (error) {
    console.error("Error adding coupon:", error)
    return { success: false, error: "Could not add coupon" }
  }

  revalidatePath("/admin/coupons")
  return { success: true }
}

export async function deleteCoupon(id: number) {
  const { error } = await supabase.from("coupons").delete().eq("id", id)
  
  if (error) return { success: false, error: "Could not delete" }
  
  revalidatePath("/admin/coupons")
  return { success: true }
}