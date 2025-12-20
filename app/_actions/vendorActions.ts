"use server"

import { supabase } from "@/lib/supabase/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const VendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  category: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export async function getVendors() {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .order("name")

  if (error) {
    console.error("Error fetching vendors:", error)
    return []
  }
  return data
}

export async function addVendor(formData: FormData) {
  const validatedFields = VendorSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
    return { success: false, error: "Invalid data provided." }
  }

  const { error } = await supabase.from("vendors").insert(validatedFields.data)

  if (error) {
    console.error("Error adding vendor:", error)
    return { success: false, error: "Database error." }
  }

  revalidatePath("/admin/vendors")
  return { success: true }
}

export async function deleteVendor(vendorId: number) {
  const { error } = await supabase.from("vendors").delete().eq("id", vendorId)

  if (error) {
    console.error("Error deleting vendor:", error)
    return { success: false, error: "Database error." }
  }

  revalidatePath("/admin/vendors")
  return { success: true }
}

