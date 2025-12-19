import { useState } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SetupScreenProps {
  onStart: (baselineMs: number, intervalMs: number) => void
  onSettingsClick: () => void
}

export function SetupScreen({ onStart, onSettingsClick }: SetupScreenProps) {
  const [baselineMin, setBaselineMin] = useState(0)
  const [baselineSec, setBaselineSec] = useState(30)
  const [intervalMin, setIntervalMin] = useState(0)
  const [intervalSec, setIntervalSec] = useState(10)

  const handleStart = () => {
    const baselineMs = (baselineMin || 0) * 60000 + (baselineSec || 0) * 1000
    const intervalMs = (intervalMin || 0) * 60000 + (intervalSec || 0) * 1000
    if (baselineMs < 1000) return
    onStart(baselineMs, intervalMs || 10000)
  }

  return (
    <div className="flex flex-col h-full justify-center items-center relative px-8">
      <button
        onClick={onSettingsClick}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Settings"
      >
        <Settings size={20} />
      </button>

      <div className="w-full max-w-xs flex flex-col gap-8 text-center">
        <h1 className="text-2xl font-semibold">meemtime</h1>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground uppercase tracking-wide">
            Baseline Duration
          </label>
          <div className="flex gap-2 items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <Input
                type="number"
                value={baselineMin}
                onChange={(e) => setBaselineMin(parseInt(e.target.value) || 0)}
                min={0}
                max={59}
                className="w-20 text-center text-xl font-mono"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
            <span className="text-xl text-muted-foreground pt-[-1rem]">:</span>
            <div className="flex flex-col items-center gap-1">
              <Input
                type="number"
                value={baselineSec}
                onChange={(e) => setBaselineSec(parseInt(e.target.value) || 0)}
                min={0}
                max={59}
                className="w-20 text-center text-xl font-mono"
              />
              <span className="text-xs text-muted-foreground">sec</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground uppercase tracking-wide">
            Interval Increment
          </label>
          <div className="flex gap-2 items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <Input
                type="number"
                value={intervalMin}
                onChange={(e) => setIntervalMin(parseInt(e.target.value) || 0)}
                min={0}
                max={59}
                className="w-20 text-center text-xl font-mono"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
            <span className="text-xl text-muted-foreground">:</span>
            <div className="flex flex-col items-center gap-1">
              <Input
                type="number"
                value={intervalSec}
                onChange={(e) => setIntervalSec(parseInt(e.target.value) || 0)}
                min={0}
                max={59}
                className="w-20 text-center text-xl font-mono"
              />
              <span className="text-xs text-muted-foreground">sec</span>
            </div>
          </div>
        </div>

        <Button onClick={handleStart} size="lg" className="w-full text-lg py-6">
          Start Training
        </Button>
      </div>
    </div>
  )
}
