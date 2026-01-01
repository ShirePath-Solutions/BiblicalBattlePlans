import { useMemo } from 'react'
import { useMyGuilds } from './useGuilds'

/**
 * Get a map of plan IDs to guild names that recommend them.
 * Used on the Plans page to show "Recommended by [Guild]" badges.
 */
export function useGuildRecommendations() {
  const { data: memberships, isLoading } = useMyGuilds()

  const recommendations = useMemo(() => {
    const planToGuilds: Record<string, string[]> = {}

    if (!memberships) return planToGuilds

    for (const membership of memberships) {
      const guild = membership.guild
      if (guild?.recommended_plan_id) {
        if (!planToGuilds[guild.recommended_plan_id]) {
          planToGuilds[guild.recommended_plan_id] = []
        }
        planToGuilds[guild.recommended_plan_id].push(guild.name)
      }
    }

    return planToGuilds
  }, [memberships])

  return {
    recommendations,
    isLoading,
    // Helper function to get guild names for a plan
    getRecommendingGuilds: (planId: string) => recommendations[planId] || [],
  }
}
