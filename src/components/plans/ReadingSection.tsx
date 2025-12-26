import { Check, ChevronRight } from 'lucide-react'

interface ReadingSectionProps {
  id: string
  label: string
  passage: string
  isCompleted: boolean
  onToggle: () => void
  onContinue?: () => void
  disabled?: boolean
  showContinue?: boolean
  continueLabel?: string
}

export function ReadingSection({
  label,
  passage,
  isCompleted,
  onToggle,
  onContinue,
  disabled = false,
  showContinue = false,
  continueLabel = "Continue to next chapter",
}: ReadingSectionProps) {
  return (
    <div
      className={`
        border-2 transition-all duration-150
        ${
          isCompleted
            ? 'border-terminal-green bg-terminal-green/10'
            : 'border-terminal-gray-500 bg-terminal-darker'
        }
      `}
    >
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`
          w-full text-left p-3
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-terminal-gray-600/30'}
        `}
      >
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <div
            className={`
              w-5 h-5 border-2 flex items-center justify-center flex-shrink-0
              ${isCompleted ? 'border-terminal-green bg-terminal-green' : 'border-terminal-gray-400'}
            `}
          >
            {isCompleted && (
              <Check className="w-3 h-3 text-terminal-dark" strokeWidth={3} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-terminal-gray-400 mb-0.5">{label}</div>
            <div
              className={`font-mono ${
                isCompleted ? 'text-terminal-gray-400' : 'text-terminal-gray-100'
              }`}
            >
              {passage}
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex-shrink-0">
            {isCompleted ? (
              <span className="text-terminal-green text-xs">[DONE]</span>
            ) : (
              <span className="text-terminal-gray-500 text-xs">[    ]</span>
            )}
          </div>
        </div>
      </button>

      {/* Continue button - shown when completed and showContinue is true */}
      {isCompleted && showContinue && onContinue && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onContinue()
          }}
          disabled={disabled}
          className={`
            w-full text-left px-3 py-2 border-t border-terminal-green/30
            flex items-center justify-between
            text-terminal-green text-sm hover:bg-terminal-green/20 transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className="font-mono">{continueLabel}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
