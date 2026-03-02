import { Swords } from 'lucide-react'
import { MAINTENANCE_MODE } from '../lib/maintenance'

export function MaintenanceOverlay() {
  if (MAINTENANCE_MODE !== 'active') return null

  return (
    <div className="fixed inset-0 z-[100] bg-parchment-dark flex items-center justify-center p-4">
      <div className="bg-parchment border-2 border-border-subtle shadow-[0_8px_24px_var(--shadow-color-strong)] max-w-md w-full p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 flex items-center justify-center">
            <img src="/BiblicalBattlePlansLogo.png" alt="Biblical Battle Plans" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-danger/20 border-2 border-danger flex items-center justify-center">
            <Swords className="w-6 h-6 text-danger" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-pixel text-[0.75rem] text-ink mb-4">
          MAINTENANCE IN PROGRESS
        </h1>

        {/* Message */}
        <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed mb-6">
          The kingdom&apos;s archives are being fortified. We are performing a critical database migration to improve your quest experience.
        </p>

        <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed mb-6">
          The app will return shortly. Your quest progress is safe.
        </p>

        {/* Scripture */}
        <div className="bg-parchment-light border border-border-subtle p-4">
          <p className="font-pixel text-[0.625rem] text-ink leading-relaxed italic">
            &ldquo;Be still, and know that I am God.&rdquo;
          </p>
          <p className="font-pixel text-[0.5rem] text-ink-muted mt-2">
            — Psalm 46:10
          </p>
        </div>
      </div>
    </div>
  )
}
