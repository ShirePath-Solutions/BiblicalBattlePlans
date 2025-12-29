import { useState, useEffect } from 'react'

export type Platform = 'ios' | 'android' | 'desktop'

/**
 * Detects the user's platform (iOS, Android, or Desktop)
 * Useful for showing platform-specific installation instructions
 */
export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>('desktop')

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || ''

    // iOS detection - includes iPhone, iPad, iPod
    // Also check for iPad on iOS 13+ which reports as Mac
    const isIOS =
      /iPad|iPhone|iPod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    // Android detection
    const isAndroid = /android/i.test(userAgent)

    if (isIOS) {
      setPlatform('ios')
    } else if (isAndroid) {
      setPlatform('android')
    } else {
      setPlatform('desktop')
    }
  }, [])

  return platform
}
