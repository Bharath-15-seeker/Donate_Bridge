import React, { useState, useRef, useEffect } from 'react'
import { Bell, CheckCheck, ExternalLink, Inbox } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { formatRelativeTime } from '@/utils/formatters'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAsRead, markAllAsRead, isMarkingRead } = useNotifications()
  const { user } = useAuth()

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const rolePrefix = user?.role ? `/${user.role.toLowerCase()}` : ''

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-[#23332f] hover:bg-[#eaf2ef] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#912f56]"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5 text-[#23332f]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full bg-[#912f56] text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#cfded8] shadow-modal z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between p-4 border-b border-[#eaf2ef] bg-[#f9fbfa]">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-[#23332f]">Notifications</h4>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#f6e8ee] text-[#912f56]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                disabled={isMarkingRead}
                className="text-xs font-semibold text-[#912f56] hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#eaf2ef]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center px-4">
                <Inbox className="w-8 h-8 text-[#66736f]/50 mx-auto mb-2" />
                <p className="text-sm font-medium text-[#23332f]">All caught up!</p>
                <p className="text-xs text-[#66736f]">No notifications at this time.</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.read) markAsRead(item.id)
                  }}
                  className={`p-3.5 text-left transition-colors cursor-pointer hover:bg-[#f6f9f8] flex items-start gap-3 ${
                    !item.read ? 'bg-[#f6e8ee]/30 font-medium' : ''
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      !item.read ? 'bg-[#912f56]' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#23332f] leading-snug line-clamp-2">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-[#66736f] mt-1 block font-normal">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          {notifications.length > 0 && (
            <div className="p-2.5 border-t border-[#eaf2ef] bg-[#f9fbfa] text-center">
              <Link
                to={`${rolePrefix}/notifications`}
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-[#912f56] hover:underline inline-flex items-center gap-1.5"
              >
                View all notifications
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
