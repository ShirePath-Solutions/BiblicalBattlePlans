import * as Sentry from '@sentry/react'

type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info'

interface ErrorContext {
  // Where the error occurred
  component?: string
  action?: string
  // Additional context
  userId?: string
  planId?: string
  extra?: Record<string, unknown>
}

/**
 * Centralized error logging utility.
 * Captures errors to Sentry and logs to console in development.
 */
export function captureError(
  error: unknown,
  context?: ErrorContext,
  severity: ErrorSeverity = 'error'
) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorObj = error instanceof Error ? error : new Error(errorMessage)

  // Always log to console in development
  if (import.meta.env.DEV) {
    console.error(`[${severity.toUpperCase()}]`, errorMessage, context)
  }

  // Capture to Sentry
  Sentry.withScope((scope) => {
    scope.setLevel(severity)

    if (context?.component) {
      scope.setTag('component', context.component)
    }
    if (context?.action) {
      scope.setTag('action', context.action)
    }
    if (context?.userId) {
      scope.setTag('userId', context.userId)
    }
    if (context?.planId) {
      scope.setTag('planId', context.planId)
    }
    if (context?.extra) {
      scope.setExtras(context.extra)
    }

    Sentry.captureException(errorObj)
  })
}

/**
 * Log a message without an exception.
 * Useful for capturing important events or warnings.
 */
export function captureMessage(
  message: string,
  context?: ErrorContext,
  severity: ErrorSeverity = 'info'
) {
  if (import.meta.env.DEV) {
    console.log(`[${severity.toUpperCase()}]`, message, context)
  }

  Sentry.withScope((scope) => {
    scope.setLevel(severity)

    if (context?.component) {
      scope.setTag('component', context.component)
    }
    if (context?.action) {
      scope.setTag('action', context.action)
    }
    if (context?.extra) {
      scope.setExtras(context.extra)
    }

    Sentry.captureMessage(message)
  })
}

/**
 * Wrap an async function to automatically capture errors.
 * Useful for event handlers and callbacks.
 */
export function withErrorCapture<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      captureError(error, context)
      throw error
    }
  }) as T
}

/**
 * Create an error handler for TanStack Query mutations.
 */
export function createMutationErrorHandler(action: string) {
  return (error: Error) => {
    captureError(error, { action, component: 'mutation' })
  }
}

/**
 * Create an error handler for TanStack Query queries.
 */
export function createQueryErrorHandler(queryKey: string) {
  return (error: Error) => {
    captureError(error, { action: queryKey, component: 'query' })
  }
}
