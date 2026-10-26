import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Truck } from 'lucide-react'
import { requestApi } from '@/api/request.api'
import { donationApi } from '@/api/donation.api'
import { pickupApi } from '@/api/pickup.api'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PickupTimeline } from '@/components/data-display/PickupTimeline'
import type { DonationRequest, Pickup } from '@/types'
import { DonationContactsCard } from '@/components/data-display/DonationContactsCard'

const NGOPickupCard: React.FC<{ request: DonationRequest }> = ({ request }) => {
  const { data: donation } = useQuery({
    queryKey: ['donation', request.donationId],
    queryFn: () => donationApi.getDonationById(request.donationId),
  })

  const { data: realPickup } = useQuery({
    queryKey: ['pickup', 'donation', request.donationId],
    queryFn: () => pickupApi.getPickupByDonationId(request.donationId),
  })

  const effectivePickup: Pickup = realPickup || {
    id: request.id,
    donationId: request.donationId,
    pickupAddress: donation?.pickupAddress || 'Donor Address',
    deliveryAddress: 'NGO Distribution Center',
    status: 'ASSIGNED',
    assignedAt: request.updatedAt || request.createdAt,
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
              {donation ? donation.title : `Donation Item #${request.donationId}`}
            </h3>
            <p className="text-xs text-[#66736f]">
              Request #{request.id} • Volunteer transit tracking
            </p>
          </div>
        </div>

        <StatusBadge status={effectivePickup.status || 'ACCEPTED'} />
      </div>

      {/* Read-Only Timeline for NGO */}
      <PickupTimeline pickup={effectivePickup} />
      <DonationContactsCard donationId={request.donationId} title="Donor and assigned volunteer contact details" />
    </Card>
  )
}

export const NGOPickupsPage: React.FC = () => {
  // Fetch NGO's requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests', 'my'],
    queryFn: requestApi.getMyRequests,
  })

  // Accepted requests are the ones with scheduled deliveries
  const acceptedRequests = requests.filter((r) => r.status === 'ACCEPTED')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Delivery & Fulfillment Tracking</h1>
        <p className="text-sm text-[#66736f]">
          Monitor incoming shipments accepted by donors and handled by volunteer delivery couriers.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      ) : acceptedRequests.length === 0 ? (
        <EmptyState
          title="No incoming deliveries scheduled"
          description="When a donor accepts one of your donation requests, an automated volunteer pickup will be scheduled and tracked here."
          actionLabel="View My Requests"
          onAction={() => (window.location.href = '/ngo/requests')}
        />
      ) : (
        <div className="space-y-6">
          {acceptedRequests.map((req) => (
            <NGOPickupCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  )
}
