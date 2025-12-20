import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"

export const metadata = {
    title: "Terms of Service | House of Kendles",
    description: "Terms of Service for House of Kendles - Rules and regulations for using our website.",
}

export default function TermsOfServicePage() {
    return (
        <>
            <SiteHeader />
            <main className="mx-auto max-w-4xl px-4 py-16 md:px-8">
                <h1 className="font-heading text-4xl mb-2 text-brand-900">Terms of Service</h1>
                <p className="text-muted-foreground mb-10">Last updated: December 21, 2025</p>

                <div className="prose prose-stone max-w-none text-brand-900/80">
                    <p>
                        Welcome to House of Kendles. These terms and conditions outline the rules and regulations for the use of House of Kendles' Website. By accessing this website we assume you accept these terms and conditions. Do not continue to use House of Kendles if you do not agree to take all of the terms and conditions stated on this page.
                    </p>

                    <h2 className="font-heading text-2xl text-brand-900 mt-8 mb-4">1. Products and Services</h2>
                    <p>
                        House of Kendles specializes in handcrafted candles, artisanal bath salts, and curated home decor items.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li><strong>Handcrafted Nature:</strong> Please note that many of our products are handmade. Slight variations in color, texture, and finish are inherent qualities of handcrafted goods and are not considered defects.</li>
                        <li><strong>Care Instructions:</strong> We provide care instructions for our candles and other products. We are not responsible for damage resulting from failure to follow these instructions (e.g., tunneling due to improper burning, heat damage to surfaces).</li>
                        <li><strong>Availability:</strong> All products are subject to availability. We reserve the right to discontinue any product at any time.</li>
                    </ul>

                    <h2 className="font-heading text-2xl text-brand-900 mt-8 mb-4">2. Pricing and Payment</h2>
                    <p>
                        Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
                    </p>
                    <p className="mt-2">
                        We accept various payment methods. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.
                    </p>

                    <h2 className="font-heading text-2xl text-brand-900 mt-8 mb-4">3. Shipping and Delivery</h2>
                    <p>
                        Shipping times are estimates and start from the date of shipping, rather than the date of order.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>We are not responsible for delays caused by the shipping carrier or customs clearance processes.</li>
                        <li>Please ensure your delivery address is correct. We are not responsible for non-delivery due to incorrect addresses provided by the customer.</li>
                        <li>Risk of loss and title for items purchased from this website pass to you upon delivery of the items to the carrier.</li>
                    </ul>

                    <h2 className="font-heading text-2xl text-brand-900 mt-8 mb-4">4. Returns and Refunds</h2>
                    <p>
                        We want you to love your purchase. However, due to the nature of our products (personal wellness and home fragrance), we have specific return conditions:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>Returns are accepted within 7 days of delivery for damaged or incorrect items.</li>
                        <li>Used candles or opened bath products cannot be returned for hygiene and safety reasons.</li>
                        <li>Proof of purchase and photographic evidence of damage may be required.</li>
                    </ul>

                    <h2 className="font-heading text-2xl text-brand-900 mt-8 mb-4">5. User Comments and Feedback</h2>
                    <p>
                        If, at our request, you send certain specific submissions or without a request from us you send creative ideas, suggestions, proposals, plans, or other materials, whether online, by email, by postal mail, or otherwise (collectively, 'comments'), you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us.
                    </p>

                    <h2 className="font-heading text-2xl text-brand-900 mt-8 mb-4">6. Limitation of Liability</h2>
                    <p>
                        In no case shall House of Kendles, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, arising from your use of any of the service or any products procured using the service.
                    </p>

                    <h2 className="font-heading text-2xl text-brand-900 mt-8 mb-4">7. Governing Law</h2>
                    <p>
                        These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India.
                    </p>

                    <h2 className="font-heading text-2xl text-brand-900 mt-8 mb-4">8. Contact Information</h2>
                    <p>
                        Questions about the Terms of Service should be sent to us at <a href="mailto:support@houseofkendles.com" className="text-brand-900 underline font-medium">support@houseofkendles.com</a>.
                    </p>
                </div>
            </main>
            <SiteFooter />
        </>
    )
}
