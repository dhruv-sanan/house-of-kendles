import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import { getProducts } from "@/app/_actions/products"
import { StockClientPage } from "@/app/admin/products/StockClientPage"

export default async function AdminStockPage() {
  const products = await getProducts()

  return (
    <div className="flex min-h-screen flex-col">
      {/* The AdminLayout will provide the main header/nav */}
      <StockClientPage products={products} />
      <SiteFooter />
    </div>
  )
}
