import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { UserStats } from '../types'

export const statsKeys = {
  user: (userId: string) => ['stats', userId] as const,
}

/**
 * Hook to get user stats.
 * Stats are now stored on the profile and updated by database triggers,
 * so this is just a simple read operation.
 */
export function useStats() {
  const { user, profile } = useAuth()

  return useQuery({
    queryKey: statsKeys.user(user?.id || ''),
    queryFn: async (): Promise<UserStats> => {
      if (!user || !profile) {
        return {
          total_chapters_read: 0,
          current_streak: 0,
          longest_streak: 0,
          plans_completed: 0,
          plans_active: 0,
          total_days_reading: 0,
        }
      }

      // Stats are now computed by database triggers and stored on profile
      // We just need to count active/completed plans
      const { data: userPlans } = await (supabase
        .from('user_plans') as ReturnType<typeof supabase.from>)
        .select('id, is_completed, is_archived')
        .eq('user_id', user.id)

      const plans = (userPlans || []) as { id: string; is_completed: boolean; is_archived: boolean }[]
      const plansActive = plans.filter((p) => !p.is_completed && !p.is_archived).length
      const plansCompleted = plans.filter((p) => p.is_completed).length

      return {
        total_chapters_read: profile.total_chapters_read ?? 0,
        current_streak: profile.current_streak ?? 0,
        longest_streak: profile.longest_streak ?? 0,
        plans_completed: plansCompleted,
        plans_active: plansActive,
        total_days_reading: profile.total_days_reading ?? 0,
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Helper to get streak rank
export function getStreakRank(days: number): {
  rank: string
  nextRank: string | null
  daysToNext: number
} {
  if (days >= 90) {
    return { rank: 'LEGENDARY', nextRank: null, daysToNext: 0 }
  }
  if (days >= 60) {
    return { rank: 'VETERAN', nextRank: 'LEGENDARY', daysToNext: 90 - days }
  }
  if (days >= 30) {
    return { rank: 'WARRIOR', nextRank: 'VETERAN', daysToNext: 60 - days }
  }
  if (days >= 7) {
    return { rank: 'SOLDIER', nextRank: 'WARRIOR', daysToNext: 30 - days }
  }
  return { rank: 'RECRUIT', nextRank: 'SOLDIER', daysToNext: 7 - days }
}
