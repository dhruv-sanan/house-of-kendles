"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { OrderWithItems } from "@/app/_actions/orderActions"
import { Package } from "lucide-react"

// Define the type for the items, based on the new query
type OrderItem = OrderWithItems['order_items'][number]

export function OrderDetailsModal({ items }: { items: OrderItem[] }) {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-left justify-start">
          {totalItems} items
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Order Items</DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li key={index} className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 rounded-md bg-muted flex items-center justify-center">
                  <img
                    src={item.product_variants?.image_url ?? '/placeholder.png'}
                    alt={item.product_variants?.products?.name ?? 'Product'}
                    className="h-full w-full object-cover rounded-md"
                  />
                </div>
                <div>
                  <p className="font-medium">
                    {item.product_variants?.products?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Size: {item.product_variants?.size}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: <span className="font-medium">{item.quantity}</span>
                  </p>
                </div>
              </li>
            ))}
            {items.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    <Package className="h-8 w-8 mx-auto mb-2"/>
                    <p>No items found for this order.</p>
                </div>
            )}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}