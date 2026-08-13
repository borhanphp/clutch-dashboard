'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'

export default function AppHeader() {
  const { user, logout } = useAuth()
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'Account'

  return (
    <header className="sticky top-0 z-10 bg-[#0075FF] text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm font-bold">
            C
          </span>
          <span className="text-sm font-semibold tracking-wide">
            Clutch Logistics
            <span className="ml-2 hidden font-normal text-white/70 sm:inline">
              Organization Operations Dashboard
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-white/80 sm:inline">{name}</span>
          <button
            onClick={logout}
            className="rounded-lg border border-white/40 px-3 py-1.5 text-sm text-white transition hover:bg-[#0056CC]"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
