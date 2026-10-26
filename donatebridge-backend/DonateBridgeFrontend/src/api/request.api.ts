import { apiClient } from './axios'
import type { CreateDonationRequestPayload, DonationRequest } from '@/types'

export const requestApi = {
  getMyRequests: async (): Promise<DonationRequest[]> => {
    const response = await apiClient.get<DonationRequest[]>('/api/requests/my')
    return response.data
  },

  getRequestById: async (id: number): Promise<DonationRequest> => {
    const response = await apiClient.get<DonationRequest>(`/api/requests/${id}`)
    return response.data
  },

  createRequest: async (
    payload: CreateDonationRequestPayload
  ): Promise<DonationRequest> => {
    const response = await apiClient.post<DonationRequest>('/api/requests', payload)
    return response.data
  },

  acceptRequest: async (id: number): Promise<DonationRequest> => {
    const response = await apiClient.put<DonationRequest>(`/api/requests/${id}/accept`)
    return response.data
  },

  rejectRequest: async (id: number): Promise<DonationRequest> => {
    const response = await apiClient.put<DonationRequest>(`/api/requests/${id}/reject`)
    return response.data
  },
}
