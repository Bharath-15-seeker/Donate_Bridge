import { apiClient } from './axios'
import type { CreateRequirementPayload, Requirement } from '@/types'

export const requirementApi = {
  getMyRequirements: async (): Promise<Requirement[]> => {
    const response = await apiClient.get<Requirement[]>('/api/requirements/my')
    return response.data
  },

  getAvailableRequirements: async (): Promise<Requirement[]> => {
    const response = await apiClient.get<Requirement[]>('/api/requirements/available')
    return response.data
  },

  getRequirementById: async (id: number): Promise<Requirement> => {
    const response = await apiClient.get<Requirement>(`/api/requirements/${id}`)
    return response.data
  },

  createRequirement: async (payload: CreateRequirementPayload): Promise<Requirement> => {
    const response = await apiClient.post<Requirement>('/api/requirements', payload)
    return response.data
  },

  updateRequirement: async (
    id: number,
    payload: CreateRequirementPayload
  ): Promise<Requirement> => {
    const response = await apiClient.put<Requirement>(`/api/requirements/${id}`, payload)
    return response.data
  },

  cancelRequirement: async (id: number): Promise<Requirement> => {
    const response = await apiClient.delete<Requirement>(`/api/requirements/${id}`)
    return response.data
  },
}
