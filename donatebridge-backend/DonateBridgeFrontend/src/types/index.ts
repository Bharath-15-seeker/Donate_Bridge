// Enums exactly matching backend
export type Role = 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN'

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING'

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE'

export type DonationStatus =
  | 'AVAILABLE'
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'PICKUP_ASSIGNED'
  | 'PICKUP_STARTED'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED'

export type DonationRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'

export type RequirementStatus =
  | 'ACTIVE'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CANCELLED'

export type PickupStatus =
  | 'ASSIGNED'
  | 'STARTED'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'

export type NotificationType =
  | 'DONATION_REQUEST'
  | 'REQUEST_ACCEPTED'
  | 'REQUEST_REJECTED'
  | 'PICKUP_ASSIGNED'
  | 'PICKUP_ACCEPTED'
  | 'PICKUP_STARTED'
  | 'DONATION_PICKED_UP'
  | 'DONATION_DELIVERED'
  | 'PICKUP_COMPLETED'
  | 'GENERAL'

// Auth & User Types
export interface AuthResponse {
  accessToken: string
  tokenType: string
  userId: number
  name: string
  email: string
  role: Role
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone?: string
  role: Role
}

export interface UserResponse {
  id: number
  name: string
  email: string
  phone?: string
  role: Role
  accountStatus: AccountStatus
}

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: Role
  accountStatus: AccountStatus
  createdAt?: string
  updatedAt?: string
}

// Role-specific profile types
export interface DonorProfile {
  id?: number
  userId?: number
  organizationName?: string
  address?: string
  latitude?: number | null
  longitude?: number | null
  verificationStatus?: VerificationStatus
}

export interface NGOProfile {
  id?: number
  userId?: number
  organizationName?: string
  registrationNumber?: string
  address?: string
  latitude?: number | null
  longitude?: number | null
  verificationStatus?: VerificationStatus
}

export interface VolunteerProfile {
  id?: number
  userId?: number
  vehicleType?: string
  vehicleNumber?: string
  availabilityStatus?: AvailabilityStatus
  verificationStatus?: VerificationStatus
}

// Platform entity types
export interface Donation {
  id: number
  donorId: number
  title: string
  description: string
  category: string
  quantity: number
  unit: string
  condition: string
  pickupAddress: string
  latitude?: number | null
  longitude?: number | null
  status: DonationStatus
  requirementId?: number | null
  imageUrls: string[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateDonationPayload {
  title: string
  description: string
  category: string
  quantity: number
  unit: string
  condition: string
  pickupAddress: string
  latitude?: number | null
  longitude?: number | null
  requirementId?: number | null
}

export interface Requirement {
  id: number
  ngoId: number
  title: string
  description: string
  category: string
  quantity: number
  unit: string
  urgency: string
  status: RequirementStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateRequirementPayload {
  title: string
  description: string
  category: string
  quantity: number
  unit: string
  urgency: string
}

export interface DonationRequest {
  id: number
  donationId: number
  ngoId: number
  message?: string
  status: DonationRequestStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateDonationRequestPayload {
  donationId: number
  message?: string
}

export interface Pickup {
  id: number
  donationId: number
  volunteerId?: number | null
  pickupAddress: string
  deliveryAddress: string
  assignedAt?: string
  startedAt?: string
  pickedUpAt?: string
  deliveredAt?: string
  completedAt?: string
  status: PickupStatus
}

export interface Notification {
  id: number
  userId: number
  type: NotificationType
  message: string
  read: boolean
  createdAt: string
}

export interface AdminDashboardStats {
  totalUsers: number
  totalDonors: number
  totalNgos: number
  totalVolunteers: number
  pendingDonors: number
  pendingNgos: number
  pendingVolunteers: number
  verifiedDonors: number
  verifiedNgos: number
  verifiedVolunteers: number
  totalDonations: number
  availableDonations: number
  acceptedDonations: number
  completedDonations: number
  cancelledDonations: number
  totalRequirements: number
  activeRequirements: number
  fulfilledRequirements: number
  cancelledRequirements: number
  totalRequests: number
  pendingRequests: number
  acceptedRequests: number
  rejectedRequests: number
  totalPickups: number
  assignedPickups: number
  startedPickups: number
  pickedUpPickups: number
  deliveredPickups: number
  completedPickups: number
  cancelledPickups: number
}
