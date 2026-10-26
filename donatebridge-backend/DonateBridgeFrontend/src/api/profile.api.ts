import { apiClient } from './axios'

export interface ContactProfile {
  profileId: number
  role: 'DONOR' | 'NGO' | 'VOLUNTEER'
  name?: string
  email?: string
  phone?: string
  organizationName?: string
  address?: string
  registrationNumber?: string
  vehicleType?: string
  vehicleNumber?: string
  verificationStatus?: string
  availabilityStatus?: string
  requestStatus?: string
}

export interface DonationContacts {
  donationId: number
  donor?: ContactProfile
  ngo?: ContactProfile
  volunteer?: ContactProfile
  ngos?: ContactProfile[]
}

export const profileApi = {
  getDonationContacts: async (donationId: number): Promise<DonationContacts> => {
    const response = await apiClient.get<DonationContacts>(`/api/profiles/donation/${donationId}/contacts`)
    return response.data
  },
}
