"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Leaf, Droplet, Sparkles, ShieldCheck, Flower2 } from "lucide-react"
import { useEffect, useMemo } from "react"

// --- CONFIGURATION: Unique Ingredients per Scent ---
// Based on your label screenshots
const INGREDIENT_DATA: Record<string, { 
  description: string, 
  unique: { name: string, icon: any, desc: string }[],
  fullList: string 
}> = {
    "Rose": {
      "description": "A luxurious, heart-centering blend crafted to soothe the senses and restore emotional balance.",
      "unique": [
        { "name": "Rosewood Essential Oil", "icon": Droplet, "desc": "A sweet, woody essence cherished for easing stress and supporting natural skin rejuvenation." },
        { "name": "Rose Buds", "icon": Flower2, "desc": "Hand-selected dried buds that hydrate the skin while creating a visually indulgent spa-like soak." },
        { "name": "Rose Clay Powder", "icon": Sparkles, "desc": "A gentle, skin-polishing clay that detoxifies pores and removes dead skin for a smooth, radiant finish." }
      ],
      "fullList": "Himalayan Salt, Epsom Salt, Sea Salt, Almond Oil, Rosewood Essential Oil, Rose Buds, Natural Active Substance, Rose Clay Powder."
    },
    "Lavender": {
      "description": "A deeply calming, sleep-enhancing formula designed to melt away tension and quiet the mind.",
      "unique": [
        { "name": "French Lavender Oil", "icon": Droplet, "desc": "The purest form of lavender—renowned for its unmatched ability to relax the nervous system and promote restful sleep." },
        { "name": "Lavender Buds", "icon": Flower2, "desc": "Aromatic dried botanicals that slowly release natural essential oils into warm water for a tranquil soak." },
        { "name": "Calamine IP Powder", "icon": Sparkles, "desc": "A soothing, skin-protective mineral ideal for calming irritation and comforting sensitive skin." }
      ],
      "fullList": "Himalayan Salt, Epsom Salt, Sea Salt, Almond Oil, Lavender Essential Oil, Lavender Buds, Natural Active Substance, Calamine IP Powder."
    },
    "Jasmine": {
      "description": "An uplifting, exotic escape designed to elevate mood, soften the skin, and awaken the senses.",
      "unique": [
        { "name": "Ylang Ylang Essential Oil", "icon": Droplet, "desc": "A rich, floral essence known for easing anxiety and enhancing emotional well-being." },
        { "name": "Jasmine Botanicals", "icon": Flower2, "desc": "Delicate dried jasmine petals that infuse the water with softness and a luxurious natural fragrance." },
        { "name": "Multani Mitti", "icon": Sparkles, "desc": "A mineral-rich clay that detoxifies, refreshes, and brightens the skin for a naturally radiant look." }
      ],
      "fullList": "Himalayan Salt, Epsom Salt, Sea Salt, Almond Oil, Ylang Ylang Essential Oil, Dried Botanicals, Natural Active Substance, Multani Mitti."
    },
    "Grapefuit": {
      "description": "A bright, energizing citrus ritual that lifts the mood and leaves the body feeling refreshed and awake.",
      "unique": [
        { "name": "Grapefuit Essential Oil", "icon": Droplet, "desc": "A vibrant citrus aroma known for energizing the senses and naturally uplifting the mood." },
        { "name": "Jasmine Botanicals", "icon": Flower2, "desc": "Soft, aromatic petals that lend elegance while gently conditioning the skin." },
        { "name": "Calamine IP Powder", "icon": Sparkles, "desc": "A soothing mineral blend that calms irritation and transforms bath water into a silky, comforting soak." }
      ],
      "fullList": "Himalayan Salt, Epsom Salt, Sea Salt, Almond Oil, Ylang Ylang Essential Oil, Dried Botanicals, Natural Active Substance, Calamine IP Powder."
    },
    "Peppermint": {
      "description": "A refreshing, cooling blend created to energize the body, clear the mind, and awaken the senses.",
      "unique": [
        { "name": "Peppermint Essential Oil", "icon": Droplet, "desc": "A crisp, invigorating mint aroma known for boosting alertness, easing fatigue, and refreshing the skin." },
        { "name": "Jasmine Botanicals", "icon": Flower2, "desc": "Gentle dried petals that provide natural softness and a subtly uplifting floral note." },
        { "name": "Rose Clay Powder", "icon": Sparkles, "desc": "A mild exfoliating clay that purifies pores, removes dullness, and leaves the skin feeling clean and velvety." }
      ],
      "fullList": "Himalayan Salt, Epsom Salt, Sea Salt, Almond Oil, Ylang Ylang Essential Oil, Dried Botanicals, Natural Active Substance, Rose Clay Powder."
    },
  // Fallback for default or other scents
  "Standard": {
    description: "Pure mineral therapy.",
    unique: [
      { name: "Essential Oil Blend", icon: Droplet, desc: "A curated blend of pure oils for aromatherapy." },
      { name: "Dried Botanicals", icon: Flower2, desc: "Natural flower petals." },
      { name: "Healing Clays", icon: Sparkles, desc: "Natural earth clays for detoxification." }
    ],
    fullList: "Himalayan Salt, Epsom Salt, Sea Salt, Almond Oil, Essential Oils, Dried Botanicals, Natural Active Substance."
  }
}

// Common Base Ingredients (Present in all)
const BASE_INGREDIENTS = [
  { name: "Himalayan & Epsom Salts", icon: Sparkles, desc: "Rich in magnesium to soothe tired muscles." },
  { name: "Almond Oil", icon: Leaf, desc: "Nourishes deeply to leave skin silky smooth." },
]

interface IngredientsModalProps {
  isOpen: boolean
  onClose: () => void
  flavor: string
}

export function IngredientsModal({ isOpen, onClose, flavor }: IngredientsModalProps) {
  
  // 1. Get the specific data for the selected flavor
  // If flavor doesn't exist in map, fallback to Standard, or map "Jasmine" -> "Jasmine"
  const currentData = useMemo(() => {
    // Handle cases where flavor might be "Jasmine - 400g" or just "Jasmine"
    const key = Object.keys(INGREDIENT_DATA).find(k => flavor.includes(k)) || "Standard"
    return INGREDIENT_DATA[key]
  }, [flavor])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-background border-l border-border p-6 shadow-2xl sm:p-10 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-heading text-3xl tracking-tight text-foreground">Ingredients</h2>
              <button 
                onClick={onClose}
                className="rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-10">
              {/* Selected Flavor Banner */}
              <div className="bg-brand text-primary-foreground p-6 rounded-none shadow-sm relative overflow-hidden">
                 {/* Gold accent line */}
                 <div className="absolute top-0 left-0 w-1 h-full bg-gold" /> 
                 <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-80 mb-2">Selected Blend</p>
                 <div className="flex justify-between items-end">
                    <p className="text-3xl font-heading">{flavor}</p>
                 </div>
                 <p className="mt-2 text-sm text-white/80 font-light italic border-t border-white/20 pt-2">
                    {currentData.description}
                 </p>
              </div>

              {/* Ingredients List */}
              <div className="space-y-6">
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Key Actives</p>
                
                {/* 1. Render Unique Ingredients for this Scent */}
                {currentData.unique.map((item) => (
                    <IngredientRow 
                        key={item.name}
                        icon={<item.icon size={20} />} 
                        title={item.name} 
                        desc={item.desc}
                    />
                ))}

                {/* 2. Render Base Ingredients */}
                {BASE_INGREDIENTS.map((item) => (
                    <IngredientRow 
                        key={item.name}
                        icon={<item.icon size={20} />} 
                        title={item.name} 
                        desc={item.desc}
                    />
                ))}
              </div>

              {/* Footer / INCI List (Matches Label Exactly) */}
              <div className="pt-8 mt-8 border-t border-border/60">
                <p className="text-xs font-bold uppercase tracking-widest text-brand mb-3">Label Ingredients List</p>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans bg-muted/30 p-4 rounded-md border border-border/50">
                  {currentData.fullList}
                </p>
              </div>
              
              {/* "Our Promise" Badge */}
              <div className="flex items-center gap-3 justify-center pt-4 opacity-70">
                <ShieldCheck className="text-brand w-5 h-5" />
                <span className="text-xs uppercase tracking-widest font-semibold text-brand">100% Natural Origins</span>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function IngredientRow({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-5 group items-start">
      {/* Icon Circle - Forest Green Text, Subtle Background */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/5 text-brand border border-brand/10 group-hover:bg-brand group-hover:text-white transition-colors duration-300 mt-1">
        {icon}
      </div>
      <div>
        <h3 className="font-heading text-lg mb-1 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed font-sans">
          {desc}
        </p>
      </div>
    </div>
  )
}