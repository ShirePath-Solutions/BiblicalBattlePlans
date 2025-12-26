import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { Card, CardHeader, CardContent, Badge, Button } from '../ui'
import { useUserPlans, calculatePlanProgress } from '../../hooks/usePlans'
import { LoadingSpinner } from '../ui'

export function CampaignHistory() {
  const { data: userPlans, isLoading } = useUserPlans()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  const activePlans = userPlans?.filter((up) => !up.is_completed) || []
  const completedPlans = userPlans?.filter((up) => up.is_completed) || []

  return (
    <div className="space-y-6">
      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-pixel text-terminal-green">
              ACTIVE CAMPAIGNS
            </h3>
            <Badge variant="success">{activePlans.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {activePlans.length > 0 ? (
            <div className="space-y-3">
              {activePlans.map((userPlan) => {
                const progress = calculatePlanProgress(userPlan, userPlan.plan)
                return (
                  <Link
                    key={userPlan.id}
                    to={`/campaign/${userPlan.id}`}
                    className="block p-3 border-2 border-terminal-gray-500 hover:border-terminal-green transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-terminal-green font-medium">
                          {userPlan.plan.name}
                        </div>
                        <div className="text-terminal-gray-400 text-sm">
                          Day {userPlan.current_day} • Started{' '}
                          {new Date(userPlan.start_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-terminal-gray-300">{progress}%</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-terminal-gray-400">
              <p>No active campaigns</p>
              <Link to="/plans">
                <Button variant="secondary" className="mt-3">
                  Start a Campaign
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-pixel text-terminal-green">
              COMPLETED CAMPAIGNS
            </h3>
            <Badge variant="gold">{completedPlans.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {completedPlans.length > 0 ? (
            <div className="space-y-3">
              {completedPlans.map((userPlan) => (
                <div
                  key={userPlan.id}
                  className="p-3 border-2 border-achievement-gold/30 bg-achievement-gold/5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-achievement-gold font-medium">
                        {userPlan.plan.name}
                      </div>
                      <div className="text-terminal-gray-400 text-sm">
                        Completed{' '}
                        {userPlan.completed_at
                          ? new Date(userPlan.completed_at).toLocaleDateString()
                          : 'Unknown'}
                      </div>
                    </div>
                    <Trophy className="w-5 h-5 text-achievement-gold" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-terminal-gray-400">
              <p>No completed campaigns yet</p>
              <p className="text-sm mt-1">Keep reading to complete your first!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
