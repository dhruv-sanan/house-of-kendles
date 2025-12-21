'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, MapPin } from "lucide-react"

interface CustomerDetailsDialogProps {
    customerName: string
    email?: string
    phone?: string
    address?: string
}

export function CustomerDetailsDialog({
    customerName,
    email,
    phone,
    address,
}: CustomerDetailsDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto font-normal text-foreground hover:text-brand-900 underline-offset-4 hover:underline">
                    {customerName}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Customer Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="grid gap-1">
                            <p className="font-medium leading-none">Name</p>
                            <p className="text-sm text-muted-foreground">{customerName}</p>
                        </div>
                    </div>

                    {email && (
                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="grid gap-1">
                                <p className="font-medium leading-none">Email</p>
                                <p className="text-sm text-muted-foreground">{email}</p>
                            </div>
                        </div>
                    )}

                    {phone && (
                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="grid gap-1">
                                <p className="font-medium leading-none">Phone</p>
                                <p className="text-sm text-muted-foreground">{phone}</p>
                            </div>
                        </div>
                    )}

                    {address && (
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="grid gap-1">
                                <p className="font-medium leading-none">Delivery Address</p>
                                <p className="text-sm text-muted-foreground">{address}</p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
