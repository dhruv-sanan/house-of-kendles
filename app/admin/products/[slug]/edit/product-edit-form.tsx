"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateProduct, type ProductUpdateData } from "@/app/_actions/productActions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SingleImageField } from "@/components/ui/single-image-field"

interface ProductEditFormProps {
    product: {
        id: number
        name: string
        description: string | null
        category: string | null
        image_url: string | null
        slug: string
    }
    categories: string[] // Unique categories for dropdown
}

export function ProductEditForm({ product, categories }: ProductEditFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition()
    const [imageUrl, setImageUrl] = useState(product.image_url || "")

    // Local state for slug for real-time validation feedback (optional, but good for UX)
    // For now we trust the server action validation.

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const data: ProductUpdateData = {
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                category: formData.get("category") as string,
                image_url: formData.get("image_url") as string,
                slug: formData.get("slug") as string,
            }

            const result = await updateProduct(product.id, data)

            if (result.success) {
                toast({
                    title: "Product updated",
                    description: "The product details have been saved.",
                })
                router.push("/admin/products")
                router.refresh()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to update product.",
                    variant: "destructive",
                })
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid gap-4">
                {/* Name */}
                <div className="grid gap-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={product.name}
                        required
                        disabled={isPending}
                    />
                </div>

                {/* Slug */}
                <div className="grid gap-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                        id="slug"
                        name="slug"
                        defaultValue={product.slug}
                        required
                        pattern="[a-z0-9-]+"
                        title="Lowercase letters, numbers, and hyphens only"
                        disabled={isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                        Changing the slug will change the product URL.
                    </p>
                </div>

                {/* Category */}
                <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <div className="relative">
                        <Input
                            list="category-options"
                            id="category"
                            name="category"
                            defaultValue={product.category || ""}
                            required
                            disabled={isPending}
                            placeholder="Select or type a category..."
                        />
                        <datalist id="category-options">
                            {categories.map((cat) => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </div>
                    <p className="text-xs text-muted-foreground">Select existing or type new.</p>
                </div>

                {/* Image URL */}
                <div className="grid gap-2">
                    <Label htmlFor="image_url">Main Image URL</Label>
                    <input type="hidden" name="image_url" value={imageUrl} />
                    <SingleImageField
                        value={imageUrl}
                        onChange={setImageUrl}
                        disabled={isPending}
                    />
                </div>

                {/* Description */}
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={product.description || ""}
                        className="min-h-[100px]"
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    )
}
