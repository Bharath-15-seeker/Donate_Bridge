import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Building,
  Gift,
  PlusCircle,
  FileText,
  Inbox,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { donationApi } from '@/api/donation.api'
import { requirementApi } from '@/api/requirement.api'
import { requestApi } from '@/api/request.api'
import { ngoApi } from '@/api/ngo.api'
import { useAuth } from '@/hooks/useAuth'
import { StatCard } from '@/components/data-display/StatCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDate } from '@/utils/formatters'

export const NGODashboardPage: React.FC = () => {
  const { user } = useAuth()

  // NGO profile query
  const profileQuery = useQuery({
    queryKey: ['ngo', 'profile'],
    queryFn: ngoApi.getMyProfile,
    retry: 1,
  })

  // Available donations on platform
  const availableDonationsQuery = useQuery({
    queryKey: ['donations', 'available'],
    queryFn: donationApi.getAvailableDonations,
  })

  // NGO's own requirements
  const myRequirementsQuery = useQuery({
    queryKey: ['requirements', 'my'],
    queryFn: requirementApi.getMyRequirements,
  })

  // NGO's own donation requests
  const myRequestsQuery = useQuery({
    queryKey: ['requests', 'my'],
    queryFn: requestApi.getMyRequests,
  })

  const profile = profileQuery.data
  const availableDonations = availableDonationsQuery.data || []
  const myRequirements = myRequirementsQuery.data || []
  const myRequests = myRequestsQuery.data || []

  // Derived metrics from actual backend responses
  const activeRequirementsCount = myRequirements.filter((r) => r.status === 'ACTIVE').length
  const pendingRequestsCount = myRequests.filter((r) => r.status === 'PENDING').length
  const acceptedRequestsCount = myRequests.filter((r) => r.status === 'ACCEPTED').length

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#cfded8] shadow-card">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#23332f] tracking-tight">
              {profile?.organizationName || user?.name || 'NGO Partner'}
            </h1>
            {profile?.verificationStatus && (
              <StatusBadge status={profile.verificationStatus} />
            )}
          </div>
          <p className="text-sm text-[#66736f]">
            Source needed community supplies, post urgent requirements, and coordinate redistribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/ngo/donations">
            <Button variant="primary" size="md" leftIcon={<Gift className="w-4 h-4" />}>
              Browse Donations
            </Button>
          </Link>
          <Link to="/ngo/requirements/new">
            <Button variant="outline" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Post Requirement
            </Button>
          </Link>
        </div>
      </div>

      {/* Verification Notice if Pending */}
      {profile?.verificationStatus === 'PENDING' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">NGO Registration Under Review</span>
            <span>
              Your registration number and non-profit credentials are currently undergoing administrator verification. You can browse donations and create requirements freely.
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
              <span className="font-bold block">Set Up Your NGO Organization Profile</span>
              <span>Submit your registration number and distribution address for official verification.</span>
            </div>
          </div>
          <Link to="/ngo/profile">
            <Button variant="primary" size="sm">
              Complete Profile
            </Button>
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Available Donations"
          value={availableDonationsQuery.isLoading ? '...' : availableDonations.length}
          subtitle="Items ready for request"
          icon={<Gift className="w-5 h-5" />}
          variant="brand"
        />
        <StatCard
          title="Active Requirements"
          value={myRequirementsQuery.isLoading ? '...' : activeRequirementsCount}
          subtitle="Published community needs"
          icon={<FileText className="w-5 h-5" />}
          variant="default"
        />
        <StatCard
          title="Pending Requests"
          value={myRequestsQuery.isLoading ? '...' : pendingRequestsCount}
          subtitle="Awaiting donor approval"
          icon={<Clock className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          title="Accepted / In Delivery"
          value={myRequestsQuery.isLoading ? '...' : acceptedRequestsCount}
          subtitle="Being fulfilled by volunteers"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
        />
      </div>

      {/* Main Content Grid: Available Donations & My Active Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Available Donations Spotlight */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#23332f]">Available Items For Your Community</h2>
            <Link
              to="/ngo/donations"
              className="text-xs font-semibold text-[#912f56] hover:underline flex items-center gap-1"
            >
              Browse all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {availableDonationsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : availableDonations.length === 0 ? (
            <EmptyState
              title="No donations available right now"
              description="There are currently no open donations listed by donors. Post a requirement to signal what your organization needs!"
              actionLabel="Post a Requirement"
              onAction={() => (window.location.href = '/ngo/requirements/new')}
            />
          ) : (
            <div className="space-y-3">
              {availableDonations.slice(0, 5).map((donation) => (
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
                          <Link to={`/ngo/donations/${donation.id}`}>{donation.title}</Link>
                        </h3>
                        <StatusBadge status={donation.status} />
                      </div>
                      <p className="text-xs text-[#66736f] mt-1 line-clamp-1">
                        {donation.category} • {donation.quantity} {donation.unit} • {donation.condition}
                      </p>
                      <span className="text-[11px] text-[#66736f]/80 mt-0.5 block">
                        Location: {donation.pickupAddress}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <Link to={`/ngo/donations/${donation.id}`}>
                      <Button variant="primary" size="sm">
                        Request Item
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: My Requirements Summary */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#23332f]">My Requirements</h2>
            <Link
              to="/ngo/requirements"
              className="text-xs font-semibold text-[#912f56] hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="p-5 bg-white border border-[#cfded8] space-y-4">
            {myRequirementsQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : myRequirements.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="w-8 h-8 text-[#66736f]/40 mx-auto mb-2" />
                <p className="text-xs text-[#66736f]">You haven&apos;t posted any requirements yet.</p>
                <Link to="/ngo/requirements/new" className="inline-block mt-3">
                  <Button variant="outline" size="sm">
                    Post Requirement
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-[#eaf2ef]">
                {myRequirements.slice(0, 4).map((req) => (
                  <div key={req.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-[#23332f] line-clamp-1">
                        {req.title}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-xs text-[#66736f] line-clamp-1">
                      {req.quantity} {req.unit} needed • Urgency: {req.urgency}
                    </p>
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
