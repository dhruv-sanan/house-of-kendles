"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ProductWithVariants } from "@/app/_actions/products"
import { ProductCard } from "@/components/product-card"
import { ArrowRight, Sparkles, RefreshCcw } from "lucide-react"

// --- Configuration ---
const QUESTIONS = [
  {
    key: "moment",
    q: "Choose your ideal vibe.",
    options: [
      { text: "Cozy Cafe Corner", keyword: "cafe" },
      { text: "Rain-kissed Garden", keyword: "garden" },
      { text: "Fresh Shower Breeze", keyword: "shower" },
      { text: "Morning Citrus Zest", keyword: "citrus" },
    ],
  },
  {
    key: "feeling",
    q: "What's the goal for your space?",
    options: [
      { text: "Unwind & De-stress", keyword: "calm" },
      { text: "Create Coziness", keyword: "warmth" },
      { text: "Energize & Focus", keyword: "energy" },
      { text: "Refresh & Reset", keyword: "renewal" },
    ],
  },
]

type RecommendationKey = "French Lavender" | "Natural Rose" | "Cafe Coffee" | "French Vanilla" | "Aqua Fresh" | "Fresh Out" | "Peppermint" | "Grapefruit";

const RECOMMENDATIONS: Record<RecommendationKey, { description: string; profile: string; keywords: string[] }> = {
  "French Lavender": {
    description: "This scent's soothing floral notes are perfect for creating a serene and peaceful atmosphere.",
    profile: "The Tranquility Advocate",
    keywords: ["lavender", "calm", "sleep", "dream", "adulting"] // Added keywords to match products
  },
  "Natural Rose": {
    description: "Classic and elegant, the gentle aroma of rose promotes a sense of balance and self-care.",
    profile: "The Gentle Dreamer",
    keywords: ["rose", "peony", "floral", "bloom", "tulip", "flower"]
  },
  "Cafe Coffee": {
    description: "Rich and invigorating, this scent captures the robust aroma of freshly brewed coffee, ideal for enhancing focus.",
    profile: "The Grounded Thinker",
    keywords: ["coffee", "espresso", "latte", "brew", "macchiato", "mocha"]
  },
  "French Vanilla": {
    description: "Sweet and creamy, this scent is the essence of comfort, creating an inviting and indulgent atmosphere.",
    profile: "The Comfort Seeker",
    keywords: ["vanilla", "sweet", "bakery", "cookie", "cream"]
  },
  "Aqua Fresh": {
    description: "Light, airy, and clean. This scent is like a refreshing ocean mist, perfect for clearing your mind.",
    profile: "The Fresh Minimalist",
    keywords: ["aqua", "ocean", "sea", "blue", "breeze", "evil eye"]
  },
  "Fresh Out": {
    description: "This crisp, sharp scent embodies ultimate cleanliness, ideal for hitting the reset button.",
    profile: "The Renewalist",
    keywords: ["fresh", "linen", "clean", "cotton", "dealer"] // Matches "Dealer Came Through"
  },
  "Peppermint": {
    description: "Cool and stimulating, the clarifying aroma of peppermint is known to boost energy and improve focus.",
    profile: "The Focused Energizer",
    keywords: ["mint", "eucalyptus", "cool", "focus", "energy"]
  },
  "Grapefruit": {
    description: "Bright and zesty, this vibrant citrus scent is an instant mood-booster, filling your space with positivity.",
    profile: "The Morning Optimist",
    keywords: ["citrus", "grapefruit", "orange", "lemon", "zest", "friday"] // Matches "Friday Feels"
  },
}

export function QuizClient({ products }: { products: ProductWithVariants[] }) {
  const [answers, setAnswers] = useState<Record<string, { keyword: string; text: string }>>({})
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<RecommendationKey | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to results when result is set
  useEffect(() => {
    if (result && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [result])

  function choose(option: { text: string; keyword: string }) {
    const key = QUESTIONS[step].key
    const newAnswers = { ...answers, [key]: option }
    setAnswers(newAnswers)

    // Auto-advance with delay
    setTimeout(() => {
      if (step < QUESTIONS.length - 1) {
        setStep(s => s + 1)
      } else {
        getRecommendation(newAnswers)
      }
    }, 400)
  }

  function getRecommendation(currentAnswers?: Record<string, { keyword: string; text: string }>) {
    const finalAnswers = currentAnswers || answers
    const scores: Record<RecommendationKey, number> = {
      "Cafe Coffee": 0, "French Lavender": 0, "Natural Rose": 0, "Aqua Fresh": 0,
      "Fresh Out": 0, "French Vanilla": 0, "Peppermint": 0, "Grapefruit": 0
    }

    // Logic mapping
    const moment = finalAnswers.moment?.keyword
    const feeling = finalAnswers.feeling?.keyword

    if (moment === "cafe") { scores["Cafe Coffee"] += 3; scores["French Vanilla"] += 2; }
    if (moment === "garden") { scores["Natural Rose"] += 3; scores["French Lavender"] += 2; scores["Grapefruit"] += 1; }
    if (moment === "shower") { scores["Aqua Fresh"] += 3; scores["Fresh Out"] += 2; scores["Peppermint"] += 1; }
    if (moment === "citrus") { scores["Grapefruit"] += 3; scores["Fresh Out"] += 1; }

    if (feeling === "calm") { scores["French Lavender"] += 3; scores["Natural Rose"] += 2; scores["Aqua Fresh"] += 1; }
    if (feeling === "warmth") { scores["French Vanilla"] += 3; scores["Cafe Coffee"] += 2; }
    if (feeling === "energy") { scores["Grapefruit"] += 2; scores["Peppermint"] += 3; scores["Cafe Coffee"] += 1; }
    if (feeling === "renewal") { scores["Aqua Fresh"] += 2; scores["Fresh Out"] += 3; }

    let topScent: RecommendationKey = "French Lavender"
    let maxScore = 0

      ; (Object.keys(scores) as RecommendationKey[]).forEach((scent) => {
        if (scores[scent] > maxScore) {
          maxScore = scores[scent]
          topScent = scent
        }
      })

    setResult(topScent)
  }

  function next() {
    if (!answers[QUESTIONS[step].key]) return
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      getRecommendation()
    }
  }

  function reset() {
    setStep(0)
    setAnswers({})
    setResult(null)
  }

  // Filter products based on the result keywords
  const recommendedProducts = result
    ? products.filter(p => {
      const keywords = RECOMMENDATIONS[result].keywords
      const searchText = `${p.name} ${p.description} ${p.category}`.toLowerCase()
      return keywords.some(k => searchText.includes(k))
    })
    : []

  const currentQuestion = QUESTIONS[step]

  return (
    <div className="min-h-[600px]">
      {!result ? (
        <div className="mt-8 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 text-center">
            <span className="text-sm font-medium text-brand-900/60 uppercase tracking-widest">
              Question {step + 1} of {QUESTIONS.length}
            </span>
            <h2 className="mt-4 font-heading text-3xl md:text-4xl text-brand-900">
              {currentQuestion.q}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {currentQuestion.options.map((o) => (
              <button
                key={o.keyword}
                onClick={() => choose(o)}
                className={`group relative flex h-32 flex-col items-center justify-center gap-3 rounded-xl border-2 p-4 text-center transition-all duration-300 ${answers[currentQuestion.key]?.keyword === o.keyword
                  ? "border-brand-900 bg-brand-900/5 ring-2 ring-brand-900/20"
                  : "border-transparent bg-white shadow-md hover:border-brand-900/30 hover:shadow-lg"
                  }`}
              >
                <span className={`text-lg font-medium ${answers[currentQuestion.key]?.keyword === o.keyword ? "text-brand-900" : "text-gray-700 group-hover:text-brand-900"
                  }`}>
                  {o.text}
                </span>
                {answers[currentQuestion.key]?.keyword === o.keyword && (
                  <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-brand-900 animate-ping" />
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={next}
              disabled={!answers[currentQuestion.key]}
              className="w-full sm:w-auto px-12 h-12 text-lg bg-brand-900 text-white hover:bg-brand-900/90 transition-all disabled:opacity-50"
            >
              {step < QUESTIONS.length - 1 ? "Next Question" : "Reveal My Scent"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-700" ref={resultsRef}>
          {/* Result Header */}
          <div className="mx-auto max-w-2xl text-center mb-16 bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gold/20">
            <div className="mb-4 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                <Sparkles className="h-8 w-8" />
              </div>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-gold mb-2">
              {RECOMMENDATIONS[result].profile}
            </p>
            <h2 className="font-heading text-4xl md:text-5xl text-brand-900 mb-6">
              {result}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {RECOMMENDATIONS[result].description}
            </p>
            <Button
              variant="ghost"
              onClick={reset}
              className="text-sm text-muted-foreground hover:text-brand-900"
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Retake Quiz
            </Button>
          </div>

          {/* Recommended Products Grid */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-brand-900/10" />
              <h3 className="text-center font-heading text-2xl text-brand-900">
                Curated For You
              </h3>
              <div className="h-px flex-1 bg-brand-900/10" />
            </div>

            {recommendedProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  Our artisans are currently crafting more {result} products.
                  <br /> Check out our bestsellers in the meantime!
                </p>
                <Button className="mt-4" variant="outline" asChild>
                  <a href="/candles">Shop All Candles</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}