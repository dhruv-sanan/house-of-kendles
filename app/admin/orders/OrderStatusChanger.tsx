"use client"

import { useTransition } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateOrderStatus } from "@/app/_actions/orderActions"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// These are the statuses from your database's `order_status` ENUM type
const STATUSES = ['pending_payment', 'processing', 'shipped', 'delivered', 'cancelled']

export function OrderStatusChanger({ orderId, currentStatus }: { orderId: number, currentStatus: string }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus)
      if (result.success) {
        toast({ title: "Success", description: "Order status updated." })
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }
  
  // Dynamic styling for the badge based on status
  const getBadgeClass = (status: string) => {
    switch(status) {
      case 'pending_payment': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Select
      defaultValue={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isPending}
    >
      <SelectTrigger className={cn("w-40 h-8 text-xs", getBadgeClass(currentStatus))}>
        <SelectValue placeholder="Change status" />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map(status => (
          <SelectItem key={status} value={status}>
            {/* Simple title case for display */}
            {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
