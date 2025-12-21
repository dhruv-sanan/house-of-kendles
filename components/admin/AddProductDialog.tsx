"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProduct } from "@/app/_actions/adminActions"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type AddProductDialogProps = {
    isAdmin: boolean
    categoryOptions?: string[]
    fixedCategory?: string
    pageTitle: string
}

export function AddProductDialog({ isAdmin, categoryOptions, fixedCategory, pageTitle }: AddProductDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    if (!isAdmin) return null

    const handleCreate = async (formData: FormData) => {
        setIsSaving(true)
        const name = formData.get("name") as string
        const slug = formData.get("slug") as string
        const category = fixedCategory || formData.get("category") as string

        const data = {
            name,
            slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            description: formData.get("description") as string,
            category,
            price: parseFloat(formData.get("price") as string),
            stock: parseInt(formData.get("stock") as string),
            image_url: ""
        }

        const res = await createProduct(data)

        if (res.success) {
            toast({ title: "Product created!", description: "Redirecting..." })
            setIsOpen(false)
            // Refresh current page to maybe show it?
            router.refresh()
            // Optional: redirect to the new product page to edit images?
            // router.push(`/product/${res.slug}`) 
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
        setIsSaving(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4" /> Add {pageTitle}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add New {pageTitle}</DialogTitle>
                    <DialogDescription>
                        Create a new product listing. You can add images later in the product page.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleCreate} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" name="name" required placeholder="e.g. Midnight Jasmine" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">Slug (URL)</Label>
                        <Input id="slug" name="slug" placeholder="midnight-jasmine-candle" />
                        <p className="text-xs text-muted-foreground">Leave empty to auto-generate from name.</p>
                    </div>

                    {!fixedCategory && categoryOptions && (
                        <div className="grid gap-2">
                            <Label htmlFor="category">Collection / Category</Label>
                            <Select name="category" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select collection" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryOptions.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="description">Short Description</Label>
                        <Textarea id="description" name="description" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Base Price (₹)</Label>
                            <Input id="price" name="price" type="number" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stock">Initial Stock</Label>
                            <Input id="stock" name="stock" type="number" required defaultValue="10" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create Product
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
