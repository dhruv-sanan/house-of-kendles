import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import { getProductBySlug } from "@/app/_actions/products"
import { BathSaltClientPage } from "./BathSaltClientPage"
import { YouTubeEmbed } from "@/components/youtube-embed"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export default async function BathSaltPage() {
  const product = await getProductBySlug("bath-salt").catch(() => {
    notFound()
  })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.id === 'fa71f5fe-0f1a-41bd-ad55-228b07afbef6'

  // TIP: If you eventually add an "ingredients" field to your database variants,
  // it is already being passed down inside the `product` object here.

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">

        {/* The Client Page handles the Gallery, Selector, Cart, AND the Ingredients Modal */}
        <BathSaltClientPage product={product} isAdmin={isAdmin} />

        {/* Video Section */}
        <section className="my-16 max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl mb-6 text-center">See How It's Made</h2>
          <div className="rounded-lg overflow-hidden shadow-lg border bg-muted">
            {/* Added bg-muted as a placeholder while video loads */}
            <YouTubeEmbed videoId="92AvZv7Tgx4" title="The Making of Our Aromatherapy Bath Salts" />
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}