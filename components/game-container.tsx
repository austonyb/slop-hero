"use client"

import { useState, useEffect } from "react"
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

  // Timer logic
  useEffect(() => {
    if (gameState !== "playing" || timeLeft === 0) return

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
  }, [gameState, timeLeft])

  const startGame = () => {
    setGameState("playing")
    setCurrentRound(0)
    setScore(0)
    setStreak(0)
    setTimeLeft(30)
    setShowResult(false)
    setLastGuessCorrect(null)
  }

  const handleGuess = (guess: "left" | "right") => {
    if (!imagePairs[currentRound]) return
    const currentPair = imagePairs[currentRound]
    const correct = guess === currentPair.aiSide

    if (correct) {
      const timeBonus = Math.floor(timeLeft / 3)
      const streakBonus = streak * 10
      const roundScore = 100 + timeBonus + streakBonus
      setScore((prev) => prev + roundScore)
      setStreak((prev) => prev + 1)
    } else {
      setStreak(0)
    }

    setLastGuessCorrect(correct)
    setShowResult(true)
  }

  const handleNextRound = () => {
    setShowResult(false)
    setLastGuessCorrect(null)

    if (currentRound + 1 >= imagePairs.length) {
      endGame()
    } else {
      setCurrentRound((prev) => prev + 1)
      setTimeLeft(30)
    }
  }

  const handleTimeUp = () => {
    setLastGuessCorrect(false)
    setShowResult(true)
    setStreak(0)
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
    const accuracy = imagePairs.length > 0 ? Math.round((score / (imagePairs.length * 100)) * 100) : 0
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
        <ImageComparison
          leftImage={imagePairs[currentRound].leftImage}
          rightImage={imagePairs[currentRound].rightImage}
          category={imagePairs[currentRound].category}
          onGuess={handleGuess}
          disabled={showResult}
        />
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
