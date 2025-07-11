'use client'

import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth(true)

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2A3182]"></div>
      </div>
    )
  }

  // Si no hay sesión, no mostrar nada (el hook redirigirá)
  if (!isAuthenticated) {
    return null
  }

  // Si hay sesión, mostrar el contenido
  return <>{children}</>
} 