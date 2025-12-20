import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import { getProductBySlug } from "@/app/_actions/products"
import { ProductDetailsClient } from "./product-details-client" // We will create this next
import { notFound } from 'next/navigation';

type ProductPageProps = {
  params: {
    slug: string
  }
}

// This is now a Server Component to fetch data
export default async function ProductDetailPage({ params: { slug } }: ProductPageProps) {
  const product = await getProductBySlug(slug);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* We pass the server-fetched data to a client component for interactivity */}
        <ProductDetailsClient product={product} />
      </main>
      <SiteFooter />
    </>
  )
}
