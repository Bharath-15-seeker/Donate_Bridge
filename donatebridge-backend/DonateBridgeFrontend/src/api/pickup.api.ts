import { apiClient } from './axios'
import type { Pickup } from '@/types'

export const pickupApi = {
  getAvailablePickups: async (): Promise<Pickup[]> => {
    const response = await apiClient.get<Pickup[]>('/api/pickups/available')
    return response.data
  },

  getMyPickups: async (): Promise<Pickup[]> => {
    const response = await apiClient.get<Pickup[]>('/api/pickups/my')
    return response.data
  },

  getPickupById: async (id: number): Promise<Pickup> => {
    const response = await apiClient.get<Pickup>(`/api/pickups/${id}`)
    return response.data
  },

  getPickupByDonationId: async (donationId: number): Promise<Pickup | null> => {
    try {
      const response = await apiClient.get<Pickup>(`/api/pickups/donation/${donationId}`)
      return response.data
    } catch {
      return null
    }
  },

  acceptPickup: async (id: number): Promise<Pickup> => {
    const response = await apiClient.post<Pickup>(`/api/pickups/${id}/accept`)
    return response.data
  },

  startPickup: async (id: number): Promise<Pickup> => {
    const response = await apiClient.post<Pickup>(`/api/pickups/${id}/start`)
    return response.data
  },

  markPickedUp: async (id: number): Promise<Pickup> => {
    const response = await apiClient.post<Pickup>(`/api/pickups/${id}/picked-up`)
    return response.data
  },

  markDelivered: async (id: number): Promise<Pickup> => {
    const response = await apiClient.post<Pickup>(`/api/pickups/${id}/delivered`)
    return response.data
  },

  completePickup: async (id: number): Promise<Pickup> => {
    const response = await apiClient.post<Pickup>(`/api/pickups/${id}/complete`)
    return response.data
  },
}
