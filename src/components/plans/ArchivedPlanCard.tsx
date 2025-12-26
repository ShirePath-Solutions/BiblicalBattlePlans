import { Card, CardHeader, CardContent, CardFooter, Button, Badge } from '../ui'
import { useUnarchivePlan, calculatePlanProgress } from '../../hooks/usePlans'
import type { UserPlan, ReadingPlan } from '../../types'

interface ArchivedPlanCardProps {
  userPlan: UserPlan & { plan: ReadingPlan }
}

export function ArchivedPlanCard({ userPlan }: ArchivedPlanCardProps) {
  const unarchivePlan = useUnarchivePlan()
  const { plan } = userPlan
  const progress = calculatePlanProgress(userPlan, plan)

  const handleUnarchive = async () => {
    await unarchivePlan.mutateAsync(userPlan.id)
  }

  return (
    <Card className="h-full flex flex-col opacity-75 hover:opacity-100 transition-opacity">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-pixel text-terminal-gray-400 leading-tight">
            {plan.name}
          </h3>
          <Badge variant="default" size="sm">ARCHIVED</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-terminal-gray-500">
            <span>Status:</span>
            <span>{userPlan.is_completed ? 'Completed' : 'In Progress'}</span>
          </div>
          <div className="flex justify-between text-terminal-gray-500">
            <span>Progress:</span>
            <span>{progress}%</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleUnarchive}
          isLoading={unarchivePlan.isPending}
        >
          RESTORE CAMPAIGN
        </Button>
      </CardFooter>
    </Card>
  )
}
