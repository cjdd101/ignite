import React from 'react'

interface PerspectiveCardProps {
  type: string
  description: string
  firstStep: string
  searchPhrase: string
  selected: boolean
  onSelect: () => void
}

export function PerspectiveCard({
  type,
  description,
  firstStep,
  searchPhrase,
  selected,
  onSelect,
}: PerspectiveCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-fire-spark bg-fire-spark/10'
          : 'border-white/10 hover:border-white/20 bg-bg-card'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="mt-1 accent-fire-spark"
        />
        <div className="flex-1">
          <div className="font-medium text-fire-spark">{type}</div>
          <div className="text-sm text-text-secondary mt-1">{description}</div>
          <div className="mt-2 text-sm text-text-primary">{firstStep}</div>
          <div className="mt-1 text-xs text-text-muted">探索口令: {searchPhrase}</div>
        </div>
      </div>
    </button>
  )
}