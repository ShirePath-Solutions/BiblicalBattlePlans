import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Input, Button } from '../ui'
import { useCreateGuild } from '../../hooks/useGuilds'

interface CreateGuildModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateGuildModal({ isOpen, onClose }: CreateGuildModalProps) {
  const navigate = useNavigate()
  const createGuild = useCreateGuild()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Guild name is required')
      return
    }

    if (name.trim().length < 3) {
      setError('Guild name must be at least 3 characters')
      return
    }

    try {
      const guild = await createGuild.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      })

      // Reset form and navigate to the new guild
      setName('')
      setDescription('')
      onClose()
      navigate(`/guild/${guild.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create guild')
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="CREATE GUILD" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <Input
          label="Guild Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning Warriors"
          maxLength={50}
          autoFocus
        />

        {/* Description */}
        <div>
          <label className="block mb-1.5 text-[0.625rem] font-pixel text-ink-muted uppercase tracking-wide">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's your guild about?"
            maxLength={200}
            rows={3}
            className="w-full bg-parchment-light border-2 border-border-subtle text-ink placeholder:text-ink-faint font-pixel text-[0.75rem] px-3 py-2.5 focus:outline-none focus:border-sage resize-none"
          />
        </div>

        <p className="font-pixel text-[0.5rem] text-ink-muted">
          Guilds are invite-only. Share the invite code with others to let them join.
        </p>

        {/* Error */}
        {error && (
          <p className="font-pixel text-[0.625rem] text-danger">{error}</p>
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
            isLoading={createGuild.isPending}
            className="flex-1"
          >
            CREATE
          </Button>
        </div>
      </form>
    </Modal>
  )
}
