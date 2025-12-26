import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/auth'
import { Layout } from './components/Layout'
import { Login, Signup, ForgotPassword, Dashboard, Plans, PlanDetail, ActivePlan, Profile } from './pages'
import { LoadingOverlay } from './components/ui'

function App() {
  const { initialize, isInitialized, isLoading } = useAuth()

  useEffect(() => {
    initialize()
  }, [initialize])

  // Show loading while initializing auth
  if (!isInitialized || isLoading) {
    return <LoadingOverlay message="INITIALIZING..." />
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="plans" element={<Plans />} />
          <Route path="plans/:id" element={<PlanDetail />} />
          <Route path="campaign/:id" element={<ActivePlan />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
