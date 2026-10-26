import { apiClient } from './axios'
import type {
  AccountStatus,
  AdminDashboardStats,
  Donation,
  DonationRequest,
  DonorProfile,
  NGOProfile,
  Pickup,
  Requirement,
  User,
  VerificationStatus,
  VolunteerProfile,
} from '@/types'

export const adminApi = {
  getDashboard: async (): Promise<AdminDashboardStats> => {
    const response = await apiClient.get<AdminDashboardStats>('/api/admin/dashboard')
    return response.data
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/api/admin/users')
    return response.data
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/api/admin/users/${id}`)
    return response.data
  },

  updateUserStatus: async (id: number, status: AccountStatus): Promise<User> => {
    const response = await apiClient.put<User>(`/api/admin/users/${id}/status`, null, {
      params: { status },
    })
    return response.data
  },

  getAllDonors: async (): Promise<DonorProfile[]> => {
    const response = await apiClient.get<DonorProfile[]>('/api/admin/donors')
    return response.data
  },

  verifyDonor: async (id: number, status: VerificationStatus): Promise<DonorProfile> => {
    const response = await apiClient.put<DonorProfile>(`/api/admin/donors/${id}/verify`, null, {
      params: { status },
    })
    return response.data
  },

  getAllNgos: async (): Promise<NGOProfile[]> => {
    const response = await apiClient.get<NGOProfile[]>('/api/admin/ngos')
    return response.data
  },

  verifyNgo: async (id: number, status: VerificationStatus): Promise<NGOProfile> => {
    const response = await apiClient.put<NGOProfile>(`/api/admin/ngos/${id}/verify`, null, {
      params: { status },
    })
    return response.data
  },

  getAllVolunteers: async (): Promise<VolunteerProfile[]> => {
    const response = await apiClient.get<VolunteerProfile[]>('/api/admin/volunteers')
    return response.data
  },

  verifyVolunteer: async (
    id: number,
    status: VerificationStatus
  ): Promise<VolunteerProfile> => {
    const response = await apiClient.put<VolunteerProfile>(
      `/api/admin/volunteers/${id}/verify`,
      null,
      { params: { status } }
    )
    return response.data
  },

  getAllDonations: async (): Promise<Donation[]> => {
    const response = await apiClient.get<Donation[]>('/api/admin/donations')
    return response.data
  },

  deleteDonation: async (id: number): Promise<Donation> => {
    const response = await apiClient.delete<Donation>(`/api/admin/donations/${id}`)
    return response.data
  },

  getAllRequirements: async (): Promise<Requirement[]> => {
    const response = await apiClient.get<Requirement[]>('/api/admin/requirements')
    return response.data
  },

  getAllRequests: async (): Promise<DonationRequest[]> => {
    const response = await apiClient.get<DonationRequest[]>('/api/admin/requests')
    return response.data
  },

  getAllPickups: async (): Promise<Pickup[]> => {
    const response = await apiClient.get<Pickup[]>('/api/admin/pickups')
    return response.data
  },
}
