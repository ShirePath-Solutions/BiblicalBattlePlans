import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Users, ChevronLeft, CheckCircle } from 'lucide-react'
import { Card, CardContent, Button, LoadingSpinner } from '../components/ui'
import { useGuildByInviteCode, useJoinGuild, useMyGuilds } from '../hooks/useGuilds'
import { useAuth } from '../hooks/useAuth'

export function GuildJoin() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()

  const { data: guild, isLoading: guildLoading, error } = useGuildByInviteCode(code || '')
  const { data: myGuilds } = useMyGuilds()
  const joinGuild = useJoinGuild()

  const [joined, setJoined] = useState(false)

  // Check if already a member
  const isAlreadyMember = myGuilds?.some((m) => m.guild.invite_code === code?.toUpperCase())

  // If already a member, redirect to guild page
  useEffect(() => {
    if (isAlreadyMember && guild) {
      navigate(`/guild/${guild.id}`, { replace: true })
    }
  }, [isAlreadyMember, guild, navigate])

  const handleJoin = async () => {
    if (!code) return

    try {
      const result = await joinGuild.mutateAsync(code)
      setJoined(true)
      // Wait a moment then navigate
      setTimeout(() => {
        navigate(`/guild/${result.guildId}`)
      }, 1500)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to join guild')
    }
  }

  const isLoading = authLoading || guildLoading

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="flex justify-center mb-4">
            <Users className="w-12 h-12 text-ink-muted" />
          </div>
          <h1 className="font-pixel text-[0.875rem] text-ink mb-2">
            JOIN GUILD
          </h1>
          <p className="font-pixel text-[0.625rem] text-ink-muted mb-6">
            You need to be logged in to join a guild
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login">
              <Button variant="primary">LOG IN</Button>
            </Link>
            <Link to="/signup">
              <Button variant="secondary">SIGN UP</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Guild not found or invalid code
  if (error || !guild) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="font-pixel text-[0.625rem] text-danger mb-4">
            {error?.message || 'Invalid invite code'}
          </p>
          <p className="font-pixel text-[0.5rem] text-ink-muted mb-6">
            The invite code "{code}" is not valid or the guild no longer exists.
          </p>
          <Link
            to="/guild"
            className="inline-flex items-center gap-2 font-pixel text-[0.625rem] text-sage hover:text-sage-dark"
          >
            <ChevronLeft className="w-4 h-4" />
            BACK TO GUILDS
          </Link>
        </CardContent>
      </Card>
    )
  }

  // Successfully joined
  if (joined) {
    return (
      <Card variant="elevated">
        <CardContent className="text-center py-12">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-sage" />
          </div>
          <h1 className="font-pixel text-[0.875rem] text-ink mb-2">
            WELCOME TO THE GUILD!
          </h1>
          <p className="font-pixel text-[0.625rem] text-ink-muted">
            Redirecting to {guild.name}...
          </p>
        </CardContent>
      </Card>
    )
  }

  // Join preview
  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/guild"
        className="inline-flex items-center gap-2 font-pixel text-[0.625rem] text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="w-4 h-4" />
        BACK
      </Link>

      <Card variant="elevated">
        <CardContent className="text-center py-8">
          <div className="flex justify-center mb-4">
            <Users className="w-12 h-12 text-sage" />
          </div>

          <h1 className="font-pixel text-[0.875rem] text-ink mb-2">
            YOU'VE BEEN INVITED!
          </h1>

          <p className="font-pixel text-[0.625rem] text-ink-muted mb-6">
            Join this reading guild
          </p>

          {/* Guild Info */}
          <div className="bg-parchment-light border-2 border-border-subtle p-6 mb-6 text-left">
            <h2 className="font-pixel text-[0.875rem] text-ink mb-2">
              {guild.name.toUpperCase()}
            </h2>

            {guild.description && (
              <p className="font-pixel text-[0.625rem] text-ink-muted mb-4">
                {guild.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-ink-muted">
              <Users className="w-4 h-4" />
              <span className="font-pixel text-[0.625rem]">
                {guild.member_count} {guild.member_count === 1 ? 'member' : 'members'}
              </span>
            </div>
          </div>

          {/* Join Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleJoin}
            isLoading={joinGuild.isPending}
            className="w-full sm:w-auto"
          >
            JOIN GUILD
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
