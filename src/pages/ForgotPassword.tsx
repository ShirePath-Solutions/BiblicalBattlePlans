import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { AuthForm, type AuthFormData } from '../components/auth'
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui'

export function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (data: AuthFormData) => {
    setIsLoading(true)
    setError(null)

    const { error } = await resetPassword(data.email)

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-terminal-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <h1 className="text-xl font-pixel text-terminal-green text-center">
                RESET LINK SENT
              </h1>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <Mail className="w-16 h-16 text-terminal-green" />
              </div>
              <p className="text-terminal-gray-200">
                Check your email for password reset instructions.
              </p>
              <p className="text-terminal-gray-400 text-sm">
                The link will expire in 1 hour.
              </p>
            </CardContent>

            <CardFooter className="text-center">
              <Link
                to="/login"
                className="text-terminal-green hover:underline"
              >
                {'> Return to Login'}
              </Link>
            </CardFooter>
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
              RECOVER ACCESS
            </h1>
            <p className="text-terminal-gray-400 text-sm text-center mt-2">
              Enter your email to receive reset instructions
            </p>
          </CardHeader>

          <CardContent>
            <AuthForm
              mode="forgot-password"
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
