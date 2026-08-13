'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { token, ready } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (ready && !token) {
      router.replace('/login')
    }
  }, [ready, token, router])

  if (!ready || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      </div>
    )
  }

  return <>{children}</>
}
