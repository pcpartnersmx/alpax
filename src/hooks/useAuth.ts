import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (requireAuth && !session) {
      router.push('/login')
    } else if (!requireAuth && session) {
      router.push('/')
    }
  }, [session, status, router, requireAuth])

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: !!session
  }
} 