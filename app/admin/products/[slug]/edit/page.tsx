import { notFound } from "next/navigation"
import { getProductBySlug, getProducts } from "@/app/_actions/products"
import { ProductEditForm } from "./product-edit-form"
import Link from "next/link"

export default async function ProductEditPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const product = await getProductBySlug(slug)

    if (!product) {
        notFound()
    }

    // Get all unique categories for the dropdown
    // We can fetch all products and extract unique categories
    // Or just pass a few static ones if performance is an issue, but getting distinct from DB is better 
    // reusing getProducts for now as we don't have a getCategories, which is efficient enough for small catalog
    const allProducts = await getProducts()
    const categories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean))) as string[]

    return (
        <main className="flex-grow p-4 md:p-10 max-w-4xl mx-auto">
            <Link href="/admin/products" className="text-sm text-muted-foreground hover:underline mb-4 block">
                &larr; Back to Stock Management
            </Link>

            <div className="mb-8">
                <h1 className="font-heading text-3xl">Edit Product</h1>
                <p className="text-muted-foreground mt-1">
                    Update general details for {product.name}
                </p>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <ProductEditForm product={product} categories={categories} />
            </div>
        </main>
    )
}
