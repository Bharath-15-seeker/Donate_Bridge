import React from 'react'
import { Menu, LogOut, User as UserIcon, Shield, HeartHandshake } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { NotificationCenter } from './NotificationCenter'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  onToggleSidebar: () => void
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout, getRoleDashboardPath } = useAuth()

  const roleColors: Record<string, 'brand' | 'sage' | 'default' | 'warning'> = {
    DONOR: 'brand',
    NGO: 'brand',
    VOLUNTEER: 'sage',
    ADMIN: 'warning',
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#cfded8] px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#23332f] hover:bg-[#eaf2ef] lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#912f56]"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          to={getRoleDashboardPath()}
          className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight text-[#23332f] group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#912f56] text-white flex items-center justify-center shadow-sm group-hover:bg-[#782445] transition-colors">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <span className="hidden sm:inline font-bold">
            Donate<span className="text-[#912f56]">Bridge</span>
          </span>
        </Link>
      </div>

      {/* Right: Role indicator, Notifications, Profile & Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {user?.role && (
          <Badge
            variant={roleColors[user.role] || 'brand'}
            size="sm"
            className="hidden md:inline-flex"
          >
            {user.role} PORTAL
          </Badge>
        )}

        {/* Notifications Dropdown */}
        <NotificationCenter />

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-[#cfded8]">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#23332f] leading-tight truncate max-w-[140px]">
              {user?.name || 'User'}
            </p>
            <p className="text-[11px] text-[#66736f] truncate max-w-[140px]">
              {user?.email}
            </p>
          </div>

          <div className="w-8 h-8 rounded-full bg-[#f6e8ee] text-[#912f56] font-bold text-xs flex items-center justify-center border border-[#eed1dd]">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="p-2 rounded-xl text-[#66736f] hover:text-red-700 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Log out of account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
