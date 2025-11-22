"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImageComparison } from "@/components/image-comparison"
import { GameStats } from "@/components/game-stats"
import { ResultModal } from "@/components/result-modal"
import { Trophy, Play } from "lucide-react"
import { fetchImagePairs, type ImagePair } from "@/lib/db-stub"

type GameState = "menu" | "playing" | "result"

export function GameContainer() {
  const [gameState, setGameState] = useState<GameState>("menu")
  const [imagePairs, setImagePairs] = useState<ImagePair[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(true)
  const [currentRound, setCurrentRound] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [showResult, setShowResult] = useState(false)
  const [lastGuessCorrect, setLastGuessCorrect] = useState<boolean | null>(null)
  const [correctAnswers, setCorrectAnswers] = useState(0) // Track correct answers for accuracy

  // Fetch image pairs from Supabase on mount
  useEffect(() => {
    async function loadImages() {
      setIsLoadingImages(true)
      try {
        const pairs = await fetchImagePairs()
        setImagePairs(pairs)
      } catch (error) {
        console.error("Failed to load image pairs:", error)
      } finally {
        setIsLoadingImages(false)
      }
    }
    loadImages()
  }, [])

  // Define handleTimeUp before it's used in useEffect
  const handleTimeUp = useCallback(() => {
    setLastGuessCorrect(false)
    setShowResult(true)
    setStreak(0)
  }, [])

  // Reset guess state when starting a new round (when showResult becomes false after being true)
  useEffect(() => {
    if (!showResult && gameState === "playing" && lastGuessCorrect !== null) {
      // Reset guess state when modal closes and we're ready for a new guess
      // Use a small delay to ensure modal animation completes
      const timer = setTimeout(() => {
        setLastGuessCorrect(null)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [showResult, gameState, lastGuessCorrect])

  // Timer logic - use ref to avoid recreating interval on every timeLeft change
  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, handleTimeUp]) // Only depend on gameState and handleTimeUp

  const startGame = () => {
    setGameState("playing")
    setCurrentRound(0)
    setScore(0)
    setStreak(0)
    setTimeLeft(30)
    setShowResult(false)
    setLastGuessCorrect(null)
    setCorrectAnswers(0) // Reset correct answers count
  }

  const handleGuess = useCallback((guess: "left" | "right") => {
    if (!imagePairs[currentRound]) return
    const currentPair = imagePairs[currentRound]
    const correct = guess === currentPair.aiSide

    if (correct) {
      setTimeLeft((prevTime) => {
        const timeBonus = Math.floor(prevTime / 3)
        setScore((prevScore) => {
          const streakBonus = streak * 10
          const roundScore = 100 + timeBonus + streakBonus
          return prevScore + roundScore
        })
        return prevTime
      })
      setStreak((prev) => prev + 1)
      setCorrectAnswers((prev) => prev + 1) // Increment correct answers
    } else {
      setStreak(0)
    }

    // Set the result state - this will persist until the next guess
    setLastGuessCorrect(correct)
    setShowResult(true)
  }, [imagePairs, currentRound, streak])

  const handleNextRound = () => {
    // Close the modal first
    setShowResult(false)
    
    if (currentRound + 1 >= imagePairs.length) {
      // Reset state before ending game
      setLastGuessCorrect(null)
      endGame()
    } else {
      // Move to next round
      setCurrentRound((prev) => prev + 1)
      setTimeLeft(30)
      // Don't reset lastGuessCorrect here - it will be set when the user makes their next guess
      // This prevents the flash of "wrong" when transitioning between rounds
    }
  }

  const endGame = () => {
    setGameState("result")
    // Stub: Save score to Supabase leaderboard
    console.log("[v0] Game ended. Final score:", score)
  }

  if (gameState === "menu") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="h-12 w-12 text-primary" />
              <h1 className="text-balance text-5xl font-bold tracking-tight">Slop Hero</h1>
            </div>
            <p className="text-balance text-xl text-muted-foreground">Can you spot the AI-generated image?</p>
          </div>

          <Card className="p-8">
            <div className="space-y-6">
              <div className="space-y-4 text-left">
                <h2 className="text-2xl font-semibold">How to Play</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                      1
                    </span>
                    <span>You'll see two images side by side - one real, one AI-generated</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                      2
                    </span>
                    <span>Click on the image you think is AI-generated</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                      3
                    </span>
                    <span>Earn points for correct guesses. Faster = more points!</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                      4
                    </span>
                    <span>Build streaks for bonus points</span>
                  </li>
                </ul>
              </div>

              <Button size="lg" className="w-full" onClick={startGame} disabled={isLoadingImages || imagePairs.length === 0}>
                <Play className="mr-2 h-5 w-5" />
                {isLoadingImages ? "Loading..." : imagePairs.length === 0 ? "No images available" : "Start Game"}
              </Button>
            </div>
          </Card>

          <div className="text-sm text-muted-foreground">
            {isLoadingImages ? (
              <p>Loading images...</p>
            ) : (
              <p>{imagePairs.length} rounds • 30 seconds per round</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (gameState === "result") {
    // Calculate accuracy as (correct answers / total rounds) * 100, capped at 100%
    const accuracy = imagePairs.length > 0 
      ? Math.min(100, Math.round((correctAnswers / imagePairs.length) * 100)) 
      : 0
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="space-y-6 text-center">
            <Trophy className="mx-auto h-16 w-16 text-primary" />
            <h1 className="text-4xl font-bold">Game Complete!</h1>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Final Score</p>
                <p className="text-3xl font-bold">{score}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-3xl font-bold">{accuracy}%</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Rounds</p>
                <p className="text-3xl font-bold">{imagePairs.length}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button size="lg" className="w-full" onClick={startGame}>
                Play Again
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setGameState("menu")}
              >
                Back to Menu
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (imagePairs.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-semibold">No Images Available</h2>
            <p className="text-muted-foreground">
              {isLoadingImages ? "Loading images from database..." : "Unable to load images. Please check your database connection."}
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col p-4">
      <GameStats
        currentRound={currentRound + 1}
        totalRounds={imagePairs.length}
        score={score}
        streak={streak}
        timeLeft={timeLeft}
      />

      <div className="flex flex-1 items-center justify-center py-8">
        {imagePairs[currentRound] && (
          <ImageComparison
            key={currentRound}
            leftImage={imagePairs[currentRound].leftImage}
            rightImage={imagePairs[currentRound].rightImage}
            category={imagePairs[currentRound].category}
            onGuess={handleGuess}
            disabled={showResult}
          />
        )}
      </div>

      <ResultModal
        isOpen={showResult}
        isCorrect={lastGuessCorrect ?? false}
        correctSide={imagePairs[currentRound].aiSide}
        onNext={handleNextRound}
        isLastRound={currentRound + 1 >= imagePairs.length}
      />
    </div>
  )
}
