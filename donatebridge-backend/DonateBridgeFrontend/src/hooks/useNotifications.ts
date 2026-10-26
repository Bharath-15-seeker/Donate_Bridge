import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '@/api/notification.api'
import { useAuth } from './useAuth'

export function useNotifications() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getMyNotifications,
    enabled: isAuthenticated,
    refetchInterval: 30000, // conservative polling every 30s
  })

  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationApi.getUnreadNotifications,
    enabled: isAuthenticated,
    refetchInterval: 30000,
  })

  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] })
    },
  })

  return {
    notifications: notificationsQuery.data || [],
    unreadNotifications: unreadQuery.data || [],
    unreadCount: (unreadQuery.data || []).length,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingRead: markAsReadMutation.isPending || markAllAsReadMutation.isPending,
  }
}
