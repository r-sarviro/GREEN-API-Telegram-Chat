import { Navigate, Outlet } from 'react-router-dom'
import { useSessionStore } from '@/entities/session'

export function ProtectedRoute() {
  const credentials = useSessionStore((s) => s.credentials)

  if (!credentials) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
