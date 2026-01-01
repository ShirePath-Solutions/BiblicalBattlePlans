import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Input, Button } from '../ui'
import { useJoinGuild } from '../../hooks/useGuilds'

interface JoinGuildModalProps {
  isOpen: boolean
  onClose: () => void
  initialCode?: string
}

export function JoinGuildModal({ isOpen, onClose, initialCode = '' }: JoinGuildModalProps) {
  const navigate = useNavigate()
  const joinGuild = useJoinGuild()

  const [code, setCode] = useState(initialCode)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanCode = code.trim().toUpperCase()

    if (!cleanCode) {
      setError('Please enter an invite code')
      return
    }

    if (cleanCode.length < 6) {
      setError('Invite code must be 6 characters')
      return
    }

    try {
      const result = await joinGuild.mutateAsync(cleanCode)

      // Reset and navigate to the guild
      setCode('')
      onClose()
      navigate(`/guild/${result.guildId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join guild')
    }
  }

  const handleClose = () => {
    setCode('')
    setError('')
    onClose()
  }

  // Format code as user types (uppercase, max 6 chars)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    setCode(value)
    setError('')
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="JOIN GUILD" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Invite Code"
            value={code}
            onChange={handleCodeChange}
            placeholder="FAITH1"
            maxLength={6}
            autoFocus
            className="text-center tracking-widest text-lg"
          />
          <p className="mt-2 font-pixel text-[0.5rem] text-ink-muted text-center">
            Enter the 6-character code from your guild leader
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="font-pixel text-[0.625rem] text-danger text-center">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={joinGuild.isPending}
            disabled={code.length < 6}
            className="flex-1"
          >
            JOIN
          </Button>
        </div>
      </form>
    </Modal>
  )
}
