import * as Sentry from '@sentry/react'
import { Component, type ReactNode } from 'react'
import { Button, Card, CardContent } from './ui'

interface FallbackProps {
  error: Error
  resetError: () => void
}

function ErrorFallback({ error, resetError }: FallbackProps) {
  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <Card variant="elevated" className="max-w-md w-full">
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-danger/20 border-2 border-danger flex items-center justify-center">
            <span className="font-pixel text-2xl text-danger">!</span>
          </div>
          <h1 className="font-pixel text-sm text-ink mb-3">
            SOMETHING WENT WRONG
          </h1>
          <p className="font-pixel text-[0.625rem] text-ink-muted mb-4 leading-relaxed">
            An unexpected error occurred. Our team has been notified.
          </p>
          {import.meta.env.DEV && (
            <p className="font-pixel text-[0.5rem] text-danger mb-4 p-2 bg-danger/10 border border-danger/20">
              {error.message}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Button variant="primary" onClick={resetError}>
              TRY AGAIN
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/'}
            >
              GO HOME
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

// Custom error boundary that integrates with Sentry
class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Capture error to Sentry with component stack
    Sentry.withScope((scope) => {
      scope.setExtra('componentStack', errorInfo.componentStack)
      Sentry.captureException(error)
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

// Export both the class and a Sentry-wrapped version
export const ErrorBoundary = ErrorBoundaryClass

// Sentry's error boundary with our custom fallback
export const SentryErrorBoundary = Sentry.withErrorBoundary(
  ({ children }: Props) => <>{children}</>,
  {
    fallback: ({ error, resetError }) => {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      return <ErrorFallback error={errorObj} resetError={resetError} />
    },
  }
)
