import { useAuth } from '../../hooks/useAuth'
import { StreakBadge } from '../ui'

interface ProfileHeaderProps {
  currentStreak: number
}

export function ProfileHeader({ currentStreak }: ProfileHeaderProps) {
  const { profile, user } = useAuth()

  // Display name is the friendly name, falls back to username if not set
  const displayName = profile?.display_name || profile?.username || 'Soldier'
  // Username is the unique identifier (handle)
  const username = profile?.username || user?.email?.split('@')[0] || 'anonymous'
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown'

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-terminal-darker border-2 border-terminal-gray-500">
      {/* Avatar */}
      <div className="w-24 h-24 bg-terminal-gray-600 border-2 border-terminal-green flex items-center justify-center">
        <span className="text-4xl font-pixel text-terminal-green">
          {displayName.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 text-center sm:text-left">
        <h1 className="text-2xl font-pixel text-terminal-green">
          {displayName.toUpperCase()}
        </h1>
        <p className="text-terminal-gray-400 mt-1">@{username}</p>
        <p className="text-terminal-gray-500 text-sm mt-2">
          Enlisted: {joinDate}
        </p>
        <div className="mt-3">
          <StreakBadge days={currentStreak} />
        </div>
      </div>
    </div>
  )
}
