import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { UserStats } from '../types'

export const statsKeys = {
  user: (userId: string) => ['stats', userId] as const,
}

export function useStats() {
  const { user, profile } = useAuth()

  return useQuery({
    queryKey: statsKeys.user(user?.id || ''),
    queryFn: async (): Promise<UserStats> => {
      if (!user) {
        return {
          total_chapters_read: 0,
          current_streak: 0,
          longest_streak: 0,
          plans_completed: 0,
          plans_active: 0,
          total_days_reading: 0,
        }
      }

      // Get user's streak minimum preference (default 3)
      const streakMinimum = profile?.streak_minimum || 3

      // Fetch all user's daily progress with user_plan_id
      const { data: progressData } = await (supabase
        .from('daily_progress') as ReturnType<typeof supabase.from>)
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      // Fetch user plans with reading plan details
      const { data: userPlans } = await (supabase
        .from('user_plans') as ReturnType<typeof supabase.from>)
        .select('*, plan:reading_plans(*)')
        .eq('user_id', user.id)

      const progress = (progressData || []) as DailyProgressRecord[]
      const plans = (userPlans || []) as UserPlanWithPlan[]

      // Create a map of user_plan_id to plan type and chapters_per_day
      const planInfoMap = new Map<string, { type: string; chaptersPerDay: number }>()
      for (const up of plans) {
        if (up.plan?.daily_structure) {
          const structure = up.plan.daily_structure as { type: string; chapters_per_day?: number }
          planInfoMap.set(up.id, {
            type: structure.type,
            chaptersPerDay: structure.chapters_per_day || 3,
          })
        }
      }

      // Calculate total chapters read based on plan type
      const totalChapters = progress.reduce((sum, day) => {
        const sectionsCount = day.completed_sections?.length || 0
        const planInfo = planInfoMap.get(day.user_plan_id)

        if (!planInfo) {
          // Default: each section is one chapter
          return sum + sectionsCount
        }

        if (planInfo.type === 'sequential') {
          // For sequential plans, each completed section is chapters_per_day chapters
          return sum + sectionsCount * planInfo.chaptersPerDay
        }

        // For cycling and sectional plans, each section is one chapter/reading
        return sum + sectionsCount
      }, 0)

      // Helper to calculate chapters for a progress record
      const getChaptersForProgress = (p: DailyProgressRecord): number => {
        const sectionsCount = p.completed_sections?.length || 0
        const planInfo = planInfoMap.get(p.user_plan_id)
        if (planInfo?.type === 'sequential') {
          return sectionsCount * planInfo.chaptersPerDay
        }
        return sectionsCount
      }

      // Calculate streak using streak minimum (with actual chapter counts)
      const { currentStreak, longestStreak } = calculateStreaks(progress, streakMinimum, getChaptersForProgress)

      // Count plans
      const plansActive = plans.filter((p) => !p.is_completed).length
      const plansCompleted = plans.filter((p) => p.is_completed).length

      // Total unique days with enough chapters to count (using actual chapter counts)
      const qualifyingDays = progress.filter(
        (p) => getChaptersForProgress(p) >= streakMinimum
      )
      const uniqueDays = new Set(qualifyingDays.map((p) => p.date)).size

      return {
        total_chapters_read: totalChapters,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        plans_completed: plansCompleted,
        plans_active: plansActive,
        total_days_reading: uniqueDays,
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

interface DailyProgressRecord {
  date: string
  is_complete: boolean
  completed_sections: string[]
  user_plan_id: string
}

interface UserPlanWithPlan {
  id: string
  is_completed: boolean
  plan?: {
    daily_structure: unknown
  }
}

function calculateStreaks(
  progress: DailyProgressRecord[],
  streakMinimum: number = 3,
  getChapters?: (p: DailyProgressRecord) => number
): {
  currentStreak: number
  longestStreak: number
} {
  if (progress.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Chapter counter function (defaults to counting sections)
  const countChapters = getChapters || ((p: DailyProgressRecord) => p.completed_sections?.length || 0)

  // Get unique dates where user met the streak minimum, sorted descending
  const completedDates = [...new Set(
    progress
      .filter((p) => countChapters(p) >= streakMinimum)
      .map((p) => p.date)
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Check if streak is current (today or yesterday)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const mostRecentDate = new Date(completedDates[0])
  mostRecentDate.setHours(0, 0, 0, 0)

  const isCurrentStreak =
    mostRecentDate.getTime() === today.getTime() ||
    mostRecentDate.getTime() === yesterday.getTime()

  // Calculate all streaks
  let currentStreak = 0
  let longestStreak = 0
  let streakCount = 1

  for (let i = 0; i < completedDates.length; i++) {
    if (i === 0) {
      streakCount = 1
    } else {
      const currentDate = new Date(completedDates[i])
      const prevDate = new Date(completedDates[i - 1])
      const diffDays = Math.round(
        (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === 1) {
        streakCount++
      } else {
        // Streak broken
        if (i === 1 || currentStreak === 0) {
          currentStreak = isCurrentStreak ? streakCount : 0
        }
        longestStreak = Math.max(longestStreak, streakCount)
        streakCount = 1
      }
    }
  }

  // Handle final streak
  if (currentStreak === 0 && isCurrentStreak) {
    currentStreak = streakCount
  }
  longestStreak = Math.max(longestStreak, streakCount)

  return { currentStreak, longestStreak }
}

// Helper to get streak rank
export function getStreakRank(days: number): {
  rank: string
  nextRank: string | null
  daysToNext: number
} {
  if (days >= 30) {
    return { rank: 'LEGENDARY', nextRank: null, daysToNext: 0 }
  }
  if (days >= 14) {
    return { rank: 'VETERAN', nextRank: 'LEGENDARY', daysToNext: 30 - days }
  }
  if (days >= 7) {
    return { rank: 'WARRIOR', nextRank: 'VETERAN', daysToNext: 14 - days }
  }
  if (days >= 3) {
    return { rank: 'SOLDIER', nextRank: 'WARRIOR', daysToNext: 7 - days }
  }
  return { rank: 'RECRUIT', nextRank: 'SOLDIER', daysToNext: 3 - days }
}
