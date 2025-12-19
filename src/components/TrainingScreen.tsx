import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTime, formatMs, type RoundHistoryItem } from '@/lib/timer'

interface TrainingScreenProps {
  round: number
  currentTargetMs: number
  remainingMs: number
  nextTargetMs: number
  sessionElapsed: number
  roundHistory: RoundHistoryItem[]
  isPaused: boolean
  isAfterFail: boolean
  onFail: () => void
  onPause: () => void
  onResume: () => void
  onEnd: () => void
  onSettingsClick: () => void
}

export function TrainingScreen({
  round,
  currentTargetMs,
  remainingMs,
  nextTargetMs,
  sessionElapsed,
  roundHistory,
  isPaused,
  isAfterFail,
  onFail,
  onPause,
  onResume,
  onEnd,
  onSettingsClick,
}: TrainingScreenProps) {
  const showResumeButton = isPaused || isAfterFail

  return (
    <div className="flex flex-col h-full px-8 pt-4 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="font-mono text-sm text-muted-foreground">
          {formatTime(sessionElapsed)}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={onSettingsClick}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
          <Button variant="outline" size="sm" onClick={onEnd}>
            End
          </Button>
        </div>
      </div>

      {/* Countdown container */}
      <div className="flex-1 flex flex-col justify-center items-center gap-2">
        <div className="text-sm text-muted-foreground">Round {round}</div>
        <div className="text-base">
          Target: <span className="font-mono font-semibold">{formatTime(currentTargetMs)}</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="font-mono text-7xl font-bold tracking-tight">
            {formatTime(remainingMs)}
          </div>
          <div className="font-mono text-2xl text-muted-foreground">
            {formatMs(remainingMs)}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          next: <span className="font-mono">{formatTime(nextTargetMs)}</span>
        </div>
      </div>

      {/* Round history */}
      <div className="h-28 overflow-y-auto mb-4 p-3 bg-secondary rounded-lg text-sm">
        {roundHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground italic">
            No rounds completed yet
          </div>
        ) : (
          <div className="flex flex-col">
            {roundHistory.map((item) => (
              <div
                key={item.round}
                className="flex justify-between py-1 border-b border-border/50 last:border-0"
              >
                <span className="text-muted-foreground">Round {item.round}</span>
                <span className="font-mono">{formatTime(item.duration)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      {showResumeButton ? (
        <Button onClick={onResume} size="lg" className="w-full text-xl py-6">
          Resume
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button
            onClick={onFail}
            variant="destructive"
            size="lg"
            className="flex-1 text-xl py-6"
          >
            Fail
          </Button>
          <Button
            onClick={onPause}
            size="lg"
            className="flex-1 text-xl py-6 bg-amber-500 hover:bg-amber-600 text-black"
          >
            Pause
          </Button>
        </div>
      )}
    </div>
  )
}
