import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return

    if (requireAuth && !session) {
      router.push('/login')
    } else if (!requireAuth && session && pathname === '/login') {
      // Solo redirigir a / si está específicamente en la página de login
      router.push('/')
    }
  }, [session, status, router, requireAuth, pathname])

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: !!session
  }
} 