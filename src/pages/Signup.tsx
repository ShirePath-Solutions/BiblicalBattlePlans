import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { AuthForm, GoogleAuthButton, type AuthFormData } from '../components/auth'
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui'

export function Signup() {
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (data: AuthFormData) => {
    setIsLoading(true)
    setError(null)

    const { error } = await signUp(data.email, data.password!, data.username!)

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
                ENLISTMENT RECEIVED
              </h1>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <Mail className="w-16 h-16 text-terminal-green" />
              </div>
              <p className="text-terminal-gray-200 font-medium">
                Check your email to confirm your account!
              </p>

              <div className="p-4 bg-achievement-gold/10 border-2 border-achievement-gold text-left space-y-2">
                <p className="text-achievement-gold font-pixel text-sm">
                  ! IMPORTANT
                </p>
                <p className="text-terminal-gray-200 text-sm">
                  You must click the confirmation link in your email before you can login.
                </p>
                <p className="text-terminal-gray-400 text-sm">
                  Check your spam folder if you don't see it within a few minutes.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 text-center">
              <Link
                to="/login"
                className="text-terminal-green hover:underline"
              >
                {'> I\'ve confirmed my email - Go to Login'}
              </Link>
              <p className="text-terminal-gray-500 text-xs">
                Didn't receive an email? Check spam or try signing up again.
              </p>
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
              ENLIST NOW
            </h1>
            <p className="text-terminal-gray-400 text-sm text-center mt-2">
              Join the ranks and begin your campaign
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <AuthForm
              mode="signup"
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-terminal-gray-500" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-terminal-darker text-terminal-gray-400">
                  OR
                </span>
              </div>
            </div>

            <GoogleAuthButton />
          </CardContent>

          <CardFooter className="text-center text-sm">
            <p className="text-terminal-gray-400">
              Already enlisted?{' '}
              <Link
                to="/login"
                className="text-terminal-green hover:underline"
              >
                Login here
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-terminal-gray-500 text-xs text-center mt-6">
          "Fight the good fight of faith" - 1 Timothy 6:12
        </p>
      </div>
    </div>
  )
}
