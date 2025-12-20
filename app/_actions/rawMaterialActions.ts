"use server"

import { supabase } from "@/lib/supabase/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// --- Raw Material Schema (Unchanged) ---
const RawMaterialSchema = z.object({
  name: z.string().min(1, "Material name is required"),
  unit_of_measure: z.string().min(1, "Unit of measure is required (e.g., kg, units)"),
  category: z.string().optional(),
  notes: z.string().optional(),
})

// --- ManualStockAdjustSchema (Unchanged) ---
const ManualStockAdjustSchema = z.object({
  materialId: z.coerce.number(),
  adjustment: z.coerce.number().int(),
})

// --- UPDATED: Purchase Log Schema ---
const PurchaseLogSchema = z.object({
  // Fixes the 'NaN' error for "No Vendor"
  vendorId: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().optional()),
  
  rawMaterialId: z.coerce.number({invalid_type_error: 'Please select a material'}),
  quantityPurchased: z.coerce.number().positive("Quantity must be positive"),
  totalCost: z.coerce.number().nonnegative("Cost cannot be negative").optional(),
  dateReceived: z.coerce.date().optional().default(new Date()),
  notes: z.string().optional(),
})


// --- Raw Material Functions ---

// getRawMaterials function remains unchanged
export async function getRawMaterials(category?: string) {
  let query = supabase
    .from("raw_materials")
    .select("*")
    .order("name")

  if (category && category !== 'all' && category !== 'other') {
    query = query.eq('category', category)
  } else if (category === 'other') {
    query = query.is('category', null)
  }
  // If 'all', no filter is applied

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching raw materials:", error)
    return []
  }
  return data
}

// --- UPDATED: addRawMaterial Function ---
export async function addRawMaterial(formData: FormData) {
  const validatedFields = RawMaterialSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
    return { success: false, error: "Invalid data." }
  }

  const dataToInsert = validatedFields.data;
  
  // <-- FIX: Handle "__other__" or empty string as NULL -->
  if (dataToInsert.category === "" || dataToInsert.category === "__other__") {
    dataToInsert.category = undefined; 
  }

  const { error } = await supabase.from("raw_materials").insert(dataToInsert)

  if (error) {
    console.error("Error adding raw material:", error)
    return { success: false, error: "Database error." }
  }

  revalidatePath("/admin/materials")
  return { success: true }
}

// adjustRawMaterialStockManual function remains unchanged
export async function adjustRawMaterialStockManual(formData: FormData) {
  const validatedFields = ManualStockAdjustSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success || validatedFields.data.adjustment === 0) {
    return { success: false, error: "Invalid adjustment value." }
  }

  const { materialId, adjustment } = validatedFields.data

  try {
     const { error } = await supabase.rpc("adjust_raw_material_stock", {
      material_id_to_update: materialId,
      quantity_change: adjustment,
    })
    if (error) throw error
    revalidatePath("/admin/materials")
    return { success: true }
  } catch(error) {
    console.error("Error adjusting stock:", error)
    return { success: false, error: "Failed to adjust stock."}
  }
}

// --- Purchase Log Functions (Unchanged from last fix) ---

export async function addPurchaseLog(formData: FormData) {
  const validatedFields = PurchaseLogSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
     console.error("Purchase log validation error:", validatedFields.error.flatten().fieldErrors)
    const errors = validatedFields.error.flatten().fieldErrors;
    const firstError = errors.vendorId?.[0] || errors.rawMaterialId?.[0] || errors.quantityPurchased?.[0] || "Invalid purchase data.";
    return { success: false, error: firstError }
  }

  const purchaseData = validatedFields.data

  try {
    const { error: logError } = await supabase.from("purchase_log").insert({
      vendor_id: purchaseData.vendorId,
      raw_material_id: purchaseData.rawMaterialId,
      quantity_purchased: purchaseData.quantityPurchased,
      total_cost: purchaseData.totalCost,
      date_received: purchaseData.dateReceived?.toISOString().split('T')[0],
      notes: purchaseData.notes,
    })
    if (logError) throw logError

    const { error: stockError } = await supabase.rpc("adjust_raw_material_stock", {
      material_id_to_update: purchaseData.rawMaterialId,
      quantity_change: purchaseData.quantityPurchased,
    })
    if (stockError) throw stockError

    revalidatePath("/admin/materials")
    return { success: true }

  } catch (error) {
    console.error("Error adding purchase log:", error)
    return { success: false, error: "Failed to log purchase and update stock." }
  }
}

// getPurchaseHistory function remains unchanged
export async function getPurchaseHistory(category?: string) {
   let query = supabase
    .from("purchase_log")
    .select(`
      *,
      vendors ( name ),
      raw_materials!inner ( name, unit_of_measure, category )
    `)
    .order("date_received", { ascending: false })
    .limit(50)

    if (category && category !== 'all' && category !== 'other') {
      query = query.eq('raw_materials.category', category)
    } else if (category === 'other') {
       query = query.is('raw_materials.category', null)
    }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching purchase history:", error);
    return [];
  }
  return data;
}