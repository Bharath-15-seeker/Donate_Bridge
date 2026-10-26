import { apiClient, isProfileNotFoundError } from './axios'
import type { AvailabilityStatus, VolunteerProfile } from '@/types'

export const volunteerApi = {
  getMyProfile: async (): Promise<VolunteerProfile | null> => {
    try {
      const response = await apiClient.get<VolunteerProfile>('/api/volunteers/profile')
      return response.data
    } catch (err) {
      if (isProfileNotFoundError(err)) {
        return null
      }
      throw err
    }
  },

  createProfile: async (data: Partial<VolunteerProfile>): Promise<VolunteerProfile> => {
    const response = await apiClient.post<VolunteerProfile>('/api/volunteers/profile', data)
    return response.data
  },

  updateProfile: async (data: Partial<VolunteerProfile>): Promise<VolunteerProfile> => {
    const response = await apiClient.put<VolunteerProfile>('/api/volunteers/profile', data)
    return response.data
  },

  updateAvailability: async (status: AvailabilityStatus): Promise<VolunteerProfile> => {
    const response = await apiClient.put<VolunteerProfile>('/api/volunteers/availability', null, {
      params: { status },
    })
    return response.data
  },
}
