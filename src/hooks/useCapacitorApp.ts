import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { queryClient } from '../lib/queryClient'
import { captureError } from '../lib/errorLogger'

/**
 * Initializes Capacitor plugins and handles native app lifecycle events.
 * Should be called once at the app root level.
 */
export function useCapacitorApp() {
  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      return
    }

    // Initialize native plugins
    const initializeNative = async () => {
      try {
        // Configure status bar (iOS)
        if (Capacitor.getPlatform() === 'ios') {
          await StatusBar.setStyle({ style: Style.Dark })
        }

        // Hide splash screen after app is ready
        await SplashScreen.hide()
      } catch (error) {
        captureError(error, { component: 'useCapacitorApp', action: 'initializeNative' })
      }
    }

    initializeNative()

    // Handle app state changes (foreground/background)
    const appStateListener = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // App came to foreground - refresh stale data
        // Only invalidate queries that are actually stale to avoid unnecessary refetches
        queryClient.invalidateQueries({ stale: true })
      }
    })

    // Handle back button (primarily for Android, but good to set up)
    const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back()
      }
      // At root of app - iOS doesn't have back button anyway
    })

    // Cleanup listeners on unmount
    return () => {
      appStateListener.then((listener) => listener.remove())
      backButtonListener.then((listener) => listener.remove())
    }
  }, [])
}
