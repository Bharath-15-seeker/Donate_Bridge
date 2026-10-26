import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { Role } from '@/types'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading, isAuthenticated, logout, getRoleDashboardPath } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#eaf2ef]">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#912f56] mb-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-[#23332f]">Loading DonateBridge...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Account status check
  if (user.accountStatus === 'SUSPENDED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf2ef] p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 shadow-modal text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-red-950 mb-2">Account Suspended</h2>
          <p className="text-sm text-[#66736f] mb-6">
            Your DonateBridge account has been suspended by an administrator. Please contact platform support for assistance or log out.
          </p>
          <Button variant="outline" onClick={logout} className="w-full">
            Sign Out
          </Button>
        </div>
      </div>
    )
  }

  // Role validation
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />
  }

  return <>{children}</>
}
