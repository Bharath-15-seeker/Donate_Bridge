import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { pickupApi } from '@/api/pickup.api'
import { volunteerApi } from '@/api/volunteer.api'
import { useAuth } from '@/hooks/useAuth'
import { StatCard } from '@/components/data-display/StatCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDate } from '@/utils/formatters'
import type { AvailabilityStatus } from '@/types'

export const VolunteerDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Volunteer profile
  const profileQuery = useQuery({
    queryKey: ['volunteer', 'profile'],
    queryFn: volunteerApi.getMyProfile,
    retry: 1,
  })

  // Available unassigned pickups
  const availablePickupsQuery = useQuery({
    queryKey: ['pickups', 'available'],
    queryFn: pickupApi.getAvailablePickups,
  })

  // Volunteer's own pickups
  const myPickupsQuery = useQuery({
    queryKey: ['pickups', 'my'],
    queryFn: pickupApi.getMyPickups,
  })

  const profile = profileQuery.data
  const availablePickups = availablePickupsQuery.data || []
  const myPickups = myPickupsQuery.data || []

  // Metrics
  const activePickups = myPickups.filter((p) =>
    ['ASSIGNED', 'STARTED', 'PICKED_UP', 'DELIVERED'].includes(p.status)
  )
  const completedPickups = myPickups.filter((p) => p.status === 'COMPLETED')

  // Quick availability status update
  const availabilityMutation = useMutation({
    mutationFn: (status: AvailabilityStatus) => volunteerApi.updateAvailability(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteer', 'profile'] })
    },
  })

  const currentAvailability = profile?.availabilityStatus || 'OFFLINE'

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#cfded8] shadow-card">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#23332f] tracking-tight">
              Hello, {user?.name || 'Volunteer'}
            </h1>
            <StatusBadge status={currentAvailability} />
            {profile?.verificationStatus && (
              <StatusBadge status={profile.verificationStatus} />
            )}
          </div>
          <p className="text-sm text-[#66736f]">
            Accept community pickup dispatches, transport donations, and deliver hope.
          </p>
        </div>

        {/* Quick Availability Switcher */}
        <div className="flex items-center gap-2 bg-[#eaf2ef]/70 p-1.5 rounded-2xl border border-[#cfded8]">
          <span className="text-xs font-semibold text-[#66736f] pl-2 hidden sm:inline">
            Duty Status:
          </span>
          {(['AVAILABLE', 'BUSY', 'OFFLINE'] as AvailabilityStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => availabilityMutation.mutate(status)}
              disabled={availabilityMutation.isPending}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentAvailability === status
                  ? status === 'AVAILABLE'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : status === 'BUSY'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-600 text-white shadow-sm'
                  : 'text-[#66736f] hover:bg-white/60'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Verification Notice */}
      {profile?.verificationStatus === 'PENDING' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Volunteer Verification in Progress</span>
            <span>
              Your vehicle credentials and profile are undergoing review by platform administrators. You can still accept pickups and manage your schedule.
            </span>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Available Pickups"
          value={availablePickupsQuery.isLoading ? '...' : availablePickups.length}
          subtitle="Ready for acceptance"
          icon={<Package className="w-5 h-5" />}
          variant="brand"
        />
        <StatCard
          title="Active In Transit"
          value={myPickupsQuery.isLoading ? '...' : activePickups.length}
          subtitle="Currently assigned to you"
          icon={<Truck className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          title="Deliveries Completed"
          value={myPickupsQuery.isLoading ? '...' : completedPickups.length}
          subtitle="Successfully handed over"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
        />
        <StatCard
          title="Vehicle Registered"
          value={profile?.vehicleType || 'None'}
          subtitle={profile?.vehicleNumber || 'No plate set'}
          icon={<Truck className="w-5 h-5" />}
          variant="default"
        />
      </div>

      {/* Active Tasks & Available Work */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My In-Progress Deliveries */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#23332f]">My Active Pickups</h2>
            <Link
              to="/volunteer/pickups/my"
              className="text-xs font-semibold text-[#912f56] hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myPickupsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : activePickups.length === 0 ? (
            <EmptyState
              icon={<Truck className="w-7 h-7" />}
              title="No active delivery tasks"
              description="You have no in-progress pickups right now. Check available jobs nearby to accept a delivery assignment."
              actionLabel="Find Available Pickups"
              onAction={() => (window.location.href = '/volunteer/pickups/available')}
            />
          ) : (
            <div className="space-y-3">
              {activePickups.map((pickup) => (
                <Card
                  key={pickup.id}
                  className="p-5 bg-white border border-[#cfded8] hover:border-[#912f56]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#912f56] uppercase">
                        Pickup #{pickup.id}
                      </span>
                      <StatusBadge status={pickup.status} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <p className="text-[#23332f]">
                        <strong className="text-[#66736f]">From:</strong> {pickup.pickupAddress}
                      </p>
                      <p className="text-[#23332f]">
                        <strong className="text-[#66736f]">To:</strong> {pickup.deliveryAddress}
                      </p>
                    </div>
                  </div>

                  <Link to={`/volunteer/pickups/${pickup.id}`}>
                    <Button variant="primary" size="sm">
                      Manage Delivery
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Available Pickups Teaser */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#23332f]">Available Pickups</h2>
            <Link
              to="/volunteer/pickups/available"
              className="text-xs font-semibold text-[#912f56] hover:underline flex items-center gap-1"
            >
              Browse all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="p-5 bg-white border border-[#cfded8] space-y-4">
            {availablePickupsQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : availablePickups.length === 0 ? (
              <p className="text-xs text-[#66736f] italic text-center py-4">
                No open pickups awaiting assignment.
              </p>
            ) : (
              <div className="space-y-3 divide-y divide-[#eaf2ef]">
                {availablePickups.slice(0, 3).map((p) => (
                  <div key={p.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#23332f]">
                        Pickup #{p.id}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-xs text-[#66736f] line-clamp-1">
                      From: {p.pickupAddress}
                    </p>
                    <div className="pt-1 text-right">
                      <Link to={`/volunteer/pickups/${p.id}`}>
                        <Button variant="subtle" size="sm" className="h-7 text-xs">
                          Review & Accept
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
