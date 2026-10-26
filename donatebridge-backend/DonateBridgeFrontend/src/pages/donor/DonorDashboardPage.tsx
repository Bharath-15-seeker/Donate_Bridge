import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Gift,
  PlusCircle,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { donationApi } from '@/api/donation.api'
import { requirementApi } from '@/api/requirement.api'
import { donorApi } from '@/api/donor.api'
import { useAuth } from '@/hooks/useAuth'
import { StatCard } from '@/components/data-display/StatCard'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDate } from '@/utils/formatters'

export const DonorDashboardPage: React.FC = () => {
  const { user } = useAuth()

  // Donor profile query
  const profileQuery = useQuery({
    queryKey: ['donor', 'profile'],
    queryFn: donorApi.getMyProfile,
    retry: 1,
  })

  // Donor's own donations
  const donationsQuery = useQuery({
    queryKey: ['donations', 'my'],
    queryFn: donationApi.getMyDonations,
  })

  // Available NGO requirements
  const requirementsQuery = useQuery({
    queryKey: ['requirements', 'available'],
    queryFn: requirementApi.getAvailableRequirements,
  })

  const donations = donationsQuery.data || []
  const availableRequirements = requirementsQuery.data || []
  const profile = profileQuery.data

  // Derived metrics from actual backend responses
  const totalDonations = donations.length
  const availableDonations = donations.filter((d) => d.status === 'AVAILABLE').length
  const inProgressDonations = donations.filter((d) =>
    ['REQUESTED', 'ACCEPTED', 'PICKUP_ASSIGNED', 'PICKUP_STARTED', 'PICKED_UP'].includes(d.status)
  ).length
  const completedDonations = donations.filter((d) =>
    ['DELIVERED', 'COMPLETED'].includes(d.status)
  ).length

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#cfded8] shadow-card">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#23332f] tracking-tight">
              Welcome back, {user?.name || 'Donor'}
            </h1>
            {profile?.verificationStatus && (
              <StatusBadge status={profile.verificationStatus} />
            )}
          </div>
          <p className="text-sm text-[#66736f]">
            Manage your contributions, respond to NGO requests, and track door-to-door pickups.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/donor/donations/new">
            <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Create Donation
            </Button>
          </Link>
          <Link to="/donor/requirements">
            <Button variant="outline" size="md" leftIcon={<FileText className="w-4 h-4" />}>
              View NGO Needs
            </Button>
          </Link>
        </div>
      </div>

      {/* Verification Notice if Pending */}
      {profile?.verificationStatus === 'PENDING' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Profile Verification Pending</span>
            <span>
              Your donor profile is currently being reviewed by administrators. You can still create donations and browse requirements.
            </span>
          </div>
        </div>
      )}

      {/* Profile Setup Callout if not yet created */}
      {!profile && !profileQuery.isLoading && (
        <div className="p-4 rounded-2xl bg-[#f6e8ee] border border-[#eed1dd] text-[#912f56] text-xs sm:text-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold block">Complete Your Donor Profile</span>
              <span>Add your default pickup address and coordinates to streamline future donations.</span>
            </div>
          </div>
          <Link to="/donor/profile">
            <Button variant="primary" size="sm">
              Complete Profile
            </Button>
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Donations"
          value={donationsQuery.isLoading ? '...' : totalDonations}
          subtitle="All items listed by you"
          icon={<Gift className="w-5 h-5" />}
          variant="brand"
        />
        <StatCard
          title="Available"
          value={donationsQuery.isLoading ? '...' : availableDonations}
          subtitle="Ready for NGO request"
          icon={<Clock className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          title="In Transit / Active"
          value={donationsQuery.isLoading ? '...' : inProgressDonations}
          subtitle="Matched & pickup scheduled"
          icon={<Truck className="w-5 h-5" />}
          variant="default"
        />
        <StatCard
          title="Completed"
          value={donationsQuery.isLoading ? '...' : completedDonations}
          subtitle="Delivered to beneficiaries"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
        />
      </div>

      {/* Main Content Grid: Recent Donations & Urgent NGO Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Donations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#23332f]">Recent Donations</h2>
            <Link
              to="/donor/donations"
              className="text-xs font-semibold text-[#912f56] hover:underline flex items-center gap-1"
            >
              View all donations
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {donationsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : donations.length === 0 ? (
            <EmptyState
              title="No donations yet"
              description="You haven't listed any items for redistribution yet. Start by listing clothes, books, medical supplies, or household goods."
              actionLabel="Create Your First Donation"
              onAction={() => (window.location.href = '/donor/donations/new')}
            />
          ) : (
            <div className="space-y-3">
              {donations.slice(0, 5).map((donation) => (
                <Card
                  key={donation.id}
                  className="p-4 bg-white border border-[#cfded8] hover:border-[#912f56]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {donation.imageUrls && donation.imageUrls.length > 0 ? (
                      <img
                        src={donation.imageUrls[0]}
                        alt={donation.title}
                        className="w-14 h-14 rounded-xl object-cover border border-[#cfded8] shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#eaf2ef] text-[#912f56] flex items-center justify-center shrink-0">
                        <Gift className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#23332f] hover:text-[#912f56] transition-colors">
                          <Link to={`/donor/donations/${donation.id}`}>{donation.title}</Link>
                        </h3>
                        <StatusBadge status={donation.status} />
                      </div>
                      <p className="text-xs text-[#66736f] mt-1 line-clamp-1">
                        {donation.category} • {donation.quantity} {donation.unit} • {donation.condition}
                      </p>
                      <span className="text-[11px] text-[#66736f]/80 mt-0.5 block">
                        Listed on {formatDate(donation.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <Link to={`/donor/donations/${donation.id}`}>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Available NGO Requirements */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#23332f]">NGO Needs</h2>
            <Link
              to="/donor/requirements"
              className="text-xs font-semibold text-[#912f56] hover:underline flex items-center gap-1"
            >
              Browse all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="p-5 bg-white border border-[#cfded8] space-y-4">
            <p className="text-xs text-[#66736f]">
              Verified charitable organizations currently requesting items for their beneficiaries:
            </p>

            {requirementsQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : availableRequirements.length === 0 ? (
              <p className="text-xs text-[#66736f] italic text-center py-4">
                No active requirements at the moment.
              </p>
            ) : (
              <div className="space-y-3 divide-y divide-[#eaf2ef]">
                {availableRequirements.slice(0, 4).map((req) => (
                  <div key={req.id} className="pt-3 first:pt-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-[#23332f] line-clamp-1">
                        {req.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                        {req.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-[#66736f] line-clamp-2">
                      {req.description}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-medium text-[#23332f]">
                        Needed: {req.quantity} {req.unit}
                      </span>
                      <Link to={`/donor/donations/new?requirementId=${req.id}`}>
                        <Button variant="subtle" size="sm" className="h-7 text-xs">
                          Fulfill
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
