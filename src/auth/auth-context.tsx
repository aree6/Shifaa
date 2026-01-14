import { createContext, useContext, useMemo, useState } from 'react'
import type React from 'react'
import type { AppUser, UserRole } from '../lib/types'
import * as storage from '../lib/storage'

type AuthContextValue = {
  user: AppUser | null
  login: (role: UserRole, email: string, password: string) => void
  loginPatient: (nationalId: string, patientName?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => storage.getUser())

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      login: (role, email, _password) => {
        storage.seedIfNeeded()
        const next = storage.login(role, email)
        setUser(next)
      },
      loginPatient: (nationalId, patientName?: string) => {
        storage.seedIfNeeded()
        const next = storage.loginPatient(nationalId, patientName)
        setUser(next)
      },
      logout: () => {
        storage.logout()
        setUser(null)
      },
    }
  }, [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
