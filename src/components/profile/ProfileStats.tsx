import { BookOpen, Flame, Star, Calendar, Swords, Trophy, Check, type LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardContent, ProgressBar } from '../ui'
import { getStreakRank } from '../../hooks/useStats'
import type { UserStats } from '../../types'

interface ProfileStatsProps {
  stats: UserStats
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const streakInfo = getStreakRank(stats.current_streak)

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="CHAPTERS READ"
          value={stats.total_chapters_read}
          icon={BookOpen}
        />
        <StatCard
          label="CURRENT STREAK"
          value={stats.current_streak}
          suffix=" days"
          icon={Flame}
        />
        <StatCard
          label="LONGEST STREAK"
          value={stats.longest_streak}
          suffix=" days"
          icon={Star}
        />
        <StatCard
          label="DAYS READING"
          value={stats.total_days_reading}
          icon={Calendar}
        />
        <StatCard
          label="ACTIVE CAMPAIGNS"
          value={stats.plans_active}
          icon={Swords}
        />
        <StatCard
          label="CAMPAIGNS COMPLETE"
          value={stats.plans_completed}
          icon={Trophy}
        />
      </div>

      {/* Rank Progress */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-pixel text-terminal-green">
            RANK PROGRESS
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-terminal-gray-400">Current Rank:</span>
              <span className="text-terminal-green font-pixel ml-2">
                [{streakInfo.rank}]
              </span>
            </div>
            {streakInfo.nextRank && (
              <div className="text-right">
                <span className="text-terminal-gray-400">Next:</span>
                <span className="text-achievement-gold font-pixel ml-2">
                  [{streakInfo.nextRank}]
                </span>
              </div>
            )}
          </div>

          {streakInfo.nextRank && (
            <div>
              <div className="flex justify-between text-sm text-terminal-gray-400 mb-2">
                <span>Progress to {streakInfo.nextRank}</span>
                <span>{streakInfo.daysToNext} days remaining</span>
              </div>
              <ProgressBar
                value={stats.current_streak}
                max={stats.current_streak + streakInfo.daysToNext}
                variant="warning"
              />
            </div>
          )}

          {!streakInfo.nextRank && (
            <div className="text-center py-4">
              <span className="text-achievement-gold font-pixel text-lg">
                MAXIMUM RANK ACHIEVED
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rank Ladder */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-pixel text-terminal-green">
            RANK LADDER
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <RankRow
              rank="LEGENDARY"
              days="30+"
              isActive={stats.current_streak >= 30}
              isCurrent={streakInfo.rank === 'LEGENDARY'}
            />
            <RankRow
              rank="VETERAN"
              days="14-29"
              isActive={stats.current_streak >= 14}
              isCurrent={streakInfo.rank === 'VETERAN'}
            />
            <RankRow
              rank="WARRIOR"
              days="7-13"
              isActive={stats.current_streak >= 7}
              isCurrent={streakInfo.rank === 'WARRIOR'}
            />
            <RankRow
              rank="SOLDIER"
              days="3-6"
              isActive={stats.current_streak >= 3}
              isCurrent={streakInfo.rank === 'SOLDIER'}
            />
            <RankRow
              rank="RECRUIT"
              days="0-2"
              isActive={true}
              isCurrent={streakInfo.rank === 'RECRUIT'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  suffix = '',
  icon: Icon,
}: {
  label: string
  value: number
  suffix?: string
  icon: LucideIcon
}) {
  return (
    <div className="p-4 bg-terminal-darker border-2 border-terminal-gray-500 text-center">
      <div className="flex justify-center mb-2">
        <Icon className="w-6 h-6 text-terminal-green" />
      </div>
      <div className="text-2xl font-pixel text-terminal-green">
        {value}
        {suffix && <span className="text-sm">{suffix}</span>}
      </div>
      <div className="text-xs text-terminal-gray-400 mt-1">{label}</div>
    </div>
  )
}

function RankRow({
  rank,
  days,
  isActive,
  isCurrent,
}: {
  rank: string
  days: string
  isActive: boolean
  isCurrent: boolean
}) {
  return (
    <div
      className={`
        flex items-center justify-between p-3 border-2
        ${isCurrent
          ? 'border-terminal-green bg-terminal-green/10'
          : isActive
          ? 'border-terminal-gray-500 bg-terminal-dark'
          : 'border-terminal-gray-600 bg-terminal-darker opacity-50'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span
          className={`
            w-6 h-6 flex items-center justify-center border-2
            ${isCurrent ? 'border-terminal-green text-terminal-green' : 'border-terminal-gray-500 text-terminal-gray-400'}
          `}
        >
          {isActive && <Check className="w-4 h-4" />}
        </span>
        <span
          className={`font-pixel ${
            isCurrent ? 'text-terminal-green' : 'text-terminal-gray-300'
          }`}
        >
          {rank}
        </span>
      </div>
      <span className="text-terminal-gray-400 text-sm">{days} days</span>
    </div>
  )
}
