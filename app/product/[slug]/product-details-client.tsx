"use client"

import Image from "next/image"
import { useState, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart"
import { ProductWithVariants } from "@/app/_actions/products"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSidebar } from "@/components/ui/sidebar"
import { Loader2, Check, Pencil, X, Plus, Save, Image as ImageIcon, Star } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn, formatCloudinaryUrl } from "@/lib/utils"
// --- NEW Imports for Editing ---
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateProduct, updateProductVariant, createProductVariant } from "@/app/_actions/productActions"
import { deleteCloudinaryImage } from "@/app/_actions/adminActions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"

export function ProductDetailsClient({ product, isAdmin }: { product: ProductWithVariants, isAdmin?: boolean }) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const { setOpen } = useSidebar()
  const router = useRouter()

  // --- Button Interaction States ---
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  // --- Admin Editing States ---
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddVariantOpen, setIsAddVariantOpen] = useState(false)

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    product.variants.length > 0 ? product.variants[0].id : null
  )

  const selectedVariant = useMemo(() => {
    return product.variants.find(v => v.id === selectedVariantId)
  }, [selectedVariantId, product.variants])

  const imageList = useMemo(() => {
    // Reverted logic: Show only images relevant to the selected variant + main product fallback.
    const images: { url: string; type: 'cover' | 'gallery' | 'product'; isOwner: boolean }[] = []
    const seenUrls = new Set<string>()

    const addImage = (url: string, type: 'cover' | 'gallery' | 'product', isOwner: boolean) => {
      if (!url || seenUrls.has(url)) return
      images.push({ url, type, isOwner })
      seenUrls.add(url)
    }

    // 1. Selected Variant Cover
    if (selectedVariant?.image_url) {
      addImage(selectedVariant.image_url, 'cover', true)
    }

    // 2. Main Product Image (Fallback/Global)
    // We include this if:
    // a) No variant is selected (unlikely with current logic)
    // b) To show context?
    // User expectation: "I want different images for different variants."
    // Usually this means: Variant Cover + Variant Gallery.
    // However, traditionally we show product.image_url if nothing else.
    // Let's add it but ensure it's not a dupe (handled by seenUrls).
    if (product.image_url) {
      addImage(product.image_url, 'product', false) // Not owned by variant
    }

    // 3. Selected Variant Gallery
    if (selectedVariant?.image_urls) {
      selectedVariant.image_urls.forEach(url => addImage(url, 'gallery', true))
    }

    if (images.length === 0) addImage("https://res.cloudinary.com/dq077uui5/image/upload/v1766345243/House_of-2_page-0001_pzag8s.jpg", 'product', false)

    return images
  }, [selectedVariant, product.image_url])


  // --- Async Handle Add To Cart ---
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast({ title: "Please select an option", variant: "destructive" })
      return
    }

    setIsAdding(true)
    await new Promise(resolve => setTimeout(resolve, 600))

    addItem({
      variant_id: selectedVariant.id,
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      size: selectedVariant.size || "Standard",
      price: selectedVariant.price,
      image_url: imageList[0].url,
      qty: 1,
    })

    setIsAdding(false)
    setJustAdded(true)

    toast({ title: "Added to cart!", description: `${product.name} (${selectedVariant.size})` })
    setTimeout(() => setJustAdded(false), 3000)
  }

  // --- ADMIN ACTIONS ---

  const handleSaveProduct = async (formData: FormData) => {
    setIsSaving(true)
    // Only send fields relevant to product details
    const updates = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      // We do NOT send image_url or category here unless we added inputs for them
    }

    const res = await updateProduct(product.id, updates)
    if (res.success) {
      toast({ title: "Product details updated" })
      router.refresh()
    } else {
      toast({ title: "Error updating product", description: res.error, variant: "destructive" })
    }
    setIsSaving(false)
  }

  const handleSaveVariant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedVariant) return
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)

    const updates = {
      price: parseFloat(formData.get("price") as string),
      stock_quantity: parseInt(formData.get("stock_quantity") as string),
      // We do NOT send image_urls here
    }

    const res = await updateProductVariant(selectedVariant.id, updates)
    if (res.success) {
      toast({ title: "Variant price/stock updated" })
      router.refresh()
    } else {
      toast({ title: "Error updating variant", description: res.error, variant: "destructive" })
    }
    setIsSaving(false)
  }

  // --- ADD VARIANT ---
  const handleAddVariant = async (formData: FormData) => {
    setIsSaving(true)
    const data = {
      product_id: product.id,
      size: formData.get("size") as string,
      price: parseFloat(formData.get("price") as string),
      stock_quantity: parseInt(formData.get("stock_quantity") as string),
      // Defaults
      image_url: "",
      image_urls: []
    }

    const res = await createProductVariant(data)
    if (res.success) {
      toast({ title: "New variant added" })
      setIsAddVariantOpen(false)
      router.refresh()
    } else {
      toast({ title: "Error creating variant", description: res.error, variant: "destructive" })
    }
    setIsSaving(false)
  }

  // --- IMAGE MANAGEMENT ---

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large (max 10MB)", variant: "destructive" })
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(file.type)) {
      toast({ title: "Invalid format (jpg, png, webp, heic only)", variant: "destructive" })
      return
    }

    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      if (!cloudName) throw new Error("Cloudinary config missing")

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()
      const publicUrl = data.secure_url

      // Add to current variant GALLERY (image_urls)
      if (selectedVariant) {
        const currentUrls = selectedVariant.image_urls || []
        // Avoid duplicates
        if (!currentUrls.includes(publicUrl)) {
          const newUrls = [...currentUrls, publicUrl]

          const updates = {
            image_urls: newUrls
          }

          await updateProductVariant(selectedVariant.id, updates)
          toast({ title: "Image uploaded to gallery" })
          router.refresh()
        }
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({ title: "Upload failed", description: "Could not upload image.", variant: "destructive" })
    } finally {
      setIsSaving(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSetCover = async (url: string) => {
    if (!selectedVariant) return
    setIsSaving(true)
    const updates = {
      image_url: url
    }
    const res = await updateProductVariant(selectedVariant.id, updates)
    if (res.success) {
      toast({ title: "Cover photo updated" })
      router.refresh()
    } else {
      toast({ title: "Failed to set cover", variant: "destructive" })
    }
    setIsSaving(false)
  }

  const handleRemoveImage = async (urlToRemove: string) => {
    if (!selectedVariant) return
    if (!confirm("Remove this image? This will delete it permanently.")) return
    setIsSaving(true)

    try {
      // 1. Delete from Cloudinary first
      const deleteRes = await deleteCloudinaryImage(urlToRemove)

      if (!deleteRes.success) {
        console.error("Cloudinary deletion failed:", deleteRes.error)
        // Optional: Halt if strict. For now, we warn but proceed to remove from DB so UI isn't broken?
        // User asked "fix it", implying they want it gone from Cloudinary.
        // If I proceed, it's gone from UI/DB but stuck in Cloudinary.
        // If I halt, they know it failed.
        if (!confirm(`Failed to delete from Cloud Storage: ${deleteRes.error}. Remove from database anyway?`)) {
          setIsSaving(false)
          return
        }
      }

      // 2. Remove from Database
      let updatedUrls = selectedVariant.image_urls || []
      let updatedCover = selectedVariant.image_url
      let changed = false

      if (updatedUrls.includes(urlToRemove)) {
        updatedUrls = updatedUrls.filter(u => u !== urlToRemove)
        changed = true
      }

      if (updatedCover === urlToRemove) {
        updatedCover = ""
        changed = true
      }

      if (changed) {
        const updates: { image_urls?: string[], image_url?: string } = {}
        if (updatedUrls) updates.image_urls = updatedUrls
        if (updatedCover !== undefined && updatedCover !== null) updates.image_url = updatedCover
        else if (updatedCover === null) updates.image_url = "" // Treat null as unset

        await updateProductVariant(selectedVariant.id, updates)
        toast({ title: "Image removed permanently" })
        router.refresh()
      }

    } catch (error) {
      toast({ title: "Failed to remove image", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative">
      {isAdmin && (
        <div className="fixed top-24 right-4 z-50 flex items-center gap-2 bg-background/90 backdrop-blur border p-2 rounded-lg shadow-lg">
          <Label htmlFor="edit-mode" className="text-sm font-semibold cursor-pointer">Admin Edit</Label>
          <Switch id="edit-mode" checked={isEditMode} onCheckedChange={setIsEditMode} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 w-full max-w-full">
        {/* IMAGE SECTION */}
        <div className="space-y-4 min-w-0">
          <Carousel className="w-full" opts={{ loop: true }}>
            <CarouselContent>
              {imageList.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md group">
                    <Image
                      src={formatCloudinaryUrl(img.url)}
                      alt={`${product.name} - view ${index + 1}`}
                      width={960}
                      height={720}
                      className="h-full w-full object-cover"
                      priority={index === 0}
                    />

                    {/* EDIT OVERLAYS */}
                    {isEditMode && isAdmin && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSetCover(img.url)}
                          disabled={isSaving || (img.type === 'cover' && img.isOwner)} // Disable if it's ALREADY the cover of CURRENT variant
                          title="Set as Variant Cover"
                        >
                          {img.type === 'cover' && img.isOwner ? <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> : <Star className="h-4 w-4" />}
                          <span className="ml-2 sr-only">Set Cover</span>
                        </Button>

                        {img.isOwner && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveImage(img.url)}
                            disabled={isSaving}
                            title="Remove Image"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Badge for Cover */}
                    {isEditMode && isAdmin && img.type === 'cover' && img.isOwner && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow-sm">
                        COVER
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}

            </CarouselContent>
            {/* Hide buttons on mobile to prevent overlay/overflow issues - users swipe anyway */}
            <CarouselPrevious className="absolute left-2 hidden md:flex" />
            <CarouselNext className="absolute right-2 hidden md:flex" />
          </Carousel>

          {isEditMode && isAdmin && (
            <div className="flex justify-center flex-col items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button variant="outline" onClick={handleUploadClick} disabled={isSaving} className="w-full">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Upload New Photo to Gallery
              </Button>
              <p className="text-xs text-muted-foreground">Uploaded photos go to the Gallery. Hover over an image to set as Cover.</p>
            </div>
          )}
        </div>

        {/* DETAILS SECTION */}
        <div className="space-y-6 min-w-0">
          {/* PRODUCT INFO EDIT */}
          {isEditMode && isAdmin ? (
            <form action={handleSaveProduct} className="space-y-4 border p-4 rounded-lg bg-muted/20">
              <h3 className="font-semibold text-sm mb-2">Edit Product Details</h3>
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" defaultValue={product.name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={product.description || ""} />
              </div>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Product Details
              </Button>
            </form>
          ) : (
            <div>
              <h1 className="font-heading text-3xl flex items-center gap-2">
                {product.name}
              </h1>
              <p className="mt-2 text-muted-foreground">{product.description}</p>
            </div>
          )}

          {/* VARIANT SELECTOR */}
          <div>
            <div className="flex items-center justify-between pointer-events-auto">
              <Label className="text-sm font-medium">Size</Label>
              {isEditMode && isAdmin && (
                <Dialog open={isAddVariantOpen} onOpenChange={setIsAddVariantOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 gap-1 text-primary">
                      <Plus className="h-3 w-3" /> Add Variant
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Variant</DialogTitle>
                      <DialogDescription>Create a new size option for {product.name}</DialogDescription>
                    </DialogHeader>
                    <form action={handleAddVariant} className="space-y-4 mt-4">
                      <div className="grid gap-2">
                        <Label htmlFor="new-size">Size Name</Label>
                        <Input id="new-size" name="size" placeholder="e.g. Large, 500g" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="new-price">Price (₹)</Label>
                          <Input id="new-price" name="price" type="number" step="0.01" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-stock">Initial Stock</Label>
                          <Input id="new-stock" name="stock_quantity" type="number" required />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isSaving}>
                          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Variant
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {(product.variants.length > 1 || isEditMode) && (
              <RadioGroup
                defaultValue={String(selectedVariantId)}
                onValueChange={(value) => setSelectedVariantId(Number(value))}
                className="mt-2 flex flex-wrap items-center gap-3"
              >
                {product.variants.map((variant) => (
                  <div key={variant.id} className="flex items-center">
                    <RadioGroupItem value={String(variant.id)} id={`size-${variant.id}`} />
                    <Label htmlFor={`size-${variant.id}`} className="ml-2 cursor-pointer">
                      {variant.size}
                    </Label>
                  </div>
                ))}
                {product.variants.length === 0 && <p className="text-sm text-muted-foreground italic">No variants available.</p>}
              </RadioGroup>
            )}
          </div>

          {/* VARIANT INFO EDIT */}
          {isEditMode && isAdmin && selectedVariant ? (
            <form key={selectedVariant.id} onSubmit={handleSaveVariant} className="space-y-4 border p-4 rounded-lg bg-blue-50/50">
              <h3 className="font-semibold text-sm text-blue-900 mb-2">Edit Variant: {selectedVariant.size}</h3>
              <div className="flex gap-4">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" name="price" type="number" step="0.01" defaultValue={selectedVariant.price} />
                </div>
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="stock_quantity">Stock</Label>
                  <Input id="stock_quantity" name="stock_quantity" type="number" defaultValue={selectedVariant.stock_quantity} />
                </div>
              </div>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Update Price & Stock
              </Button>
            </form>
          ) : (
            <div>
              <p className="text-2xl font-medium">₹{selectedVariant?.price || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">
                {selectedVariant && selectedVariant.stock_quantity > 0
                  ? `${selectedVariant.stock_quantity} in stock`
                  : product.variants.length > 0 ? "Out of stock" : "Unavailable"}
              </p>
            </div>
          )}

          {/* ADD TO CART ACTION */}
          {!isEditMode && (
            <Button
              className={cn(
                "w-full md:w-auto min-w-[140px] transition-all duration-300",
                justAdded
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-brand text-primary-foreground hover:bg-brand-900"
              )}
              onClick={justAdded ? () => setOpen(true) : handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock_quantity === 0 || isAdding}
            >
              {isAdding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : justAdded ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Go to Cart
                </>
              ) : (
                selectedVariant && selectedVariant.stock_quantity > 0 ? "Add to cart" : "Out of Stock"
              )}
            </Button>
          )}
        </div>
      </div>
    </div >
  )
}