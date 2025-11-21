"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"

interface ResultModalProps {
  isOpen: boolean
  isCorrect: boolean
  correctSide: "left" | "right"
  onNext: () => void
  isLastRound: boolean
}

export function ResultModal({ isOpen, isCorrect, correctSide, onNext, isLastRound }: ResultModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isCorrect ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-destructive" />
            )}
            <DialogTitle className="text-2xl">{isCorrect ? "Correct!" : "Incorrect"}</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-base">
            {isCorrect ? (
              <>You successfully identified the AI-generated image!</>
            ) : (
              <>
                The AI-generated image was on the <span className="font-semibold capitalize">{correctSide}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={onNext} className="w-full" size="lg">
            {isLastRound ? "View Results" : "Next Round"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
