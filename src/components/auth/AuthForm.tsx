import { useState, type FormEvent } from 'react'
import { Input, Button } from '../ui'

interface AuthFormProps {
  mode: 'login' | 'signup' | 'forgot-password'
  onSubmit: (data: AuthFormData) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export interface AuthFormData {
  email: string
  password?: string
  username?: string
}

export function AuthForm({ mode, onSubmit, isLoading = false, error }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Validation
    if (!email) {
      setValidationError('Email is required')
      return
    }

    if (mode !== 'forgot-password' && !password) {
      setValidationError('Password is required')
      return
    }

    if (mode === 'signup') {
      if (!username) {
        setValidationError('Username is required')
        return
      }

      if (username.length < 3) {
        setValidationError('Username must be at least 3 characters')
        return
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setValidationError('Username can only contain letters, numbers, and underscores')
        return
      }

      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters')
        return
      }

      if (password !== confirmPassword) {
        setValidationError('Passwords do not match')
        return
      }
    }

    await onSubmit({
      email,
      password: mode !== 'forgot-password' ? password : undefined,
      username: mode === 'signup' ? username : undefined,
    })
  }

  const displayError = validationError || error

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'signup' && (
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="soldier_name"
          disabled={isLoading}
          autoComplete="username"
          hint="Letters, numbers, and underscores only"
        />
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="soldier@biblicalbattleplans.com"
        disabled={isLoading}
        autoComplete="email"
      />

      {mode !== 'forgot-password' && (
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
      )}

      {mode === 'signup' && (
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading}
          autoComplete="new-password"
        />
      )}

      {displayError && (
        <div className="p-3 bg-alert-red/10 border-2 border-alert-red text-alert-red text-sm">
          ! ERROR: {displayError}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        className="w-full"
      >
        {mode === 'login' && '[ LOGIN ]'}
        {mode === 'signup' && '[ ENLIST ]'}
        {mode === 'forgot-password' && '[ SEND RESET LINK ]'}
      </Button>
    </form>
  )
}
