'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import api, { TOKEN_KEY, USER_KEY } from '@/lib/api'
import type { UserInfo } from '@/lib/types'

interface AuthContextValue {
  token: string | null
  user: UserInfo | null
  ready: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setToken(localStorage.getItem(TOKEN_KEY))
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem(USER_KEY)
      }
    }
    setReady(true)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.post('/login', { username, password })
    const data = response.data

    if (!data?.status || !data?.token) {
      const message =
        typeof data?.message === 'string'
          ? data.message
          : 'Invalid username or password'
      throw new Error(message)
    }

    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)

    if (data.user_info) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user_info))
      setUser(data.user_info)
    }
  }, [])

  const logout = useCallback(() => {
    api.post('/logout').catch(() => undefined)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
