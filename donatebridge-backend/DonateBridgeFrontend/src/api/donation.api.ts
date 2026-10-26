import { apiClient, isProfileNotFoundError } from './axios'
import type { CreateDonationPayload, Donation } from '@/types'

export const donationApi = {
  getMyDonations: async (): Promise<Donation[]> => {
    try {
      const response = await apiClient.get<Donation[]>('/api/donations/my')
      return response.data
    } catch (err) {
      if (isProfileNotFoundError(err)) {
        return []
      }
      throw err
    }
  },

  getAvailableDonations: async (): Promise<Donation[]> => {
    const response = await apiClient.get<Donation[]>('/api/donations/available')
    return response.data
  },

  getDonationById: async (id: number): Promise<Donation> => {
    const response = await apiClient.get<Donation>(`/api/donations/${id}`)
    return response.data
  },

  createDonation: async (
    payload: CreateDonationPayload,
    images?: File[]
  ): Promise<Donation> => {
    const formData = new FormData()
    const jsonBlob = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    })
    formData.append('data', jsonBlob)

    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append('images', file)
      })
    }

    const response = await apiClient.post<Donation>('/api/donations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  updateDonation: async (
    id: number,
    payload: CreateDonationPayload,
    images?: File[]
  ): Promise<Donation> => {
    const formData = new FormData()
    const jsonBlob = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    })
    formData.append('data', jsonBlob)

    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append('images', file)
      })
    }

    const response = await apiClient.put<Donation>(`/api/donations/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  deleteDonation: async (id: number): Promise<Donation> => {
    const response = await apiClient.delete<Donation>(`/api/donations/${id}`)
    return response.data
  },
}
