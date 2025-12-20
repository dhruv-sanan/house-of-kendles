"use server"

import { supabase } from "@/lib/supabase/client"

export async function getDashboardStats() {
  try {
    // Get count of orders that need action
    const { count: pendingOrdersCount, error: ordersError } = await supabase
      .from("orders")
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending_payment', 'processing'])

    if (ordersError) throw ordersError

    // Get count of product variants running low on stock (e.g., less than 5)
    const { count: lowStockCount, error: stockError } = await supabase
      .from("product_variants")
      .select('*', { count: 'exact', head: true })
      .lt('stock_quantity', 5) // 'lt' = less than 5

    if (stockError) throw stockError

    // Get count of total vendors
    const { count: vendorCount, error: vendorsError } = await supabase
      .from("vendors")
      .select('*', { count: 'exact', head: true })

    if (vendorsError) throw vendorsError

    return {
      success: true,
      pendingOrdersCount: pendingOrdersCount ?? 0,
      lowStockCount: lowStockCount ?? 0,
      vendorCount: vendorCount ?? 0,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return { success: false, pendingOrdersCount: 0, lowStockCount: 0, vendorCount: 0 }
  }
}