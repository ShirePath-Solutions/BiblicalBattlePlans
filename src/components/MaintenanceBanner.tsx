import { Shield, Swords } from 'lucide-react'
import { MAINTENANCE_MODE } from '../lib/maintenance'

export function MaintenanceBanner() {
  if (MAINTENANCE_MODE === 'off') return null

  if (MAINTENANCE_MODE === 'active') {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="fixed top-0 left-0 right-0 z-[52] bg-gradient-to-r from-danger to-red-700 text-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            <Swords className="w-4 h-4 shrink-0" />
            <p className="font-pixel text-[0.625rem] text-center">
              We are performing a critical database migration. The app will return shortly. Your quest progress is safe.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // scheduled mode
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[52] bg-warning/20 border-b-2 border-warning shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          <Shield className="w-4 h-4 text-warning shrink-0" />
          <p className="font-pixel text-[0.625rem] text-ink text-center">
            The realm undergoes maintenance tomorrow (March 3) around 4:30 AM Central. Expect ~1 hour of downtime. Your progress is safe.
          </p>
        </div>
      </div>
    </div>
  )
}
