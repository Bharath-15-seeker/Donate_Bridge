import { apiClient, isProfileNotFoundError } from './axios'
import type { NGOProfile } from '@/types'

export const ngoApi = {
  getMyProfile: async (): Promise<NGOProfile | null> => {
    try {
      const response = await apiClient.get<NGOProfile>('/api/ngos/profile')
      return response.data
    } catch (err) {
      if (isProfileNotFoundError(err)) {
        return null
      }
      throw err
    }
  },

  createProfile: async (data: Partial<NGOProfile>): Promise<NGOProfile> => {
    const response = await apiClient.post<NGOProfile>('/api/ngos/profile', data)
    return response.data
  },

  updateProfile: async (data: Partial<NGOProfile>): Promise<NGOProfile> => {
    const response = await apiClient.put<NGOProfile>('/api/ngos/profile', data)
    return response.data
  },
}
