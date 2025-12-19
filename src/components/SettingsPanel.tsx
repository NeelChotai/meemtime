import { Switch } from '@/components/ui/switch'

const FLASH_COLORS = [
  { color: '#4ade80', label: 'Green' },
  { color: '#3b82f6', label: 'Blue' },
  { color: '#a855f7', label: 'Purple' },
  { color: '#f97316', label: 'Orange' },
  { color: 'off', label: 'Off' },
]

interface SettingsPanelProps {
  isOpen: boolean
  vibrateEnabled: boolean
  flashColor: string
  onVibrateChange: (enabled: boolean) => void
  onFlashColorChange: (color: string) => void
  onClose: () => void
}

export function SettingsPanel({
  isOpen,
  vibrateEnabled,
  flashColor,
  onVibrateChange,
  onFlashColorChange,
}: SettingsPanelProps) {
  if (!isOpen) return null

  return (
    <div className="fixed top-14 right-4 bg-secondary rounded-xl p-4 flex flex-col gap-4 z-50 min-w-[220px] shadow-lg">
      <label className="flex justify-between items-center text-sm text-muted-foreground cursor-pointer">
        <span>Vibrate on round change</span>
        <Switch checked={vibrateEnabled} onCheckedChange={onVibrateChange} />
      </label>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Flash colour</span>
        <div className="flex gap-2">
          {FLASH_COLORS.map(({ color, label }) => (
            <button
              key={color}
              onClick={() => onFlashColorChange(color)}
              className={`w-7 h-7 rounded-full border-2 transition-transform active:scale-90 ${
                flashColor === color ? 'border-foreground' : 'border-transparent'
              } ${color === 'off' ? 'bg-background relative' : ''}`}
              style={color !== 'off' ? { backgroundColor: color } : undefined}
              aria-label={label}
            >
              {color === 'off' && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-[70%] h-0.5 bg-muted-foreground rotate-[-45deg]" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
