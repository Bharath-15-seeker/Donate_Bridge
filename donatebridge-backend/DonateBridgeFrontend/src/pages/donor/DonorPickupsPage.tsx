import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Truck } from 'lucide-react'
import { donationApi } from '@/api/donation.api'
import { pickupApi } from '@/api/pickup.api'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PickupTimeline } from '@/components/data-display/PickupTimeline'
import type { Donation, Pickup } from '@/types'

const DonorPickupCard: React.FC<{ donation: Donation }> = ({ donation }) => {
  const { data: realPickup } = useQuery({
    queryKey: ['pickup', 'donation', donation.id],
    queryFn: () => pickupApi.getPickupByDonationId(donation.id),
  })

  const effectivePickup: Pickup = realPickup || {
    id: donation.id,
    donationId: donation.id,
    pickupAddress: donation.pickupAddress,
    deliveryAddress: 'Designated NGO Distribution Center',
    status: donation.status === 'COMPLETED'
      ? 'COMPLETED'
      : donation.status === 'DELIVERED'
      ? 'DELIVERED'
      : donation.status === 'PICKED_UP'
      ? 'PICKED_UP'
      : donation.status === 'PICKUP_STARTED'
      ? 'STARTED'
      : 'ASSIGNED',
    assignedAt: donation.updatedAt,
    startedAt: ['PICKUP_STARTED', 'PICKED_UP', 'DELIVERED', 'COMPLETED'].includes(donation.status)
      ? donation.updatedAt
      : undefined,
    pickedUpAt: ['PICKED_UP', 'DELIVERED', 'COMPLETED'].includes(donation.status)
      ? donation.updatedAt
      : undefined,
    deliveredAt: ['DELIVERED', 'COMPLETED'].includes(donation.status)
      ? donation.updatedAt
      : undefined,
    completedAt: donation.status === 'COMPLETED' ? donation.updatedAt : undefined,
  }

  return (
    <Card className="p-6 bg-white border border-[#cfded8] shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#eaf2ef]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f6e8ee] text-[#912f56] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#23332f]">
              <Link to={`/donor/donations/${donation.id}`} className="hover:text-[#912f56]">
                {donation.title}
              </Link>
            </h3>
            <p className="text-xs text-[#66736f]">
              {donation.category} • {donation.quantity} {donation.unit}
            </p>
          </div>
        </div>

        <StatusBadge status={donation.status} />
      </div>

      {/* Render Stepper Timeline */}
      <PickupTimeline pickup={effectivePickup} />
    </Card>
  )
}

export const DonorPickupsPage: React.FC = () => {
  // Fetch donor's donations to find items with accepted/transit status
  const { data: donations = [], isLoading } = useQuery({
    queryKey: ['donations', 'my'],
    queryFn: donationApi.getMyDonations,
  })

  // Filter donations in delivery pipeline
  const activeDonations = donations.filter((d) =>
    ['ACCEPTED', 'PICKUP_ASSIGNED', 'PICKUP_STARTED', 'PICKED_UP', 'DELIVERED', 'COMPLETED'].includes(d.status)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Pickup & Delivery Tracking</h1>
        <p className="text-sm text-[#66736f]">
          Follow the real-time status of your accepted donations from doorstep collection to NGO arrival.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      ) : activeDonations.length === 0 ? (
        <EmptyState
          title="No scheduled pickups right now"
          description="When you accept an NGO request, a pickup timeline will appear here showing when a volunteer is dispatched to collect your donation."
          actionLabel="View My Donations"
          onAction={() => (window.location.href = '/donor/donations')}
        />
      ) : (
        <div className="space-y-6">
          {activeDonations.map((donation) => (
            <DonorPickupCard key={donation.id} donation={donation} />
          ))}
        </div>
      )}
    </div>
  )
}
