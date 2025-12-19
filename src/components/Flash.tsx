import { useEffect, useState } from 'react'

interface FlashProps {
  color: string
  trigger: number
}

export function Flash({ color, trigger }: FlashProps) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger > 0 && color !== 'off') {
      setIsActive(true)
      const timeout = setTimeout(() => setIsActive(false), 500)
      return () => clearTimeout(timeout)
    }
  }, [trigger, color])

  if (color === 'off') return null

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[1000] transition-opacity duration-500 ${
        isActive ? 'opacity-40' : 'opacity-0'
      }`}
      style={{ backgroundColor: color }}
    />
  )
}
