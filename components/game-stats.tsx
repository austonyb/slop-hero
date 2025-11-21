import { Card } from "@/components/ui/card"
import { Trophy, Flame, Clock } from "lucide-react"

interface GameStatsProps {
  currentRound: number
  totalRounds: number
  score: number
  streak: number
  timeLeft: number
}

export function GameStats({ currentRound, totalRounds, score, streak, timeLeft }: GameStatsProps) {
  const timePercentage = (timeLeft / 30) * 100

  return (
    <Card className="mx-auto w-full max-w-4xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-muted px-3 py-1.5">
            <p className="text-sm font-medium">
              Round {currentRound} / {totalRounds}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-semibold">{score}</span>
          </div>

          {streak > 0 && (
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-lg font-semibold text-orange-500">{streak}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${timeLeft <= 5 ? "text-destructive" : ""}`}>{timeLeft}s</span>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${timePercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
