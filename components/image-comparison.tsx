"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface ImageComparisonProps {
  leftImage: string
  rightImage: string
  category: string
  onGuess: (side: "left" | "right") => void
  disabled?: boolean
}

export function ImageComparison({ leftImage, rightImage, category, onGuess, disabled = false }: ImageComparisonProps) {
  return (
    <div className="w-full max-w-6xl space-y-4">
      <div className="text-center">
        <Badge variant="secondary" className="text-sm">
          {category}
        </Badge>
        <h2 className="mt-3 text-balance text-2xl font-semibold">Which image is AI-generated?</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          className={`group relative overflow-hidden transition-all ${
            disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer hover:ring-2 hover:ring-primary"
          }`}
          onClick={() => !disabled && onGuess("left")}
        >
          <div className="relative aspect-square w-full">
            <Image src={leftImage || "/placeholder.svg"} alt="Image option A" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
            <div className="translate-y-4 rounded-lg bg-background px-4 py-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
              <span className="text-lg font-semibold">Image A</span>
            </div>
          </div>
        </Card>

        <Card
          className={`group relative overflow-hidden transition-all ${
            disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer hover:ring-2 hover:ring-primary"
          }`}
          onClick={() => !disabled && onGuess("right")}
        >
          <div className="relative aspect-square w-full">
            <Image src={rightImage || "/placeholder.svg"} alt="Image option B" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
            <div className="translate-y-4 rounded-lg bg-background px-4 py-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
              <span className="text-lg font-semibold">Image B</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
