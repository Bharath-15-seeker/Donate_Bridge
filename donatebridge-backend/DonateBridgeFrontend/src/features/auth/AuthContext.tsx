import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { AuthResponse, LoginRequest, RegisterRequest, Role, UserResponse } from '@/types'
import { authApi } from '@/api/auth.api'

interface AuthContextType {
  user: UserResponse | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<AuthResponse>
  register: (data: RegisterRequest) => Promise<AuthResponse>
  logout: () => void
  refreshUser: () => Promise<void>
  getRoleDashboardPath: (role?: Role) => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(() => {
    const saved = localStorage.getItem('donatebridge_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  })

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('donatebridge_token')
  })

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const getRoleDashboardPath = useCallback((role?: Role): string => {
    const userRole = role || user?.role
    switch (userRole) {
      case 'DONOR':
        return '/donor/dashboard'
      case 'NGO':
        return '/ngo/dashboard'
      case 'VOLUNTEER':
        return '/volunteer/dashboard'
      case 'ADMIN':
        return '/admin/dashboard'
      default:
        return '/login'
    }
  }, [user?.role])

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authApi.getCurrentUser()
      setUser(currentUser)
      localStorage.setItem('donatebridge_user', JSON.stringify(currentUser))
    } catch (err) {
      console.warn('Failed to refresh user profile:', err)
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('donatebridge_token')
      if (storedToken) {
        try {
          const currentUser = await authApi.getCurrentUser()
          setUser(currentUser)
          localStorage.setItem('donatebridge_user', JSON.stringify(currentUser))
        } catch {
          // Token is invalid or expired
          localStorage.removeItem('donatebridge_token')
          localStorage.removeItem('donatebridge_user')
          setUser(null)
          setToken(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    setIsLoading(true)
    try {
      const res = await authApi.login(credentials)
      setToken(res.accessToken)
      localStorage.setItem('donatebridge_token', res.accessToken)

      // Fetch fresh UserResponse from /api/users/me
      try {
        const currentUser = await authApi.getCurrentUser()
        setUser(currentUser)
        localStorage.setItem('donatebridge_user', JSON.stringify(currentUser))
      } catch {
        // Fallback to basic user data from AuthResponse
        const fallbackUser: UserResponse = {
          id: res.userId,
          name: res.name,
          email: res.email,
          role: res.role,
          accountStatus: 'ACTIVE',
        }
        setUser(fallbackUser)
        localStorage.setItem('donatebridge_user', JSON.stringify(fallbackUser))
      }

      return res
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    setIsLoading(true)
    try {
      const res = await authApi.register(data)
      setToken(res.accessToken)
      localStorage.setItem('donatebridge_token', res.accessToken)

      // Fetch fresh user
      try {
        const currentUser = await authApi.getCurrentUser()
        setUser(currentUser)
        localStorage.setItem('donatebridge_user', JSON.stringify(currentUser))
      } catch {
        const fallbackUser: UserResponse = {
          id: res.userId,
          name: res.name,
          email: res.email,
          role: res.role,
          accountStatus: 'ACTIVE',
        }
        setUser(fallbackUser)
        localStorage.setItem('donatebridge_user', JSON.stringify(fallbackUser))
      }

      return res
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('donatebridge_token')
    localStorage.removeItem('donatebridge_user')
    setUser(null)
    setToken(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshUser,
        getRoleDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
