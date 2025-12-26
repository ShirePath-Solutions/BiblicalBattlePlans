import { useParams, useNavigate, Link } from 'react-router-dom'
import { Swords, BookOpen, ChevronRight } from 'lucide-react'
import {
  useUserPlan,
  useDailyProgress,
  useMarkChapterRead,
  useMarkSectionComplete,
  useAdvanceList,
  useAdvanceDay,
  getCurrentReadings,
  getTodaysReading,
  calculatePlanProgress,
  getChaptersReadToday,
} from '../hooks/usePlans'
import { useAuth } from '../hooks/useAuth'
import { ReadingSection, PlanProgress } from '../components/plans'
import { Card, CardHeader, CardContent, CardFooter, Button, LoadingSpinner, Badge } from '../components/ui'

export function ActivePlan() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const { data: userPlan, isLoading: planLoading } = useUserPlan(id || '')
  const { data: progress, isLoading: progressLoading } = useDailyProgress(id || '')
  const markChapterRead = useMarkChapterRead()
  const markSectionComplete = useMarkSectionComplete()
  const advanceList = useAdvanceList()
  const advanceDay = useAdvanceDay()

  const isLoading = planLoading || progressLoading
  const isMutating = markChapterRead.isPending || markSectionComplete.isPending || advanceList.isPending || advanceDay.isPending

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!userPlan) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-alert-red">! ERROR: Campaign not found</p>
          <Button variant="secondary" onClick={() => navigate('/plans')} className="mt-4">
            Back to Plans
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { plan } = userPlan
  const isCyclingPlan = plan.daily_structure.type === 'cycling_lists'

  // Get readings based on plan type
  const todaysReading = isCyclingPlan
    ? getCurrentReadings(plan, userPlan.list_positions || {}, progress || null)
    : getTodaysReading(plan, userPlan.current_day, progress || null)

  const chaptersReadToday = getChaptersReadToday(progress || null, plan)
  const streakMinimum = profile?.streak_minimum || 3
  const streakProgress = Math.min(chaptersReadToday, streakMinimum)
  const streakMet = chaptersReadToday >= streakMinimum
  const overallProgress = calculatePlanProgress(userPlan, plan)

  // Calculate days on plan (actual elapsed days since start)
  const daysOnPlan = (() => {
    if (!userPlan.start_date) return 1
    const startDate = new Date(userPlan.start_date)
    const today = new Date()
    startDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    const diffTime = today.getTime() - startDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // +1 because day 1 is the start date
  })()

  const daysAheadBehind = userPlan.current_day - daysOnPlan

  const handleToggleSection = async (section: typeof todaysReading[0]) => {
    if (!id || !userPlan) return

    if (isCyclingPlan) {
      // For cycling plans, use the chapter-based marking
      await markChapterRead.mutateAsync({
        userPlanId: id,
        listId: section.listId,
        chapterIndex: section.chapterIndex,
        userPlan,
      })
    } else {
      // For sequential/sectional plans, use section-based marking
      await markSectionComplete.mutateAsync({
        userPlanId: id,
        dayNumber: userPlan.current_day,
        sectionId: section.id,
        totalSections: todaysReading.length,
        existingProgress: progress || null,
      })
    }
  }

  const handleContinue = async (section: typeof todaysReading[0]) => {
    if (!id || !userPlan) return

    if (isCyclingPlan) {
      // For cycling plans, advance to next chapter in this list
      await advanceList.mutateAsync({
        userPlanId: id,
        listId: section.listId,
        userPlan,
      })
    } else {
      // For sequential/sectional plans, advance to next day
      await advanceDay.mutateAsync({
        userPlanId: id,
        userPlan,
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/plans"
        className="text-terminal-gray-400 hover:text-terminal-green transition-colors inline-block"
      >
        {'< Back to Plans'}
      </Link>

      {/* Campaign Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-pixel text-terminal-green">
                {plan.name}
              </h1>
              <p className="text-terminal-gray-400 mt-1">
                {isCyclingPlan ? 'Continuous Reading Plan' : `Day ${userPlan.current_day}`}
                {plan.duration_days > 0 && !isCyclingPlan && ` of ${plan.duration_days}`}
              </p>
            </div>
            {streakMet && (
              <Badge variant="success">GOAL MET</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <PlanProgress
            currentDay={userPlan.current_day}
            totalDays={plan.duration_days}
            completedToday={chaptersReadToday}
            totalToday={
              isCyclingPlan
                ? streakMinimum
                : plan.daily_structure.type === 'sequential'
                  ? (plan.daily_structure as any).chapters_per_day || 3
                  : todaysReading.length
            }
            unit={
              plan.daily_structure.type === 'sequential' || plan.daily_structure.type === 'cycling_lists'
                ? 'chapters'
                : 'sections'
            }
          />
        </CardContent>
      </Card>

      {/* Today's Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-pixel text-terminal-green">
              {"TODAY'S PROGRESS"}
            </h2>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-terminal-gray-400" />
              <span className="text-terminal-gray-300 font-mono">
                {chaptersReadToday} chapter{chaptersReadToday !== 1 ? 's' : ''} read
              </span>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm text-terminal-gray-400 mb-1">
              <span>Daily goal: {streakMinimum} chapters</span>
              <span>{streakProgress}/{streakMinimum}</span>
            </div>
            <div className="h-2 bg-terminal-gray-600 border border-terminal-gray-500">
              <div
                className={`h-full transition-all duration-300 ${streakMet ? 'bg-terminal-green' : 'bg-achievement-gold'}`}
                style={{ width: `${(streakProgress / streakMinimum) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Readings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-pixel text-terminal-green">
            {isCyclingPlan ? 'CONTINUE READING' : "TODAY'S MISSION"}
          </h2>
          <p className="text-terminal-gray-400 text-sm mt-1">
            {isCyclingPlan
              ? 'Mark chapters as you read. Each list progresses independently.'
              : 'Complete all readings to conquer this day'}
          </p>
        </CardHeader>

        <CardContent className="space-y-2">
          {todaysReading.length > 0 ? (
            todaysReading.map((section) => (
              <ReadingSection
                key={section.id}
                id={section.id}
                label={section.label}
                passage={section.passage}
                isCompleted={section.isCompleted}
                onToggle={() => handleToggleSection(section)}
                onContinue={() => handleContinue(section)}
                showContinue={true}
                continueLabel={isCyclingPlan ? "Continue to next chapter" : "Continue to next day"}
                disabled={isMutating}
              />
            ))
          ) : (
            <div className="text-center py-8 text-terminal-gray-400">
              <p>No readings configured for this plan</p>
            </div>
          )}
        </CardContent>

        {isCyclingPlan && chaptersReadToday > 0 && (
          <CardFooter>
            <div className="w-full text-center">
              {streakMet ? (
                <div className="text-terminal-green">
                  <div className="flex justify-center mb-1">
                    <Swords className="w-6 h-6" />
                  </div>
                  <p className="font-pixel text-sm">DAILY GOAL ACHIEVED!</p>
                  <p className="text-terminal-gray-400 text-sm mt-1">
                    Keep reading or come back tomorrow
                  </p>
                </div>
              ) : (
                <p className="text-terminal-gray-400 text-sm">
                  {streakMinimum - chaptersReadToday} more chapter{streakMinimum - chaptersReadToday !== 1 ? 's' : ''} to reach your daily goal
                </p>
              )}
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Campaign Stats */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-pixel text-terminal-green">
            CAMPAIGN STATS
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-terminal-dark border border-terminal-gray-600">
              <div className="text-2xl font-pixel text-terminal-green">
                {overallProgress}%
              </div>
              <div className="text-xs text-terminal-gray-400">Overall Progress</div>
            </div>
            <div className="text-center p-3 bg-terminal-dark border border-terminal-gray-600">
              <div className="text-2xl font-pixel text-terminal-green">
                {chaptersReadToday}
              </div>
              <div className="text-xs text-terminal-gray-400">Chapters Today</div>
            </div>
            {isCyclingPlan ? (
              <>
                <div className="text-center p-3 bg-terminal-dark border border-terminal-gray-600">
                  <div className="text-2xl font-pixel text-terminal-green">
                    {todaysReading.filter(s => s.isCompleted).length}
                  </div>
                  <div className="text-xs text-terminal-gray-400">Lists Done</div>
                </div>
                <div className="text-center p-3 bg-terminal-dark border border-terminal-gray-600">
                  <div className="text-2xl font-pixel text-terminal-green">
                    {todaysReading.length - todaysReading.filter(s => s.isCompleted).length}
                  </div>
                  <div className="text-xs text-terminal-gray-400">Remaining</div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center p-3 bg-terminal-dark border border-terminal-gray-600">
                  <div className="text-2xl font-pixel text-terminal-green">
                    {userPlan.current_day}
                  </div>
                  <div className="text-xs text-terminal-gray-400">Plan's Current Day</div>
                </div>
                <div className="text-center p-3 bg-terminal-dark border border-terminal-gray-600">
                  <div className="flex items-center justify-center gap-1">
                    <div className="text-2xl font-pixel text-terminal-green">
                      {daysOnPlan}
                    </div>
                    {daysAheadBehind !== 0 && (
                      <div className={`text-xs font-mono ${daysAheadBehind > 0 ? 'text-achievement-gold' : 'text-alert-red'}`}>
                        {daysAheadBehind > 0 ? `+${daysAheadBehind}` : daysAheadBehind}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-terminal-gray-400">Days on Plan</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reading Tips for Cycling Plans */}
      {isCyclingPlan && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-pixel text-terminal-green">
              HOW IT WORKS
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-terminal-gray-300">
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-terminal-green flex-shrink-0 mt-0.5" />
              <p>Each list tracks your position independently. Read as many chapters as you want from any list.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-terminal-green flex-shrink-0 mt-0.5" />
              <p>When you finish a list, it cycles back to the beginning. Lists repeat at different rates.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-terminal-green flex-shrink-0 mt-0.5" />
              <p>Your daily goal is {streakMinimum} chapters (configurable in your profile) to maintain your streak.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link to={`/plans/${plan.id}`} className="flex-1">
          <Button variant="ghost" className="w-full">
            View Plan Details
          </Button>
        </Link>
        <Link to="/" className="flex-1">
          <Button variant="ghost" className="w-full">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
