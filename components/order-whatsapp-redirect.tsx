'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface OrderWhatsAppRedirectProps {
    orderUid: string
    customerName: string
}

export function OrderWhatsAppRedirect({ orderUid, customerName }: OrderWhatsAppRedirectProps) {
    const searchParams = useSearchParams()
    const isNewOrder = searchParams.get('placed') === 'true'

    useEffect(() => {
        if (isNewOrder) {
            const timer = setTimeout(() => {
                const message = `Hi 👋 I’m ${customerName}! I’d like to confirm my order ${orderUid}.`
                const encodedMessage = encodeURIComponent(message)
                window.location.href = `https://wa.me/919643110001?text=${encodedMessage}`
            }, 1000)

            return () => clearTimeout(timer)
        }
    }, [isNewOrder, orderUid, customerName])

    return null
}
