import { apiClient } from './axios'
import type { Notification } from '@/types'

export const notificationApi = {
  getMyNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/api/notifications')
    return response.data
  },

  getUnreadNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/api/notifications/unread')
    return response.data
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const response = await apiClient.put<Notification>(`/api/notifications/${id}/read`)
    return response.data
  },

  markAllAsRead: async (): Promise<string> => {
    const response = await apiClient.put<string>('/api/notifications/read-all')
    return response.data
  },
}
