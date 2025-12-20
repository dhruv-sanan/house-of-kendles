"use server"

import { supabase } from "@/lib/supabase/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema to validate the stock update form
const StockUpdateSchema = z.object({
  variantId: z.coerce.number(),
  amount: z.coerce.number().int().positive({ message: "Please enter a positive number." }),
  operation: z.enum(["add", "subtract"]),
})

/**
 * Updates stock for a variant by adding or subtracting a specified amount.
 */
export async function updateStock(formData: FormData) {
  const validatedFields = StockUpdateSchema.safeParse({
    variantId: formData.get("variantId"),
    amount: formData.get("amount"),
    operation: formData.get("operation"),
  })

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors)
    return { success: false, error: "Invalid input. Please provide a positive number." }
  }

  const { variantId, amount, operation } = validatedFields.data
  const change = operation === "add" ? amount : -amount

  try {
    // This database function ensures stock updates are safe from race conditions.
    // If you haven't created it yet, please run the SQL command provided in our previous conversation.
    const { error } = await supabase.rpc("increment_stock", {
      variant_id_to_update: variantId,
      quantity_to_increment: change,
    })

    if (error) {
      console.error("Supabase RPC error:", error)
      throw new Error("Could not update stock quantity.")
    }

    revalidatePath("/admin/products") // Refresh the stock management page
    return { success: true }
  } catch (error) {
    return { success: false, error: "A server error occurred." }
  }
}

