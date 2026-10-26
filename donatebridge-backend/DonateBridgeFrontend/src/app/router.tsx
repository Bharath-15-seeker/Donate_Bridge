import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { RoleLayout } from '@/components/layout/RoleLayout'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'

// Public pages
import { LandingPage } from '@/pages/public/LandingPage'
import { LoginPage } from '@/pages/public/LoginPage'
import { RegisterPage } from '@/pages/public/RegisterPage'
import { UnauthorizedPage } from '@/pages/public/UnauthorizedPage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'

// Donor pages
import { DonorDashboardPage } from '@/pages/donor/DonorDashboardPage'
import { DonorDonationsPage } from '@/pages/donor/DonorDonationsPage'
import { DonorCreateDonationPage } from '@/pages/donor/DonorCreateDonationPage'
import { DonorDonationDetailPage } from '@/pages/donor/DonorDonationDetailPage'
import { DonorRequirementsPage } from '@/pages/donor/DonorRequirementsPage'
import { DonorRequestsPage } from '@/pages/donor/DonorRequestsPage'
import { DonorPickupsPage } from '@/pages/donor/DonorPickupsPage'
import { DonorNotificationsPage } from '@/pages/donor/DonorNotificationsPage'
import { DonorProfilePage } from '@/pages/donor/DonorProfilePage'

// NGO pages
import { NGODashboardPage } from '@/pages/ngo/NGODashboardPage'
import { NGOBrowseDonationsPage } from '@/pages/ngo/NGOBrowseDonationsPage'
import { NGODonationDetailPage } from '@/pages/ngo/NGODonationDetailPage'
import { NGORequestsPage } from '@/pages/ngo/NGORequestsPage'
import { NGORequirementsPage } from '@/pages/ngo/NGORequirementsPage'
import { NGOCreateRequirementPage } from '@/pages/ngo/NGOCreateRequirementPage'
import { NGOPickupsPage } from '@/pages/ngo/NGOPickupsPage'
import { NGONotificationsPage } from '@/pages/ngo/NGONotificationsPage'
import { NGOProfilePage } from '@/pages/ngo/NGOProfilePage'

// Volunteer pages
import { VolunteerDashboardPage } from '@/pages/volunteer/VolunteerDashboardPage'
import { VolunteerAvailablePickupsPage } from '@/pages/volunteer/VolunteerAvailablePickupsPage'
import { VolunteerMyPickupsPage } from '@/pages/volunteer/VolunteerMyPickupsPage'
import { VolunteerPickupDetailPage } from '@/pages/volunteer/VolunteerPickupDetailPage'
import { VolunteerHistoryPage } from '@/pages/volunteer/VolunteerHistoryPage'
import { VolunteerAvailabilityPage } from '@/pages/volunteer/VolunteerAvailabilityPage'
import { VolunteerNotificationsPage } from '@/pages/volunteer/VolunteerNotificationsPage'
import { VolunteerProfilePage } from '@/pages/volunteer/VolunteerProfilePage'

// Admin pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminDonorsPage } from '@/pages/admin/AdminDonorsPage'
import { AdminNGOsPage } from '@/pages/admin/AdminNGOsPage'
import { AdminVolunteersPage } from '@/pages/admin/AdminVolunteersPage'
import { AdminDonationsPage } from '@/pages/admin/AdminDonationsPage'
import { AdminRequirementsPage } from '@/pages/admin/AdminRequirementsPage'
import { AdminRequestsPage } from '@/pages/admin/AdminRequestsPage'
import { AdminPickupsPage } from '@/pages/admin/AdminPickupsPage'
import { AdminNotificationsPage } from '@/pages/admin/AdminNotificationsPage'

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'unauthorized', element: <UnauthorizedPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // Donor Routes
  {
    path: '/donor',
    element: (
      <ProtectedRoute allowedRoles={['DONOR']}>
        <RoleLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/donor/dashboard" replace /> },
      { path: 'dashboard', element: <DonorDashboardPage /> },
      { path: 'donations', element: <DonorDonationsPage /> },
      { path: 'donations/new', element: <DonorCreateDonationPage /> },
      { path: 'donations/:id', element: <DonorDonationDetailPage /> },
      { path: 'requirements', element: <DonorRequirementsPage /> },
      { path: 'requests', element: <DonorRequestsPage /> },
      { path: 'pickups', element: <DonorPickupsPage /> },
      { path: 'notifications', element: <DonorNotificationsPage /> },
      { path: 'profile', element: <DonorProfilePage /> },
    ],
  },

  // NGO Routes
  {
    path: '/ngo',
    element: (
      <ProtectedRoute allowedRoles={['NGO']}>
        <RoleLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/ngo/dashboard" replace /> },
      { path: 'dashboard', element: <NGODashboardPage /> },
      { path: 'donations', element: <NGOBrowseDonationsPage /> },
      { path: 'donations/:id', element: <NGODonationDetailPage /> },
      { path: 'requests', element: <NGORequestsPage /> },
      { path: 'requirements', element: <NGORequirementsPage /> },
      { path: 'requirements/new', element: <NGOCreateRequirementPage /> },
      { path: 'pickups', element: <NGOPickupsPage /> },
      { path: 'notifications', element: <NGONotificationsPage /> },
      { path: 'profile', element: <NGOProfilePage /> },
    ],
  },

  // Volunteer Routes
  {
    path: '/volunteer',
    element: (
      <ProtectedRoute allowedRoles={['VOLUNTEER']}>
        <RoleLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/volunteer/dashboard" replace /> },
      { path: 'dashboard', element: <VolunteerDashboardPage /> },
      { path: 'pickups/available', element: <VolunteerAvailablePickupsPage /> },
      { path: 'pickups/my', element: <VolunteerMyPickupsPage /> },
      { path: 'pickups/:id', element: <VolunteerPickupDetailPage /> },
      { path: 'history', element: <VolunteerHistoryPage /> },
      { path: 'availability', element: <VolunteerAvailabilityPage /> },
      { path: 'notifications', element: <VolunteerNotificationsPage /> },
      { path: 'profile', element: <VolunteerProfilePage /> },
    ],
  },

  // Admin Routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <RoleLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'donors', element: <AdminDonorsPage /> },
      { path: 'ngos', element: <AdminNGOsPage /> },
      { path: 'volunteers', element: <AdminVolunteersPage /> },
      { path: 'donations', element: <AdminDonationsPage /> },
      { path: 'requirements', element: <AdminRequirementsPage /> },
      { path: 'requests', element: <AdminRequestsPage /> },
      { path: 'pickups', element: <AdminPickupsPage /> },
      { path: 'notifications', element: <AdminNotificationsPage /> },
    ],
  },
])
