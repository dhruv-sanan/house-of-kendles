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


// --- SCHEMAS ---

// --- SCHEMAS ---

// Base schemas with validation rules
const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  image_url: z.string().url("Invalid image URL").optional().or(z.literal("")),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase and contain only hyphens"),
})

const VariantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  price: z.coerce.number().positive("Price must be positive"),
  stock_quantity: z.coerce.number().int().nonnegative("Stock must be non-negative"),
  is_bestseller: z.boolean().default(false),
  image_url: z.string().url("Invalid image URL").optional().or(z.literal("")),
  image_urls: z.array(z.string().url("Invalid URL in list")).optional(),
  flavor: z.string().optional(),
})

// Partial schemas for updates
const ProductUpdateSchema = ProductSchema.partial()
const VariantUpdateSchema = VariantSchema.partial()

// Schema for creating a new variant (requires certain fields)
const CreateVariantSchema = VariantSchema.pick({
  size: true,
  price: true,
  stock_quantity: true,
}).extend({
  is_bestseller: z.boolean().default(false).optional(),
  image_url: z.string().optional(),
  image_urls: z.array(z.string()).optional(),
  flavor: z.string().optional(),
  product_id: z.number()
})


export type ProductUpdateData = z.infer<typeof ProductUpdateSchema>
export type VariantUpdateData = z.infer<typeof VariantUpdateSchema>
export type CreateVariantData = z.infer<typeof CreateVariantSchema>

// --- ACTIONS ---

export async function updateProduct(productId: number, data: ProductUpdateData) {
  const validated = ProductUpdateSchema.safeParse(data)

  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message }
  }

  try {
    const updateData = validated.data

    // Check for slug uniqueness ONLY if slug is being updated
    if (updateData.slug) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", updateData.slug)
        .neq("id", productId)
        .single()

      if (existing) {
        return { success: false, error: "Slug is already in use." }
      }
    }

    const { error } = await supabase
      .from("products")
      .update(updateData) // Supabase handles partial updates if the object only contains keys to update
      .eq("id", productId)

    if (error) throw error

    revalidatePath("/admin/products")
    if (updateData.slug) {
      revalidatePath(`/admin/products/${updateData.slug}/edit`)
    }
    return { success: true }
  } catch (error) {
    console.error("Update product error:", error)
    return { success: false, error: "Failed to update product." }
  }
}

export async function updateProductVariant(variantId: number, data: VariantUpdateData) {
  const validated = VariantUpdateSchema.safeParse(data)

  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message }
  }

  try {
    const { error } = await supabase
      .from("product_variants")
      .update(validated.data)
      .eq("id", variantId)

    if (error) throw error

    revalidatePath("/admin/products")
    revalidatePath(`/admin/products/variants/${variantId}/edit`)
    return { success: true }
  } catch (error) {
    console.error("Update variant error:", error)
    return { success: false, error: "Failed to update variant." }
  }
}

export async function createProductVariant(data: CreateVariantData) {
  const validated = CreateVariantSchema.safeParse(data)

  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message }
  }

  try {
    const { error } = await supabase
      .from("product_variants")
      .insert({
        product_id: data.product_id,
        size: data.size,
        price: data.price,
        stock_quantity: data.stock_quantity,
        is_bestseller: data.is_bestseller || false,
        image_url: data.image_url || "",
        image_urls: data.image_urls || [],
        flavor: data.flavor || ""
      })

    if (error) throw error

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error) {
    console.error("Create variant error:", error)
    return { success: false, error: "Failed to create variant." }
  }
}
