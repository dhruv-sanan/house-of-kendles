import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"

export const metadata = {
    title: "Privacy Policy | House of Kendles",
    description: "Privacy Policy for House of Kendles - How we collect, use, and protect your data.",
}

export default function PrivacyPolicyPage() {
    return (
        <>
            <SiteHeader />
            <main className="mx-auto max-w-4xl px-4 py-16 md:px-8">
                <h1 className="font-heading text-4xl mb-2 text-brand-900">Privacy Policy</h1>
                <p className="text-muted-foreground mb-10">Last updated: December 21, 2025</p>

                <div className="prose prose-stone max-w-none text-brand-900/80">
                    <p>
                        Welcome to House of Kendles ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h2 className="font-heading text-2xl text-brand-900 mt-8 mb-4">1. Information We Collect</h2>
                    <p>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                        <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products (such as candles, bath salts, and home decor items) you have purchased from us.</li>
                        <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
                        <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
                    </ul>

                    <h2 className="font-heading text-2xl text-brand-900 mt-8 mb-4">2. How We Use Your Personal Data</h2>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., processing your order and shipping your products).</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where we need to comply with a legal or regulatory obligation.</li>
                    </ul>

                    <h2 className="font-heading text-2xl text-brand-900 mt-8 mb-4">3. Disclosure of Your Personal Data</h2>
                    <p>
                        We may have to share your personal data with the parties set out below for the purposes set out in paragraph 2 above:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>Service providers acting as processors who provide IT and system administration services.</li>
                        <li>Professional advisers acting as processors or joint controllers including lawyers, bankers, auditors and insurers.</li>
                        <li>Shipping and logistics partners to deliver your orders securely.</li>
                        <li>Payment processors to securely handle your transaction data.</li>
                    </ul>

                    <h2 className="font-heading text-2xl text-brand-900 mt-8 mb-4">4. Data Security</h2>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                    </p>

                    <h2 className="font-heading text-2xl text-brand-900 mt-8 mb-4">5. Your Legal Rights</h2>
                    <p>
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to access, correct, erasure, object to processing, restriction of processing, and data portability.
                    </p>
                    <p className="mt-4">
                        If you wish to exercise any of the rights set out above, please contact us at <a href="mailto:support@houseofkendles.com" className="text-brand-900 underline font-medium">support@houseofkendles.com</a>.
                    </p>

                    <h2 className="font-heading text-2xl text-brand-900 mt-8 mb-4">6. Cookies</h2>
                    <p>
                        You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.
                    </p>
                </div>
            </main>
            <SiteFooter />
        </>
    )
}
