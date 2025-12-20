"use client"

import { useState, useMemo, useTransition, useRef } from "react"
import type { ProductWithVariants } from "../../_actions/products"
import { updateStock } from "../../_actions/productActions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"; // <-- Add this import
import { FilePenLine } from "lucide-react"; // <-- Add icon import

function StockUpdateForm({ variantId }: { variantId: number }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateStock(formData)
      const operation = formData.get("operation")
  
      if (result.success) {
        toast({
          title: "Success!",
          description:
            operation === "add"
              ? "Stock successfully increased."
              : "Stock successfully reduced.",
        })
        formRef.current?.reset()
      } else {
        toast({
          title: "Error",
          description: result.error || "An unknown error occurred.",
          variant: "destructive",
        })
      }
    })
  }
  

  return (
    <form ref={formRef} action={handleAction} className="flex items-center gap-2">
      <input type="hidden" name="variantId" value={variantId} />
      <Input
        type="number"
        name="amount"
        min="1"
        placeholder="Qty"
        className="h-9 w-20"
        required
        disabled={isPending}
      />
      <Button
        type="submit"
        name="operation"
        value="add"
        size="sm"
        variant="outline"
        disabled={isPending}
      >
        {isPending ? "..." : "Add"}
      </Button>
      <Button
        type="submit"
        name="operation"
        value="subtract"
        size="sm"
        variant="destructive"
        disabled={isPending}
      >
        {isPending ? "..." : "Remove"}
      </Button>
    </form>
  )
}

export function StockClientPage({ products }: { products: ProductWithVariants[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, products])

  return (
    <main className="mx-auto w-full max-w-4xl flex-grow px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl">Manage Stock</h1>
          <p className="mt-1 text-muted-foreground">
            Search for a product and adjust stock levels for each variant.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full pl-8 sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="rounded-lg border">
              <div className="bg-muted/50 p-4">
                <h2 className="font-semibold">{product.name}</h2>
              </div>
              <div className="divide-y">
                {product.variants.map((variant) => (
                  <div key={variant.id} className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center">
                    {/* Left Side: Variant Info & Recipe Link */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                       <div>
                         <p className="font-medium">{variant.size}</p>
                         <p className="text-sm text-muted-foreground">
                            Current Stock: <span className="text-lg font-bold">{variant.stock_quantity}</span>
                         </p>
                       </div>
                       {/* --- ADDED: Link to BOM Editor --- */}
                       <Link href={`/admin/products/variants/${variant.id}/bom`}>
                           <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                               <FilePenLine className="mr-1.5 h-4 w-4" />
                               Edit Recipe
                           </Button>
                       </Link>
                    </div>

                    {/* Right Side: Stock Update Form */}
                    <StockUpdateForm variantId={variant.id} />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p>No products found matching your search.</p>
          </div>
        )}
      </div>
      
    </main>
  )
}

