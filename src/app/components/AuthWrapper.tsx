'use client';

import { usePathname } from 'next/navigation';
import ProtectedRoute from './ProtectedRoute';
import Navbar from './navbar';
import { useAuth } from '../../hooks/useAuth';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';
  const { isAuthenticated } = useAuth(false);

  if (isLogin) {
    return (
      <>
        {isAuthenticated && <Navbar />}
        {/* <main className='pt-20 bg-gray-100'> */}
        {/* </main> */}
        {children}
      </>
    );
  }

  return (
    <ProtectedRoute>
      {isAuthenticated && <Navbar />}
      <main className='pt-20 bg-gray-100'>
        {children}
      </main>
    </ProtectedRoute>
  );
} 