import { Link } from 'react-router-dom'
import { Users, Crown, ChevronRight } from 'lucide-react'
import { Card, CardContent, Badge } from '../ui'
import type { Guild, GuildRole } from '../../types'

interface GuildCardProps {
  guild: Guild
  role: GuildRole
}

export function GuildCard({ guild, role }: GuildCardProps) {
  return (
    <Link to={`/guild/${guild.id}`}>
      <Card className="hover:border-sage transition-colors cursor-pointer">
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Guild Name + Role */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-pixel text-[0.75rem] text-ink truncate">
                  {guild.name.toUpperCase()}
                </h3>
                {role === 'admin' && (
                  <Crown className="w-4 h-4 text-gold flex-shrink-0" />
                )}
              </div>

              {/* Description */}
              {guild.description && (
                <p className="font-pixel text-[0.5rem] text-ink-muted mb-3 line-clamp-2">
                  {guild.description}
                </p>
              )}

              {/* Stats Row */}
              <div className="flex items-center gap-4">
                {/* Member Count */}
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <Users className="w-4 h-4" />
                  <span className="font-pixel text-[0.625rem]">
                    {guild.member_count}
                  </span>
                </div>

                {/* Role Badge */}
                <Badge variant={role === 'admin' ? 'gold' : 'default'}>
                  {role.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-ink-muted flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
