import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldX, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export const UnauthorizedPage: React.FC = () => {
  const { getRoleDashboardPath, user } = useAuth()

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#cfded8] shadow-card text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <ShieldX className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#23332f]">Access Restricted</h2>
        <p className="text-sm text-[#66736f]">
          You don&apos;t have authorization to view this section of the platform with your current role{' '}
          <strong className="text-[#912f56]">({user?.role || 'Guest'})</strong>.
        </p>
        <div className="pt-4">
          <Link to={getRoleDashboardPath()}>
            <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to Your Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
