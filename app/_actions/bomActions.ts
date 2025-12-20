"use server"

import { supabase } from "@/lib/supabase/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// --- Schemas ---
const BomItemSchema = z.object({
  productVariantId: z.coerce.number(),
  rawMaterialId: z.coerce.number({invalid_type_error: "Please select a raw material."}),
  quantityRequired: z.coerce.number().positive("Quantity must be greater than zero."),
})

// --- BOM Management Functions ---

export async function getBomForVariant(variantId: number) {
  const { data, error } = await supabase
    .from("bill_of_materials")
    .select(`
      *,
      raw_materials ( name, unit_of_measure )
    `)
    .eq("product_variant_id", variantId)
    .order("raw_materials(name)")

  if (error) {
    console.error("Error fetching BOM:", error)
    return []
  }
  return data
}

export async function addBomItem(formData: FormData) {
  const validatedFields = BomItemSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
    console.error("BOM validation error:", validatedFields.error.flatten().fieldErrors)
    return { success: false, error: "Invalid data provided." }
  }

  const { productVariantId, rawMaterialId, quantityRequired } = validatedFields.data

  const { error } = await supabase
    .from("bill_of_materials")
    .insert({ product_variant_id: productVariantId, raw_material_id: rawMaterialId, quantity_required: quantityRequired })

  if (error) {
    // Handle potential unique constraint violation gracefully
    if (error.code === '23505') { // Postgres unique violation code
        return { success: false, error: "This raw material is already part of the recipe."}
    }
    console.error("Error adding BOM item:", error)
    return { success: false, error: "Database error." }
  }

  revalidatePath(`/admin/products/variants/${productVariantId}/bom`)
  return { success: true }
}

export async function deleteBomItem(bomItemId: number, productVariantId: number) {
  const { error } = await supabase
    .from("bill_of_materials")
    .delete()
    .eq("id", bomItemId)

  if (error) {
    console.error("Error deleting BOM item:", error)
    return { success: false, error: "Database error." }
  }

  revalidatePath(`/admin/products/variants/${productVariantId}/bom`)
  return { success: true }
}

// --- Availability Check Functions ---

export type OrderAvailabilityResult = {
  available: boolean;
  missing: { name: string; required: number; available: number; unit: string }[];
  error?: string;
}

/**
 * Checks material availability for an ENTIRE order.
 * It aggregates all required raw materials and checks against current stock.
 */
export async function checkOrderAvailability(orderId: number): Promise<OrderAvailabilityResult> {
  try {
    // 1. Get all line items for the specified order
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("variant_id, quantity")
      .eq("order_id", orderId)
  
    if (itemsError) throw itemsError
    if (!orderItems || orderItems.length === 0) {
      return { available: true, missing: [], error: "Order has no items to check." }
    }
  
    // 2. Aggregate all raw material requirements for the entire order
    const totalRequiredMaterials = new Map<number, { required: number, name: string, unit: string }>()
  
    for (const item of orderItems) {
      // Get the BOM (recipe) for this specific variant
      const bomItems = await getBomForVariant(item.variant_id)
  
      if (!bomItems || bomItems.length === 0) {
        return { available: false, missing: [], error: `No recipe (BOM) defined for a product in this order (variant ${item.variant_id}). Please define the recipe first.` }
      }
  
      // Add this item's material needs to the total map
      for (const bomItem of bomItems) {
        const materialId = bomItem.raw_material_id
        const requiredForThisItem = bomItem.quantity_required * item.quantity
        const materialDetails = bomItem.raw_materials
  
        const existing = totalRequiredMaterials.get(materialId)
  
        if (existing) {
          existing.required += requiredForThisItem
        } else {
          totalRequiredMaterials.set(materialId, {
            required: requiredForThisItem,
            name: materialDetails?.name ?? `Material ID ${materialId}`,
            unit: materialDetails?.unit_of_measure ?? 'units'
          })
        }
      }
    }
  
    // 3. Get current stock for all required materials in a single query
    const materialIds = Array.from(totalRequiredMaterials.keys())
    if (materialIds.length === 0) {
      return { available: true, missing: [], error: "Order items have no raw materials in their recipes." };
    }
  
    const { data: materialsStock, error: stockError } = await supabase
      .from("raw_materials")
      .select("id, current_stock")
      .in("id", materialIds)
  
    if (stockError) throw stockError
  
    const stockMap = new Map(materialsStock.map(m => [m.id, m.current_stock ?? 0]))
    const missingMaterials: OrderAvailabilityResult['missing'] = []
  
    // 4. Compare aggregated requirements against available stock
    for (const [materialId, requirement] of totalRequiredMaterials.entries()) {
      const availableStock = stockMap.get(materialId) ?? 0
  
      if (availableStock < requirement.required) {
        missingMaterials.push({
          name: requirement.name,
          required: requirement.required,
          available: Number(availableStock),
          unit: requirement.unit,
        })
      }
    }
  
    if (missingMaterials.length > 0) {
      return { available: false, missing: missingMaterials }
    } else {
      return { available: true, missing: [] }
    }
  
  } catch (error: any) {
    console.error("Error checking order availability:", error)
    return { available: false, missing: [], error: error.message || "Failed to check availability." }
  }
}

/**
 * Checks if there are enough raw materials in stock to produce a given quantity of a specific product variant.
 * Returns a list of missing materials and quantities if unavailable.
 */
export async function checkMaterialAvailability(variantId: number, quantityToProduce: number) {
  if (quantityToProduce <= 0) return { available: true, missing: [] };

  try {
    // 1. Get the BOM (recipe) for the variant
    const bomItems = await getBomForVariant(variantId)
    if (!bomItems || bomItems.length === 0) {
      return { available: false, missing: [], error: "No recipe (BOM) defined for this product variant." }
    }

    // 2. Get current stock for all required raw materials
    const requiredMaterialIds = bomItems.map(item => item.raw_material_id)
    const { data: materialsStock, error: stockError } = await supabase
        .from("raw_materials")
        .select("id, name, current_stock, unit_of_measure")
        .in("id", requiredMaterialIds)

    if (stockError) throw stockError
    if (!materialsStock) throw new Error("Could not fetch material stock.")

     const stockMap = new Map(materialsStock.map(m => [m.id, m]));


    // 3. Calculate required vs. available and identify shortages
    const missingMaterials: { name: string; required: number; available: number; unit: string }[] = []

    for (const bomItem of bomItems) {
      const requiredTotal = bomItem.quantity_required * quantityToProduce
      const materialInfo = stockMap.get(bomItem.raw_material_id);
      const availableStock = materialInfo?.current_stock ?? 0;


      if (availableStock < requiredTotal) {
        missingMaterials.push({
          name: materialInfo?.name ?? `Material ID ${bomItem.raw_material_id}`,
          required: requiredTotal,
          available: Number(availableStock), // Ensure it's a number
          unit: materialInfo?.unit_of_measure ?? 'units',
        })
      }
    }

    if (missingMaterials.length > 0) {
      return { available: false, missing: missingMaterials }
    } else {
      return { available: true, missing: [] }
    }

  } catch (error: any) {
    console.error("Error checking material availability:", error)
    return { available: false, missing: [], error: error.message || "Failed to check availability." }
  }
}