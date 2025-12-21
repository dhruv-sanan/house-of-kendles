"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateProductVariant, type VariantUpdateData } from "@/app/_actions/productActions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { SingleImageField } from "@/components/ui/single-image-field"
import { MultipleImageField } from "@/components/ui/multiple-image-field"

interface VariantEditFormProps {
    variant: {
        id: number
        size: string | null
        price: number
        stock_quantity: number
        is_bestseller: boolean
        image_url: string | null
        image_urls: string[] | null
        flavor: string | null
    }
}

export function VariantEditForm({ variant }: VariantEditFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition()

    // State for image fields
    const [mainImageUrl, setMainImageUrl] = useState(variant.image_url || "")
    const [imageUrls, setImageUrls] = useState<string[]>(variant.image_urls || [])
    const [isBestseller, setIsBestseller] = useState(variant.is_bestseller)

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            // Filter out empty URL strings from the array
            const validImageUrls = imageUrls.filter(url => url.trim() !== "")

            const data: VariantUpdateData = {
                size: (formData.get("size") as string) || undefined,
                price: Number(formData.get("price")),
                stock_quantity: Number(formData.get("stock_quantity")),
                flavor: (formData.get("flavor") as string) || undefined,
                image_url: mainImageUrl || undefined,
                is_bestseller: isBestseller,
                image_urls: validImageUrls,
            }

            const result = await updateProductVariant(variant.id, data)

            if (result.success) {
                toast({
                    title: "Variant updated",
                    description: "The variant details have been saved.",
                })
                router.push("/admin/products")
                router.refresh()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to update variant.",
                    variant: "destructive",
                })
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-8 max-w-2xl">

            <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Size */}
                    <div className="grid gap-2">
                        <Label htmlFor="size">Size / Option Name</Label>
                        <Input
                            id="size"
                            name="size"
                            defaultValue={variant.size || ""}
                            placeholder="e.g. Large, 200g"
                            disabled={isPending}
                        />
                    </div>

                    {/* Flavor */}
                    <div className="grid gap-2">
                        <Label htmlFor="flavor">Flavor (Optional)</Label>
                        <Input
                            id="flavor"
                            name="flavor"
                            defaultValue={variant.flavor || ""}
                            placeholder="e.g. Vanilla"
                            disabled={isPending}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Price */}
                    <div className="grid gap-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={variant.price}
                            required
                            disabled={isPending}
                        />
                    </div>

                    {/* Stock */}
                    <div className="grid gap-2">
                        <Label htmlFor="stock_quantity">Stock Quantity</Label>
                        <Input
                            id="stock_quantity"
                            name="stock_quantity"
                            type="number"
                            step="1"
                            min="0"
                            defaultValue={variant.stock_quantity}
                            required
                            disabled={isPending}
                        />
                    </div>
                </div>

                {/* Is Bestseller */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Bestseller Status</Label>
                        <p className="text-sm text-muted-foreground">
                            Mark this variant as a bestseller to highlight it.
                        </p>
                    </div>
                    <Switch
                        checked={isBestseller}
                        onCheckedChange={setIsBestseller}
                        disabled={isPending}
                    />
                </div>

                <hr />

                <hr />

                {/* Main Image */}
                <div className="grid gap-2">
                    <Label htmlFor="image_url">Main Variant Image URL</Label>
                    <input type="hidden" name="image_url" value={mainImageUrl} />
                    <SingleImageField
                        value={mainImageUrl}
                        onChange={setMainImageUrl}
                        disabled={isPending}
                    />
                    <p className="text-xs text-muted-foreground">This image is used as the primary thumbnail.</p>
                </div>

                {/* Additional Images (Array) */}
                <div className="grid gap-2">
                    <Label>Additional Gallery Images</Label>
                    <MultipleImageField
                        value={imageUrls}
                        onChange={setImageUrls}
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Variant
                </Button>
            </div>
        </form>
    )
}
