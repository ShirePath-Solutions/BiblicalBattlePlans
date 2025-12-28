import { useAuth } from '../../hooks/useAuth'
import { StreakBadge } from '../ui'

interface ProfileHeaderProps {
  currentStreak: number
}

// Rank definitions
const RANKS = [
  { name: 'LEGENDARY', minDays: 90 },
  { name: 'VETERAN', minDays: 60},
  { name: 'WARRIOR', minDays: 30 },
  { name: 'SOLDIER', minDays: 7 },
  { name: 'RECRUIT', minDays: 0 },
]

function getCurrentRank(streak: number) {
  return RANKS.find(r => streak >= r.minDays) || RANKS[RANKS.length - 1]
}

export function ProfileHeader({ currentStreak }: ProfileHeaderProps) {
  const { profile, user } = useAuth()

  // Display name is the friendly name, falls back to username if not set
  const displayName = profile?.display_name || profile?.username || 'Hero'
  // Username is the unique identifier (handle)
  const username = profile?.username || user?.email?.split('@')[0] || 'anonymous'
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown'

  const currentRank = getCurrentRank(currentStreak)

  return (
    <div className="bg-gradient-to-br from-parchment to-parchment-light border-2 border-border-subtle p-5 shadow-[0_4px_12px_var(--shadow-color)]">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-sage to-sage-dark border-2 border-sage-dark flex items-center justify-center shadow-[0_2px_4px_var(--shadow-color)] flex-shrink-0">
          <span className="font-pixel text-xl sm:text-2xl text-white">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-pixel text-[0.875rem] sm:text-sm text-ink truncate">
            {displayName.toUpperCase()}
          </h2>
          <p className="font-pixel text-[0.5rem] text-ink-muted mt-0.5">
            @{username}
          </p>
          <p className="font-pixel text-[0.5rem] text-ink-faint mt-1.5">
            Enlisted: {joinDate}
          </p>
          
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div className="px-2.5 py-1 bg-sage border border-sage-dark">
              <span className="font-pixel text-[0.5rem] text-white">{currentRank.name}</span>
            </div>
            <StreakBadge days={currentStreak} />
          </div>
        </div>
      </div>
    </div>
  )
}
