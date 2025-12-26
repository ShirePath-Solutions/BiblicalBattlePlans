import { ProgressBar } from '../ui'

interface PlanProgressProps {
  currentDay: number
  totalDays: number
  completedToday: number
  totalToday: number
  unit?: string // e.g., "chapters", "sections", "lists"
  className?: string
}

export function PlanProgress({
  currentDay,
  totalDays,
  completedToday,
  totalToday,
  unit = 'sections',
  className = '',
}: PlanProgressProps) {
  const overallProgress = totalDays > 0 ? Math.round(((currentDay - 1) / totalDays) * 100) : 0
  const todayProgress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Today's Progress */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-terminal-gray-400">Today's Progress</span>
          <span className="text-terminal-green">
            {completedToday}/{totalToday} {unit}
          </span>
        </div>
        <ProgressBar
          value={todayProgress}
          max={100}
          variant="success"
        />
      </div>

      {/* Overall Progress */}
      {totalDays > 0 && (
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-terminal-gray-400">Campaign Progress</span>
            <span className="text-terminal-gray-200">
              Day {currentDay} of {totalDays}
            </span>
          </div>
          <ProgressBar
            value={overallProgress}
            max={100}
            variant="default"
          />
        </div>
      )}
    </div>
  )
}
