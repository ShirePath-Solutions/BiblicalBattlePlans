import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useStats } from '../hooks/useStats'
import { ProfileHeader, ProfileStats, CampaignHistory } from '../components/profile'
import { Card, CardHeader, CardContent, CardFooter, Button, Input, LoadingSpinner } from '../components/ui'

export function Profile() {
  const { profile, signOut, updateProfile } = useAuth()
  const { data: stats, isLoading: statsLoading } = useStats()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await updateProfile({ display_name: displayName })
    setIsSaving(false)
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  const userStats = stats || {
    total_chapters_read: 0,
    current_streak: 0,
    longest_streak: 0,
    plans_completed: 0,
    plans_active: 0,
    total_days_reading: 0,
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-pixel text-terminal-green">
        SOLDIER PROFILE
      </h1>

      {/* Profile Header */}
      <ProfileHeader currentStreak={userStats.current_streak} />

      {/* Edit Profile */}
      {isEditing ? (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-pixel text-terminal-green">
              EDIT PROFILE
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
            >
              SAVE CHANGES
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditing(false)
                setDisplayName(profile?.display_name || '')
              }}
            >
              CANCEL
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
          <Button variant="danger" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      )}

      {/* Stats */}
      <ProfileStats stats={userStats} />

      {/* Campaign History */}
      <CampaignHistory />
    </div>
  )
}
