import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { AuthForm, type AuthFormData } from '../components/auth'
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui'

export function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (data: AuthFormData) => {
    if (!data.password) return

    setIsLoading(true)
    setError(null)

    const { error } = await updatePassword(data.password)

    if (error) {
      // Provide helpful error messages
      let errorMessage = error.message

      if (error.message.includes('Auth session missing') || error.message.includes('session')) {
        errorMessage = 'Your password reset link has expired or is invalid. Please request a new password reset link from the login page.'
      } else if (error.message.includes('same password')) {
        errorMessage = 'New password must be different from your current password.'
      }

      setError(errorMessage)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-terminal-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <h1 className="text-xl font-pixel text-terminal-green text-center">
                PASSWORD RESET
              </h1>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-terminal-green" />
              </div>
              <p className="text-terminal-gray-200">
                Your password has been reset successfully!
              </p>
              <p className="text-terminal-gray-400 text-sm">
                Redirecting to login...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-terminal-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ASCII Art Logo */}
        <pre className="text-terminal-green text-xs mb-6 text-center font-mono overflow-hidden">
{`
 ╔══════════════════════════════════╗
 ║   BIBLICAL BATTLE PLANS          ║
 ║   ━━━━━━━━━━━━━━━━━━━━           ║
 ║   "The sword of the Spirit"      ║
 ╚══════════════════════════════════╝
`}
        </pre>

        <Card>
          <CardHeader>
            <h1 className="text-xl font-pixel text-terminal-green text-center">
              SET NEW PASSWORD
            </h1>
            <p className="text-terminal-gray-400 text-sm text-center mt-2">
              Enter your new password below
            </p>
          </CardHeader>

          <CardContent>
            <AuthForm
              mode="reset-password"
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          </CardContent>

          <CardFooter className="text-center text-sm">
            <Link
              to="/login"
              className="text-terminal-gray-400 hover:text-terminal-green transition-colors"
            >
              {'< Back to Login'}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
