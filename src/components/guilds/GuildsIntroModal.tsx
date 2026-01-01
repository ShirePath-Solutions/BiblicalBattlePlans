import { Modal } from '../ui'
import { Button } from '../ui/Button'
import { Users, Shield, BookOpen, Trophy } from 'lucide-react'

interface GuildsIntroModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GuildsIntroModal({ isOpen, onClose }: GuildsIntroModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="WELCOME TO GUILDS!" size="lg">
      <div className="space-y-4">
        {/* Intro Message */}
        <div className="flex items-start gap-3 p-3 bg-sage/10 border border-sage/30">
          <Users className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-pixel text-sm text-sage mb-1">
              JOIN FORCES WITH FELLOW WARRIORS
            </h3>
            <p className="font-pixel text-xs text-ink-muted leading-relaxed">
              Guilds are groups of readers who journey through Scripture together.
              Create one for your church, small group, family, or friends.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h3 className="font-pixel text-sm text-ink flex items-center gap-2">
            <Shield className="w-4 h-4" />
            GUILD FEATURES
          </h3>
          <div className="space-y-2 pl-6">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-sage text-white font-pixel text-xs">
                1
              </span>
              <p className="font-pixel text-xs text-ink-muted pt-0.5">
                <span className="text-ink">Leaderboards</span> - See who&apos;s leading in streaks and chapters read
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-sage text-white font-pixel text-xs">
                2
              </span>
              <p className="font-pixel text-xs text-ink-muted pt-0.5">
                <span className="text-ink">Activity Feed</span> - Celebrate each other&apos;s reading milestones
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-sage text-white font-pixel text-xs">
                3
              </span>
              <p className="font-pixel text-xs text-ink-muted pt-0.5">
                <span className="text-ink">Recommended Quests</span> - Admins can suggest a reading plan for the group
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="flex items-start gap-3 p-3 bg-gold/10 border border-gold/30">
          <Trophy className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-pixel text-sm text-gold mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              GET STARTED
            </h3>
            <p className="font-pixel text-xs text-ink-muted leading-relaxed">
              Create a new guild and share the invite code with others, or join an
              existing guild using a code from your group leader.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={onClose}
            className="w-full"
          >
            LET&apos;S GO
          </Button>
        </div>
      </div>
    </Modal>
  )
}
