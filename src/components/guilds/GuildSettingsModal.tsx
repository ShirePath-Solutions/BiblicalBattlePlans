import { useState, useEffect } from 'react'
import { Modal, Input, Button } from '../ui'
import { useUpdateGuild } from '../../hooks/useGuilds'
import type { Guild } from '../../types'

interface GuildSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  guild: Guild
}

export function GuildSettingsModal({ isOpen, onClose, guild }: GuildSettingsModalProps) {
  const updateGuild = useUpdateGuild()

  const [name, setName] = useState(guild.name)
  const [description, setDescription] = useState(guild.description || '')
  const [error, setError] = useState('')

  // Reset form when guild changes
  useEffect(() => {
    setName(guild.name)
    setDescription(guild.description || '')
    setError('')
  }, [guild, isOpen])

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
      await updateGuild.mutateAsync({
        guildId: guild.id,
        name: name.trim(),
        description: description.trim() || undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update guild')
    }
  }

  const handleClose = () => {
    setName(guild.name)
    setDescription(guild.description || '')
    setError('')
    onClose()
  }

  const hasChanges =
    name !== guild.name ||
    description !== (guild.description || '')

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="GUILD SETTINGS" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <Input
          label="Guild Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning Warriors"
          maxLength={50}
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
            isLoading={updateGuild.isPending}
            disabled={!hasChanges}
            className="flex-1"
          >
            SAVE
          </Button>
        </div>
      </form>
    </Modal>
  )
}
