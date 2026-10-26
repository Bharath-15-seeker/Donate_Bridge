import React, { useState } from 'react'
import { Bell, CheckCheck, Inbox } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDateTime } from '@/utils/formatters'

export const VolunteerNotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingRead,
  } = useNotifications()

  const displayedNotifications =
    filter === 'UNREAD' ? notifications.filter((n) => !n.read) : notifications

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#23332f]">Volunteer Notifications</h1>
          <p className="text-sm text-[#66736f]">
            Stay updated on new pickup opportunities, route assignments, and delivery milestones.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={() => markAllAsRead()}
            isLoading={isMarkingRead}
          >
            Mark All Read
          </Button>
        )}
      </div>

      <Tabs
        tabs={[
          { id: 'ALL', label: 'All Notifications', count: notifications.length },
          { id: 'UNREAD', label: 'Unread Only', count: unreadCount },
        ]}
        activeTab={filter}
        onChange={(id) => setFilter(id as 'ALL' | 'UNREAD')}
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : displayedNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-7 h-7" />}
          title={filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
          description="Alerts related to your deliveries will appear here."
        />
      ) : (
        <div className="space-y-3">
          {displayedNotifications.map((item) => (
            <Card
              key={item.id}
              onClick={() => {
                if (!item.read) markAsRead(item.id)
              }}
              className={`p-4 bg-white border border-[#cfded8] transition-all cursor-pointer hover:border-[#912f56]/40 flex items-start gap-4 ${
                !item.read ? 'bg-[#f6e8ee]/25 border-l-4 border-l-[#912f56]' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  !item.read ? 'bg-[#f6e8ee] text-[#912f56]' : 'bg-[#eaf2ef] text-[#66736f]'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#23332f] font-medium leading-snug">
                  {item.message}
                </p>
                <span className="text-[11px] text-[#66736f] mt-1 block">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>

              {!item.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    markAsRead(item.id)
                  }}
                  className="text-xs font-semibold text-[#912f56] hover:underline shrink-0"
                >
                  Mark read
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
