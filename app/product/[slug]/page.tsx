import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import { getProductBySlug } from "@/app/_actions/products"
import { ProductDetailsClient } from "./product-details-client"
import { PairedRecommendations } from "@/components/product/PairedRecommendations"
import { notFound } from 'next/navigation';
import { createClient } from "@/utils/supabase/server";

type ProductPageProps = {
  params: {
    slug: string
  }
}

// This is now a Server Component to fetch data
export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug);
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.id === 'fa71f5fe-0f1a-41bd-ad55-228b07afbef6'

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 w-full max-w-full">
        {/* We pass the server-fetched data to a client component for interactivity */}
        <ProductDetailsClient product={product} isAdmin={isAdmin} />

        {/* Paired Recommendations */}
        <PairedRecommendations productId={product.id} />
      </main>
      <SiteFooter />
    </>
  )
}
