import { Delete } from 'lucide-react'

interface NumpadProps {
  onKey: (key: string) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫']

export function Numpad({ onKey }: NumpadProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button
          key={key}
          onClick={() => onKey(key)}
          className="flex h-14 items-center justify-center rounded-2xl text-xl font-semibold transition-all active:scale-95"
          style={{
            background: 'var(--surface-muted)',
            color: 'var(--ink)',
            border: '1px solid var(--border)',
          }}
        >
          {key === '⌫' ? <Delete className="size-5" /> : key}
        </button>
      ))}
    </div>
  )
}
