export function calculateNextTarget(baseTarget: number, maxVariance = 0.2): number {
  const multiplier = 1 + Math.random() * maxVariance
  return Math.round(baseTarget * multiplier)
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatMs(ms: number): string {
  const fraction = Math.floor((ms % 1000) / 10)
  return `.${fraction.toString().padStart(2, '0')}`
}

export interface RoundHistoryItem {
  round: number
  duration: number
}

export interface TimerState {
  baselineMs: number
  intervalMs: number
  currentTargetMs: number
  lastCompletedTarget: number
  nextTargetMs: number
  round: number
  timerEndTime: number | null
  isPaused: boolean
  isAfterFail: boolean
  sessionStartTime: number | null
  totalActiveTime: number
  roundHistory: RoundHistoryItem[]
  remainingTimeAtPause: number
}

export function createInitialState(baselineMs: number, intervalMs: number): TimerState {
  const nextTargetMs = calculateNextTarget(baselineMs + intervalMs)
  return {
    baselineMs,
    intervalMs,
    currentTargetMs: baselineMs,
    lastCompletedTarget: 0,
    nextTargetMs,
    round: 1,
    timerEndTime: null,
    isPaused: false,
    isAfterFail: false,
    sessionStartTime: null,
    totalActiveTime: 0,
    roundHistory: [],
    remainingTimeAtPause: 0,
  }
}
