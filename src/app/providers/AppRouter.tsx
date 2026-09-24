import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ChatPage } from '@/pages/chat'
import { LoginPage } from '@/pages/login'
import { useSessionStore } from '@/entities/session'
import { Spinner } from '@/shared/ui'
import { ProtectedRoute } from './ProtectedRoute'
import styles from './AppRouter.module.css'

export function AppRouter() {
  const hydrate = useSessionStore((s) => s.hydrate)
  const credentials = useSessionStore((s) => s.credentials)
  const hydrated = useSessionStore((s) => s.hydrated)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (!hydrated) {
    return (
      <div className={styles.boot}>
        <Spinner />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={credentials ? <Navigate to="/chat" replace /> : <LoginPage />}
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/chat" element={<ChatPage />} />
      </Route>
      <Route path="*" element={<Navigate to={credentials ? '/chat' : '/login'} replace />} />
    </Routes>
  )
}
