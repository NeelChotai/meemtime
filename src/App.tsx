import { useState, useEffect, useRef, useCallback } from 'react'
import { SetupScreen } from '@/components/SetupScreen'
import { TrainingScreen } from '@/components/TrainingScreen'
import { SettingsPanel } from '@/components/SettingsPanel'
import { Flash } from '@/components/Flash'
import { calculateNextTarget, type RoundHistoryItem } from '@/lib/timer'
import './App.css'

type Screen = 'setup' | 'training'

function App() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Settings
  const [vibrateEnabled, setVibrateEnabled] = useState(() => {
    return localStorage.getItem('meemtime-vibrate') === 'true'
  })
  const [flashColor, setFlashColor] = useState(() => {
    return localStorage.getItem('meemtime-flash-color') || '#4ade80'
  })

  // Timer state
  const [baselineMs, setBaselineMs] = useState(60000)
  const [intervalMs, setIntervalMs] = useState(10000)
  const [currentTargetMs, setCurrentTargetMs] = useState(60000)
  const [lastCompletedTarget, setLastCompletedTarget] = useState(0)
  const [nextTargetMs, setNextTargetMs] = useState(0)
  const [round, setRound] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [isAfterFail, setIsAfterFail] = useState(false)
  const [roundHistory, setRoundHistory] = useState<RoundHistoryItem[]>([])
  const [remainingMs, setRemainingMs] = useState(0)
  const [sessionElapsed, setSessionElapsed] = useState(0)
  const [flashTrigger, setFlashTrigger] = useState(0)

  const timerEndTimeRef = useRef<number | null>(null)
  const sessionStartTimeRef = useRef<number | null>(null)
  const totalActiveTimeRef = useRef(0)
  const remainingAtPauseRef = useRef(0)
  const animationIdRef = useRef<number | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('meemtime-vibrate', vibrateEnabled ? 'true' : 'false')
  }, [vibrateEnabled])

  useEffect(() => {
    localStorage.setItem('meemtime-flash-color', flashColor)
  }, [flashColor])

  // Wake lock
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch {
      // Wake lock failed, ignore
    }
  }, [])

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release()
      wakeLockRef.current = null
    }
  }, [])

  // Trigger flash and vibrate
  const triggerRoundComplete = useCallback(() => {
    setFlashTrigger((t) => t + 1)
    if (vibrateEnabled && navigator.vibrate) {
      navigator.vibrate(100)
    }
  }, [vibrateEnabled])

  // Timer loop
  const updateTimer = useCallback(() => {
    const now = Date.now()
    const endTime = timerEndTimeRef.current
    if (!endTime) return

    const remaining = Math.max(0, endTime - now)
    setRemainingMs(remaining)

    // Update session elapsed
    const elapsed =
      totalActiveTimeRef.current + (sessionStartTimeRef.current ? now - sessionStartTimeRef.current : 0)
    setSessionElapsed(elapsed)

    if (remaining <= 0) {
      // Round completed
      triggerRoundComplete()

      setRoundHistory((prev) => [...prev, { round, duration: currentTargetMs }])
      setLastCompletedTarget(currentTargetMs)

      const newRound = round + 1
      setRound(newRound)

      const newTarget = nextTargetMs
      setCurrentTargetMs(newTarget)

      const newNextTarget = calculateNextTarget(newTarget + intervalMs)
      setNextTargetMs(newNextTarget)

      timerEndTimeRef.current = Date.now() + newTarget
    }

    animationIdRef.current = requestAnimationFrame(updateTimer)
  }, [round, currentTargetMs, nextTargetMs, intervalMs, triggerRoundComplete])

  // Start training
  const handleStart = useCallback(
    (baseline: number, interval: number) => {
      setBaselineMs(baseline)
      setIntervalMs(interval)
      setCurrentTargetMs(baseline)
      setLastCompletedTarget(0)
      setNextTargetMs(calculateNextTarget(baseline + interval))
      setRound(1)
      setIsPaused(false)
      setIsAfterFail(false)
      setRoundHistory([])
      setRemainingMs(baseline)

      sessionStartTimeRef.current = Date.now()
      totalActiveTimeRef.current = 0
      timerEndTimeRef.current = Date.now() + baseline

      setSettingsOpen(false)
      setScreen('training')
      requestWakeLock()

      animationIdRef.current = requestAnimationFrame(updateTimer)
    },
    [requestWakeLock, updateTimer]
  )

  // Pause
  const handlePause = useCallback(() => {
    if (isPaused) return

    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
    }

    const remaining = Math.max(0, (timerEndTimeRef.current || 0) - Date.now())
    remainingAtPauseRef.current = remaining

    totalActiveTimeRef.current += Date.now() - (sessionStartTimeRef.current || Date.now())
    sessionStartTimeRef.current = null

    setIsPaused(true)
    setIsAfterFail(false)
    setRemainingMs(remaining)
  }, [isPaused])

  // Fail
  const handleFail = useCallback(() => {
    if (isPaused) return

    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
    }

    totalActiveTimeRef.current += Date.now() - (sessionStartTimeRef.current || Date.now())
    sessionStartTimeRef.current = null

    const recoveryTarget = lastCompletedTarget > 0 ? lastCompletedTarget : baselineMs
    setCurrentTargetMs(recoveryTarget)
    setNextTargetMs(calculateNextTarget(recoveryTarget + intervalMs))
    setRemainingMs(recoveryTarget)

    setIsPaused(true)
    setIsAfterFail(true)
    remainingAtPauseRef.current = 0
  }, [isPaused, lastCompletedTarget, baselineMs, intervalMs])

  // Resume
  const handleResume = useCallback(() => {
    setIsPaused(false)
    sessionStartTimeRef.current = Date.now()

    if (isAfterFail) {
      setIsAfterFail(false)
      setRound((r) => r + 1)
      timerEndTimeRef.current = Date.now() + currentTargetMs
    } else {
      timerEndTimeRef.current = Date.now() + remainingAtPauseRef.current
    }

    animationIdRef.current = requestAnimationFrame(updateTimer)
  }, [isAfterFail, currentTargetMs, updateTimer])

  // End session
  const handleEnd = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
    }
    releaseWakeLock()
    setSettingsOpen(false)
    setScreen('setup')
  }, [releaseWakeLock])

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isPaused && screen === 'training') {
        requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isPaused, screen, requestWakeLock])

  // Click outside settings to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        settingsOpen &&
        !target.closest('[data-settings-panel]') &&
        !target.closest('[aria-label="Settings"]')
      ) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [settingsOpen])

  return (
    <div className="h-screen bg-background text-foreground dark">
      <Flash color={flashColor} trigger={flashTrigger} />

      {screen === 'setup' ? (
        <SetupScreen onStart={handleStart} onSettingsClick={() => setSettingsOpen((o) => !o)} />
      ) : (
        <TrainingScreen
          round={round}
          currentTargetMs={currentTargetMs}
          remainingMs={remainingMs}
          nextTargetMs={nextTargetMs}
          sessionElapsed={sessionElapsed}
          roundHistory={roundHistory}
          isPaused={isPaused}
          isAfterFail={isAfterFail}
          onFail={handleFail}
          onPause={handlePause}
          onResume={handleResume}
          onEnd={handleEnd}
          onSettingsClick={() => setSettingsOpen((o) => !o)}
        />
      )}

      <div data-settings-panel>
        <SettingsPanel
          isOpen={settingsOpen}
          vibrateEnabled={vibrateEnabled}
          flashColor={flashColor}
          onVibrateChange={setVibrateEnabled}
          onFlashColorChange={setFlashColor}
          onClose={() => setSettingsOpen(false)}
        />
      </div>
    </div>
  )
}

export default App
