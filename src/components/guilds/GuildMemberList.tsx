import { useState } from 'react'
import { Crown, MoreVertical, UserMinus, ShieldCheck, ShieldOff, Flame } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useRemoveMember, usePromoteMember, useDemoteMember } from '../../hooks/useGuilds'
import type { GuildMember, Profile } from '../../types'

interface GuildMemberListProps {
  members: (GuildMember & { profile: Profile })[]
  guildId: string
  isAdmin: boolean
}

export function GuildMemberList({ members, guildId, isAdmin }: GuildMemberListProps) {
  const { user } = useAuth()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const removeMember = useRemoveMember()
  const promoteMember = usePromoteMember()
  const demoteMember = useDemoteMember()

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member from the guild?')) return
    try {
      await removeMember.mutateAsync({ guildId, userId })
      setActiveMenu(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to remove member')
    }
  }

  const handlePromote = async (userId: string) => {
    try {
      await promoteMember.mutateAsync({ guildId, userId })
      setActiveMenu(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to promote member')
    }
  }

  const handleDemote = async (userId: string) => {
    try {
      await demoteMember.mutateAsync({ guildId, userId })
      setActiveMenu(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to demote member')
    }
  }

  return (
    <div className="divide-y divide-border-subtle">
      {members.map((member) => {
        const isCurrentUser = member.user_id === user?.id
        const displayName = member.profile?.display_name || member.profile?.username || 'Unknown'
        const streak = member.profile?.current_streak || 0

        return (
          <div
            key={member.id}
            className="flex items-center justify-between py-3 px-1"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar or Initials */}
              <div className="w-10 h-10 bg-parchment-dark border-2 border-border-subtle flex items-center justify-center flex-shrink-0">
                {member.profile?.avatar_url ? (
                  <img
                    src={member.profile.avatar_url}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-pixel text-[0.75rem] text-ink">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Name + Role */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[0.625rem] text-ink truncate">
                    {displayName.toUpperCase()}
                    {isCurrentUser && (
                      <span className="text-ink-muted ml-1">(YOU)</span>
                    )}
                  </span>
                  {member.role === 'admin' && (
                    <Crown className="w-3 h-3 text-gold flex-shrink-0" />
                  )}
                </div>

                {/* Streak */}
                {streak > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Flame className="w-3 h-3 text-gold" />
                    <span className="font-pixel text-[0.5rem] text-ink-muted">
                      {streak} day streak
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && !isCurrentUser && (
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === member.id ? null : member.id)}
                  className="p-2 hover:bg-parchment-light rounded"
                >
                  <MoreVertical className="w-4 h-4 text-ink-muted" />
                </button>

                {/* Dropdown Menu */}
                {activeMenu === member.id && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setActiveMenu(null)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 top-full mt-1 z-20 bg-parchment border-2 border-border shadow-lg min-w-[160px]">
                      {member.role === 'member' ? (
                        <button
                          onClick={() => handlePromote(member.user_id)}
                          disabled={promoteMember.isPending}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-parchment-light text-left"
                        >
                          <ShieldCheck className="w-4 h-4 text-sage" />
                          <span className="font-pixel text-[0.625rem]">MAKE ADMIN</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDemote(member.user_id)}
                          disabled={demoteMember.isPending}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-parchment-light text-left"
                        >
                          <ShieldOff className="w-4 h-4 text-ink-muted" />
                          <span className="font-pixel text-[0.625rem]">REMOVE ADMIN</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(member.user_id)}
                        disabled={removeMember.isPending}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-parchment-light text-left"
                      >
                        <UserMinus className="w-4 h-4 text-danger" />
                        <span className="font-pixel text-[0.625rem] text-danger">REMOVE</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
