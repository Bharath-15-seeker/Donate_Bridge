import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Gift,
  PlusCircle,
  FileText,
  Truck,
  Bell,
  User,
  Inbox,
  Users,
  CheckCircle,
  Clock,
  ShieldCheck,
  X,
  Building,
  HeartHandshake,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case 'DONOR':
        return [
          { to: '/donor/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { to: '/donor/donations', label: 'My Donations', icon: <Gift className="w-4 h-4" /> },
          { to: '/donor/donations/new', label: 'Create Donation', icon: <PlusCircle className="w-4 h-4" /> },
          { to: '/donor/requirements', label: 'NGO Requirements', icon: <FileText className="w-4 h-4" /> },
          { to: '/donor/requests', label: 'Donation Requests', icon: <Inbox className="w-4 h-4" /> },
          { to: '/donor/pickups', label: 'Pickup Tracking', icon: <Truck className="w-4 h-4" /> },
          { to: '/donor/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
          { to: '/donor/profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
        ]

      case 'NGO':
        return [
          { to: '/ngo/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { to: '/ngo/donations', label: 'Browse Donations', icon: <Gift className="w-4 h-4" /> },
          { to: '/ngo/requests', label: 'My Requests', icon: <Inbox className="w-4 h-4" /> },
          { to: '/ngo/requirements/new', label: 'Create Requirement', icon: <PlusCircle className="w-4 h-4" /> },
          { to: '/ngo/requirements', label: 'My Requirements', icon: <FileText className="w-4 h-4" /> },
          { to: '/ngo/pickups', label: 'Delivery Tracking', icon: <Truck className="w-4 h-4" /> },
          { to: '/ngo/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
          { to: '/ngo/profile', label: 'Organization Profile', icon: <Building className="w-4 h-4" /> },
        ]

      case 'VOLUNTEER':
        return [
          { to: '/volunteer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { to: '/volunteer/pickups/available', label: 'Available Pickups', icon: <Gift className="w-4 h-4" /> },
          { to: '/volunteer/pickups/my', label: 'My Pickups', icon: <Truck className="w-4 h-4" /> },
          { to: '/volunteer/history', label: 'Delivery History', icon: <CheckCircle className="w-4 h-4" /> },
          { to: '/volunteer/availability', label: 'Availability', icon: <Clock className="w-4 h-4" /> },
          { to: '/volunteer/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
          { to: '/volunteer/profile', label: 'Volunteer Profile', icon: <User className="w-4 h-4" /> },
        ]

      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          { to: '/admin/users', label: 'All Users', icon: <Users className="w-4 h-4" /> },
          { to: '/admin/donors', label: 'Donor Verification', icon: <ShieldCheck className="w-4 h-4" /> },
          { to: '/admin/ngos', label: 'NGO Verification', icon: <Building className="w-4 h-4" /> },
          { to: '/admin/volunteers', label: 'Volunteer Verification', icon: <Truck className="w-4 h-4" /> },
          { to: '/admin/donations', label: 'Donations Monitor', icon: <Gift className="w-4 h-4" /> },
          { to: '/admin/requirements', label: 'Requirements Monitor', icon: <FileText className="w-4 h-4" /> },
          { to: '/admin/requests', label: 'Requests Monitor', icon: <Inbox className="w-4 h-4" /> },
          { to: '/admin/pickups', label: 'Pickups Monitor', icon: <Truck className="w-4 h-4" /> },
          { to: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        ]

      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#23332f]/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#cfded8] shadow-card flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header on mobile sidebar */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#eaf2ef] lg:hidden">
          <div className="flex items-center gap-2 font-extrabold text-[#23332f]">
            <HeartHandshake className="w-5 h-5 text-[#912f56]" />
            <span>DonateBridge</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#66736f] hover:bg-[#eaf2ef]"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Portal Tag */}
        <div className="p-4 mx-4 mt-4 rounded-xl bg-[#eaf2ef]/70 border border-[#cfded8]/60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#912f56] block">
            {user?.role} PORTAL
          </span>
          <span className="text-xs text-[#66736f] truncate block mt-0.5">
            {user?.name}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors select-none',
                  isActive
                    ? 'bg-[#f6e8ee] text-[#912f56] font-bold shadow-sm'
                    : 'text-[#66736f] hover:bg-[#eaf2ef] hover:text-[#23332f]'
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-[#eaf2ef] text-center text-[11px] text-[#66736f]">
          <p className="font-semibold text-[#23332f]">DonateBridge Platform</p>
          <p className="text-[10px] text-[#66736f] mt-0.5">Community Redistribution</p>
        </div>
      </aside>
    </>
  )
}
