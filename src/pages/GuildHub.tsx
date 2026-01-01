import { useState } from 'react'
import { Users, Plus, UserPlus } from 'lucide-react'
import { Card, CardContent, Button, LoadingSpinner } from '../components/ui'
import { GuildCard, CreateGuildModal, JoinGuildModal } from '../components/guilds'
import { useMyGuilds } from '../hooks/useGuilds'

export function GuildHub() {
  const { data: memberships, isLoading, error } = useMyGuilds()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="font-pixel text-[0.625rem] text-danger">
            ERROR: Failed to load guilds
          </p>
          <p className="font-pixel text-[0.5rem] text-ink-muted mt-2">
            {error.message}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="elevated">
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-pixel text-base text-ink mb-2">
                YOUR GUILDS
              </h1>
              <p className="font-pixel text-[0.625rem] text-ink-muted">
                Join forces with other readers
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                leftIcon={<UserPlus className="w-4 h-4" />}
                onClick={() => setShowJoinModal(true)}
              >
                JOIN
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateModal(true)}
              >
                CREATE
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guild List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : memberships && memberships.length > 0 ? (
        <div className="space-y-4">
          {memberships.map((membership) => (
            <GuildCard
              key={membership.id}
              guild={membership.guild}
              role={membership.role}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="flex justify-center mb-4">
              <Users className="w-12 h-12 text-ink-muted" />
            </div>
            <h2 className="font-pixel text-[0.75rem] text-ink mb-2">
              NO GUILDS YET
            </h2>
            <p className="font-pixel text-[0.625rem] text-ink-muted mb-6 max-w-sm mx-auto">
              Guilds are groups of readers who hold each other accountable.
              Create one for your church, friend group, or family.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="secondary"
                leftIcon={<UserPlus className="w-4 h-4" />}
                onClick={() => setShowJoinModal(true)}
              >
                JOIN A GUILD
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateModal(true)}
              >
                CREATE A GUILD
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Soft limit hint */}
      {memberships && memberships.length >= 5 && (
        <p className="font-pixel text-[0.5rem] text-ink-muted text-center">
          You're in {memberships.length} guilds. Consider focusing on a few to stay engaged!
        </p>
      )}

      {/* Modals */}
      <CreateGuildModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <JoinGuildModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  )
}
