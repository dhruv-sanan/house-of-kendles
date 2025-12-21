import { notFound } from "next/navigation"
import { getProductVariantById } from "@/app/_actions/products"
import { VariantEditForm } from "./variant-edit-form"
import Link from "next/link"

export default async function VariantEditPage({ params }: { params: Promise<{ variantId: string }> }) {
    const { variantId: variantIdParam } = await params
    const variantId = Number(variantIdParam)
    if (isNaN(variantId)) {
        notFound()
    }

    const variant = await getProductVariantById(variantId)

    if (!variant) {
        notFound()
    }

    return (
        <main className="flex-grow p-4 md:p-10 max-w-4xl mx-auto">
            <Link href="/admin/products" className="text-sm text-muted-foreground hover:underline mb-4 block">
                &larr; Back to Stock Management
            </Link>

            <div className="mb-8">
                <h1 className="font-heading text-3xl">Edit Variant</h1>
                <p className="text-muted-foreground mt-1">
                    Update details for <span className="font-medium text-foreground">{variant.productName}</span> - {variant.size}
                </p>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <VariantEditForm variant={variant} />
            </div>
        </main>
    )
}
