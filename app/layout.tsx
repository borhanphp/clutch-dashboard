import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/components/AuthProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clutch — Organization Operations Dashboard',
  description: 'Read-only operations summary across all organizations',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
