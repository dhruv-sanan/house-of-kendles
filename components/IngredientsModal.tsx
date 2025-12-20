"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Leaf, Droplet, Sparkles } from "lucide-react"
import { useEffect } from "react"

interface IngredientsModalProps {
  isOpen: boolean
  onClose: () => void
  flavor: string
}

export function IngredientsModal({ isOpen, onClose, flavor }: IngredientsModalProps) {
  // Prevent scrolling when modal is open
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
          {/* 1. Backdrop (Darkens the rest of the screen) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* 2. The Modal Panel (Slides in from the right) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl p-6 md:p-10 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl">Ingredients</h2>
              <button 
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              <div className="bg-brand/5 p-4 rounded-xl border border-brand/10">
                 <p className="text-sm text-gray-600 font-medium uppercase tracking-wide mb-2">Selected Blend</p>
                 <p className="text-xl font-serif text-gray-900">{flavor}</p>
              </div>

              {/* Dynamic Content based on flavor could go here */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Himalayan Pink Salt</h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      Mined from ancient sea beds, this salt is packed with 84 essential minerals including iron, magnesium, and calcium to detoxify the skin.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Droplet size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Magnesium Sulfate (Epsom)</h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      Pure pharmaceutical grade Epsom salts that dissolve instantly to soothe tired muscles and reduce inflammation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                    <Leaf size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Natural Essential Oils</h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      Cold-pressed oils tailored to the specific blend (Lavender, Rose, or Eucalyptus) to provide therapeutic aromatherapy benefits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Full Ingredient List (INCI)</p>
                <p className="text-xs text-gray-500 font-mono leading-relaxed">
                  Sodium Chloride (Himalayan Salt), Magnesium Sulfate (Epsom Salt), Sodium Bicarbonate, Citric Acid, Prunus Amygdalus Dulcis (Sweet Almond) Oil, Tocopherol (Vitamin E), Essential Oil Blend, Dried Botanicals.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}