import { useState } from 'react'
import { Copy, Check, Link, RefreshCw } from 'lucide-react'
import { Modal, Button } from '../ui'
import { getInviteLink, useRegenerateInviteCode } from '../../hooks/useGuilds'

interface InviteShareModalProps {
  isOpen: boolean
  onClose: () => void
  guildId: string
  guildName: string
  inviteCode: string
  isAdmin: boolean
}

export function InviteShareModal({
  isOpen,
  onClose,
  guildId,
  guildName,
  inviteCode,
  isAdmin,
}: InviteShareModalProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const regenerateCode = useRegenerateInviteCode()

  const inviteLink = getInviteLink(inviteCode)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      // Fallback for older browsers
      alert(`Invite code: ${inviteCode}`)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      // Fallback for older browsers
      alert(`Invite link: ${inviteLink}`)
    }
  }

  const handleRegenerate = async () => {
    if (!confirm('Generate a new invite code? The old code will stop working.')) return
    try {
      await regenerateCode.mutateAsync(guildId)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to regenerate code')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="INVITE MEMBERS" size="md">
      <div className="space-y-6">
        <p className="font-pixel text-[0.625rem] text-ink-muted text-center">
          Share this code or link to invite others to {guildName}
        </p>

        {/* Invite Code */}
        <div className="bg-parchment-light border-2 border-border-subtle p-4">
          <label className="block mb-2 text-[0.5rem] font-pixel text-ink-muted uppercase tracking-wide text-center">
            Invite Code
          </label>
          <div className="flex items-center justify-center gap-3">
            <span className="font-pixel text-xl tracking-[0.5em] text-ink">
              {inviteCode}
            </span>
            <button
              onClick={copyCode}
              className="p-2 hover:bg-parchment rounded transition-colors"
              title="Copy code"
            >
              {copiedCode ? (
                <Check className="w-5 h-5 text-sage" />
              ) : (
                <Copy className="w-5 h-5 text-ink-muted" />
              )}
            </button>
          </div>
        </div>

        {/* Invite Link */}
        <div className="bg-parchment-light border-2 border-border-subtle p-4">
          <label className="block mb-2 text-[0.5rem] font-pixel text-ink-muted uppercase tracking-wide text-center">
            Or Share Link
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-parchment border border-border-subtle px-3 py-2 min-w-0">
              <Link className="w-4 h-4 text-ink-muted flex-shrink-0" />
              <span className="font-pixel text-[0.5rem] text-ink truncate">
                {inviteLink}
              </span>
            </div>
            <button
              onClick={copyLink}
              className="p-2 hover:bg-parchment rounded transition-colors flex-shrink-0"
              title="Copy link"
            >
              {copiedLink ? (
                <Check className="w-5 h-5 text-sage" />
              ) : (
                <Copy className="w-5 h-5 text-ink-muted" />
              )}
            </button>
          </div>
        </div>

        {/* Regenerate (Admin Only) */}
        {isAdmin && (
          <div className="text-center">
            <button
              onClick={handleRegenerate}
              disabled={regenerateCode.isPending}
              className="inline-flex items-center gap-2 text-ink-muted hover:text-ink font-pixel text-[0.5rem] disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${regenerateCode.isPending ? 'animate-spin' : ''}`} />
              REGENERATE CODE
            </button>
          </div>
        )}

        {/* Close */}
        <Button variant="secondary" onClick={onClose} className="w-full">
          DONE
        </Button>
      </div>
    </Modal>
  )
}
