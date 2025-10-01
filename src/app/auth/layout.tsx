'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Role } from '@prisma/client'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if session is loaded and user is authenticated
    if (status === 'loading') return // Still loading

    if (session?.user) {
      // User is authenticated, redirect to appropriate dashboard
      const userRole = session.user.role as Role

      switch (userRole) {
        case Role.STUDENT:
          router.push('/student/dashboard')
          break
        case Role.INSTRUCTOR:
          router.push('/teacher/dashboard')
          break
        case Role.ADMIN:
          router.push('/admin/dashboard')
          break
        default:
          // Fallback to student dashboard if role is unclear
          router.push('/student/dashboard')
          break
      }
    }
  }, [session, status, router])

  // Don't render auth pages if user is already authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (session?.user) {
    // User is authenticated, show loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  // User is not authenticated, show auth pages
  return <>{children}</>
}