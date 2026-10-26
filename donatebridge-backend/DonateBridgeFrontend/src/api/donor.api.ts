import { apiClient, isProfileNotFoundError } from './axios'
import type { DonorProfile } from '@/types'

export const donorApi = {
  getMyProfile: async (): Promise<DonorProfile | null> => {
    try {
      const response = await apiClient.get<DonorProfile>('/api/donors/profile')
      return response.data
    } catch (err) {
      if (isProfileNotFoundError(err)) {
        return null
      }
      throw err
    }
  },

  createProfile: async (data: Partial<DonorProfile>): Promise<DonorProfile> => {
    const response = await apiClient.post<DonorProfile>('/api/donors/profile', data)
    return response.data
  },

  updateProfile: async (data: Partial<DonorProfile>): Promise<DonorProfile> => {
    const response = await apiClient.put<DonorProfile>('/api/donors/profile', data)
    return response.data
  },
}
