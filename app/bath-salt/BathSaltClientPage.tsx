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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { cn, formatCloudinaryUrl } from "@/lib/utils"
// Icons
import { Check, Droplet, Leaf, Sparkle, Info, Flame, ShieldCheck, Loader2, Pencil, X, Plus, Save, SquarePen, Star } from "lucide-react"
import { IngredientsModal } from "@/app/bath-salt/IngredientsModal"
// Action & Components for Editing
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


function BenefitItem({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="mt-1 text-muted-foreground">{children}</p>
      </div>
    </div>
  )
}

export function BathSaltClientPage({ product, isAdmin }: { product: ProductWithVariants, isAdmin?: boolean }) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  // State
  const [selectedFlavor, setSelectedFlavor] = useState<string>("Lavender")
  const [selectedSize, setSelectedSize] = useState<string>("400g")
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false)
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)

  // Edit State
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddVariantOpen, setIsAddVariantOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- Derived Data ---

  // Identify currently selected variant
  const selectedVariant = useMemo(() => {
    return product.variants.find(
      v => v.flavor === selectedFlavor && v.size === selectedSize
    )
  }, [selectedFlavor, selectedSize, product.variants])

  // Flavors available (for View Mode)
  const flavorData = useMemo(() => {
    const flavorMap = new Map<string, { isBestseller: boolean }>()
    for (const v of product.variants) {
      if (!v.flavor) continue
      const existing = flavorMap.get(v.flavor)
      flavorMap.set(v.flavor, {
        isBestseller: existing?.isBestseller || v.is_bestseller
      })
    }
    return Array.from(flavorMap.entries()).map(([name, data]) => ({ name, ...data }))
  }, [product.variants])

  // Sizes available (for View Mode)
  const sizes = useMemo(() => {
    return [...new Set(product.variants.map(v => v.size).filter(Boolean))] as string[]
  }, [product.variants])

  // Images Logic (Adapted for consistency with Product Page + Granular Editing)
  const imageList = useMemo(() => {
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
    if (product.image_url) {
      addImage(product.image_url, 'product', false)
    }

    // 3. Selected Variant Gallery
    if (selectedVariant?.image_urls) {
      selectedVariant.image_urls.forEach(url => addImage(url, 'gallery', true))
    }

    if (images.length === 0) addImage("/placeholder.png", 'product', false)

    return images
  }, [selectedVariant, product.image_url])


  // --- Actions ---

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast({ title: "Please select a flavor and size", variant: "destructive" })
      return
    }
    addItem({
      variant_id: selectedVariant.id,
      product_id: product.id,
      name: `${product.name} - ${selectedVariant.flavor}`,
      slug: product.slug,
      size: selectedVariant.size || "Standard",
      price: selectedVariant.price,
      image_url: imageList[0].url,
      qty: 1,
    })
    toast({ title: "Added to cart!", description: `${product.name} (${selectedVariant.flavor} / ${selectedVariant.size})` })
  }

  // --- ADMIN HANDLERS ---

  const handleSaveProduct = async (formData: FormData) => {
    setIsSaving(true)
    const updates = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    }
    const res = await updateProduct(product.id, updates)
    if (res.success) {
      toast({ title: "Product details updated" })
      router.refresh()
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" })
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
    }
    const res = await updateProductVariant(selectedVariant.id, updates)
    if (res.success) {
      toast({ title: "Variant updated" })
      router.refresh()
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" })
    }
    setIsSaving(false)
  }

  const handleAddVariant = async (formData: FormData) => {
    setIsSaving(true)
    const data = {
      product_id: product.id,
      // For Bath Salt, we need Flavor AND Size
      flavor: formData.get("flavor") as string,
      size: formData.get("size") as string,
      price: parseFloat(formData.get("price") as string),
      stock_quantity: parseInt(formData.get("stock_quantity") as string),
      image_url: "",
      image_urls: []
    }

    const res = await createProductVariant(data)
    if (res.success) {
      toast({ title: "New variant added" })
      setIsAddVariantOpen(false)
      router.refresh()
      // Optionally switch to new variant
      setSelectedFlavor(data.flavor)
      setSelectedSize(data.size)
    } else {
      toast({ title: "Error creating variant", description: res.error, variant: "destructive" })
    }
    setIsSaving(false)
  }

  // Image Management
  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large (max 10MB)", variant: "destructive" })
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(file.type)) {
      toast({ title: "Invalid format", variant: "destructive" })
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

      if (selectedVariant) {
        const currentUrls = selectedVariant.image_urls || []
        if (!currentUrls.includes(publicUrl)) {
          await updateProductVariant(selectedVariant.id, { image_urls: [...currentUrls, publicUrl] })
          toast({ title: "Image uploaded to gallery" })
          router.refresh()
        }
      } else {
        toast({ title: "No variant selected to attach image to", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" })
    } finally {
      setIsSaving(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSetCover = async (url: string) => {
    if (!selectedVariant) return
    setIsSaving(true)
    const res = await updateProductVariant(selectedVariant.id, { image_url: url })
    if (res.success) {
      toast({ title: "Cover updated" })
      router.refresh()
    }
    setIsSaving(false)
  }

  const handleRemoveImage = async (urlToRemove: string) => {
    if (!selectedVariant) return
    if (!confirm("Remove this image? This will delete it permanently.")) return
    setIsSaving(true)
    try {
      // 1. Delete from Cloudinary
      const deleteRes = await deleteCloudinaryImage(urlToRemove)
      if (!deleteRes.success) {
        console.error("Cloudinary deletion failed:", deleteRes.error)
        if (!confirm(`Failed to delete from Cloud Storage: ${deleteRes.error}. Remove from database anyway?`)) {
          setIsSaving(false)
          return
        }
      }

      // 2. Remove from DB
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
        if (updatedCover !== undefined) updates.image_url = updatedCover
        else if (updatedCover === "") updates.image_url = ""

        await updateProductVariant(selectedVariant.id, updates)
        toast({ title: "Image removed permanently" })
        router.refresh()
      }
    } catch (error) {
      toast({ title: "Failed" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {/* Admin Toggle */}
      {isAdmin && (
        <div className="fixed top-24 right-4 z-50 flex items-center gap-2 bg-background/90 backdrop-blur border p-2 rounded-lg shadow-lg">
          <Label htmlFor="edit-mode" className="text-sm font-semibold cursor-pointer">Admin Edit</Label>
          <Switch id="edit-mode" checked={isEditMode} onCheckedChange={setIsEditMode} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Carousel Section */}
        <div className="space-y-4">
          <Carousel className="w-full" opts={{ loop: true }} setApi={setCarouselApi}>
            <CarouselContent>
              {imageList.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg group">
                    <Image
                      src={formatCloudinaryUrl(img.url)}
                      alt={`${product.name} - view ${index + 1}`}
                      width={960}
                      height={960}
                      className="h-full w-full object-cover"
                      priority={index === 0}
                    />
                    {/* Edit Overlays */}
                    {isEditMode && isAdmin && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSetCover(img.url)}
                          disabled={isSaving || (img.type === 'cover' && img.isOwner)}
                        >
                          {img.type === 'cover' && img.isOwner ? <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> : <Star className="h-4 w-4" />}
                        </Button>
                        {img.isOwner && (
                          <Button variant="destructive" size="sm" onClick={() => handleRemoveImage(img.url)} disabled={isSaving}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                    {/* Coverage Badge */}
                    {isEditMode && isAdmin && img.type === 'cover' && img.isOwner && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow-sm">COVER</div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-3" />
            <CarouselNext className="absolute right-3" />
          </Carousel>

          {isEditMode && isAdmin && (
            <div className="flex flex-col items-center gap-2">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <Button variant="outline" onClick={handleUploadClick} disabled={isSaving} className="w-full">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Upload Photo to {selectedFlavor} ({selectedSize})
              </Button>
            </div>
          )}
        </div>

        {/* Product Info & Selection */}
        <div className="space-y-6">
          {/* Title & Desc Edit */}
          {isEditMode && isAdmin ? (
            <form action={handleSaveProduct} className="space-y-4 border p-4 rounded-lg bg-muted/20">
              <Input name="name" defaultValue={product.name} className="font-heading text-2xl" />
              <Textarea name="description" defaultValue={product.description || ""} rows={4} />
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Info
              </Button>
            </form>
          ) : (
            <>
              <h1 className="font-heading text-4xl">{product.name}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
            </>
          )}


          {/* View Mode Price (Hidden in Edit Mode to reduce clutter?? Or Keep?) */}
          {/* Actually, show it in View Mode. In Edit Mode, it's inside the Variant Form. */}
          {!isEditMode && (
            <p className="text-3xl font-light">
              {selectedVariant?.price ? `₹${selectedVariant.price}` : `Please select options`}
            </p>
          )}

          {/* Flavor Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Choose Your Scent:</Label>
              {/* Add Variant Button - Put here in Edit Mode */}
              {isEditMode && isAdmin && (
                <Dialog open={isAddVariantOpen} onOpenChange={setIsAddVariantOpen}>
                  <DialogTrigger asChild><Button variant="ghost" size="sm" className="h-6"><Plus className="h-3 w-3 mr-1" />New Variant</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add New Bath Salt Variant</DialogTitle></DialogHeader>
                    <form action={handleAddVariant} className="space-y-4 py-4">
                      <div className="grid gap-2">
                        <Label>Scent / Flavor</Label>
                        <Input name="flavor" placeholder="e.g. Lavender, Rose" required />
                      </div>
                      <div className="grid gap-2">
                        <Label>Size</Label>
                        <Input name="size" placeholder="e.g. 400g" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Price</Label><Input name="price" type="number" step="0.01" required /></div>
                        <div className="grid gap-2"><Label>Initial Stock</Label><Input name="stock_quantity" type="number" required /></div>
                      </div>
                      <DialogFooter><Button type="submit" disabled={isSaving}>Create</Button></DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <RadioGroup
              value={selectedFlavor}
              onValueChange={setSelectedFlavor}
              className="flex flex-wrap gap-3"
            >
              {flavorData.map((flavor) => (
                <Label
                  key={flavor.name}
                  className={cn(
                    "relative flex cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm transition-colors",
                    selectedFlavor === flavor.name
                      ? "border-brand-900 bg-brand/10 text-brand-900 ring-2 ring-brand/50"
                      : "hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value={flavor.name} className="sr-only" />
                  {flavor.name}
                  {flavor.isBestseller && (
                    <Badge className="absolute -top-3 text-xs -right-3 bg-gold text-black shadow-md">
                      Bestseller
                    </Badge>
                  )}
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose Your Size:</Label>
            <RadioGroup
              value={selectedSize}
              onValueChange={setSelectedSize}
              className="flex flex-wrap gap-3"
            >
              {sizes.map((size) => (
                <Label
                  key={size}
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm transition-colors",
                    selectedSize === size
                      ? "border-brand-900 bg-brand/10 text-brand-900 ring-2 ring-brand/50"
                      : "hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value={size} className="sr-only" />
                  {size}
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Action Area: Edit Form or AddToCart */}
          {isEditMode && isAdmin ? (
            selectedVariant ? (
              <form key={selectedVariant.id} onSubmit={handleSaveVariant} className="p-4 border rounded-lg bg-blue-50/50 space-y-4">
                <h3 className="font-semibold text-sm text-blue-900">Edit Variant: {selectedVariant.flavor} - {selectedVariant.size}</h3>
                <div className="flex gap-4">
                  <div className="grid gap-2 flex-1"><Label>Price (₹)</Label><Input name="price" type="number" step="0.01" defaultValue={selectedVariant.price} /></div>
                  <div className="grid gap-2 flex-1"><Label>Stock</Label><Input name="stock_quantity" type="number" defaultValue={selectedVariant.stock_quantity} /></div>
                </div>
                <Button type="submit" size="sm" disabled={isSaving} className="w-full">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Update Variant
                </Button>
              </form>
            ) : (
              <div className="p-4 border rounded-lg bg-yellow-50 text-yellow-800 text-sm">
                This combination (Flavor + Size) does not exist as a variant. Click "New Variant" to create it.
              </div>
            )
          ) : (
            <>
              <Button
                className="w-full bg-brand text-lg text-primary-foreground hover:bg-brand-900 h-12"
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
              >
                {selectedVariant ?
                  (selectedVariant.stock_quantity === 0 ? "Out of Stock" : "Add to Cart")
                  : "Please make a selection"
                }
              </Button>

              {/* Ingredients Button */}
              <button
                onClick={() => setIsIngredientsOpen(true)}
                className="group w-full flex items-center justify-center gap-2 rounded-md py-3 text-sm text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
              >
                <Info className="h-4 w-4 text-muted-foreground group-hover:text-brand" />
                <span className="border-b border-dashed border-muted-foreground/50 pb-0.5 group-hover:border-brand group-hover:text-brand">
                  View full ingredients & benefits
                </span>
              </button>
            </>
          )}

        </div>
      </div>

      {/* --- Rich Content Sections --- */}
      <div className="mx-auto max-w-4xl mt-16 space-y-12">
        <section>
          <h2 className="font-heading text-3xl text-center mb-8">Your Daily Ritual of Calm</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BenefitItem icon={<Droplet />} title="Soothe Muscles">
              Rich in magnesium, Epsom salts help relieve aches, pains and muscle tension after a long day or workout.
            </BenefitItem>
            <BenefitItem icon={<Leaf />} title="Promote Restful Sleep">
              The calming properties of essential oils and magnesium prepare your body and mind for a deeper, more restorative sleep.
            </BenefitItem>
            <BenefitItem icon={<Sparkle />} title="Detoxify & Soften">
              Himalayan Pink Salt helps draw out toxins while natural minerals soften your skin, leaving it feeling silky and refreshed.
            </BenefitItem>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 rounded-lg bg-muted/30 p-8">
          <div>
            <h3 className="font-heading text-2xl mb-4">How to Use</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-brand" /> <span>Add a generous handful (about 1/4 cup) to a warm, running bath.</span></li>
              <li className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-brand" /> <span>Swirl the water to help the salts dissolve.</span></li>
              <li className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-brand" /> <span>Soak for at least 20 minutes to absorb the full mineral benefits.</span></li>
              <li className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-brand" /> <span>Relax, breathe deeply and let your stress melt away.</span></li>
            </ul>
          </div>
          <div className="border-l border-border/50 pl-0 md:pl-12 pt-8 md:pt-0">
            <h3 className="font-heading text-2xl mb-6">The Standard</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <Flame className="text-brand shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Handcrafted in Small Batches</h4>
                  <p className="text-sm text-muted-foreground mt-1">Made fresh to ensure potency of the essential oils.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <ShieldCheck className="text-brand shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">100% Natural Origins</h4>
                  <p className="text-sm text-muted-foreground mt-1">No synthetic fragrances, artificial dyes, or anti-caking agents.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <IngredientsModal
        isOpen={isIngredientsOpen}
        onClose={() => setIsIngredientsOpen(false)}
        flavor={selectedFlavor}
      />
    </>
  )
}