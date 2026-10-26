import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Truck, MapPin, CheckCircle2, AlertCircle, ArrowRight, Package } from 'lucide-react'
import { pickupApi } from '@/api/pickup.api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { formatDateTime } from '@/utils/formatters'
import { extractErrorMessage } from '@/api/axios'
import type { Pickup } from '@/types'

export const VolunteerAvailablePickupsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [selectedPickupToAccept, setSelectedPickupToAccept] = useState<Pickup | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: pickups = [], isLoading } = useQuery({
    queryKey: ['pickups', 'available'],
    queryFn: pickupApi.getAvailablePickups,
  })

  // Filter only pickups that are not yet assigned to a volunteer
  const unassignedPickups = pickups.filter((p) => !p.volunteerId && p.status === 'ASSIGNED')

  const acceptMutation = useMutation({
    mutationFn: (id: number) => pickupApi.acceptPickup(id),
    onSuccess: (updatedPickup) => {
      queryClient.invalidateQueries({ queryKey: ['pickups', 'available'] })
      queryClient.invalidateQueries({ queryKey: ['pickups', 'my'] })
      setSelectedPickupToAccept(null)
      navigate(`/volunteer/pickups/${updatedPickup.id}`)
    },
    onError: (err) => {
      setActionError(extractErrorMessage(err, 'Failed to accept pickup. It may have already been claimed.'))
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Available Pickup Assignments</h1>
        <p className="text-sm text-[#66736f]">
          Review requests that donors have approved and are waiting for volunteer transportation to the receiving NGO.
        </p>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            {actionError}
          </span>
          <button onClick={() => setActionError(null)} className="underline text-red-800">
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : unassignedPickups.length === 0 ? (
        <EmptyState
          icon={<Package className="w-7 h-7" />}
          title="No open pickup assignments available"
          description="All active donation requests are currently assigned or in transit. Check back soon for new dispatches!"
          actionLabel="View My Active Deliveries"
          onAction={() => navigate('/volunteer/pickups/my')}
        />
      ) : (
        <div className="space-y-4">
          {unassignedPickups.map((pickup) => (
            <Card
              key={pickup.id}
              className="p-6 bg-white border border-[#cfded8] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#912f56]/40 transition-all"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#912f56] uppercase tracking-wider">
                    Dispatch Job #{pickup.id}
                  </span>
                  <StatusBadge status={pickup.status} />
                  <span className="text-[11px] text-[#66736f]">
                    Requested on {formatDateTime(pickup.assignedAt)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#eaf2ef]/60 border border-[#cfded8]/60 text-xs">
                  <div>
                    <span className="font-bold text-[#66736f] block mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#912f56]" />
                      Pickup From (Donor):
                    </span>
                    <span className="font-medium text-[#23332f]">{pickup.pickupAddress}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#66736f] block mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Deliver To (NGO):
                    </span>
                    <span className="font-medium text-[#23332f]">{pickup.deliveryAddress}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link to={`/volunteer/pickups/${pickup.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => setSelectedPickupToAccept(pickup)}
                >
                  Accept Pickup
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      {selectedPickupToAccept && (
        <ConfirmDialog
          isOpen={!!selectedPickupToAccept}
          onClose={() => setSelectedPickupToAccept(null)}
          title="Accept Delivery Assignment"
          message={`Are you ready to take responsibility for Pickup #${selectedPickupToAccept.id}? You will collect the items from ${selectedPickupToAccept.pickupAddress} and deliver them to ${selectedPickupToAccept.deliveryAddress}.`}
          confirmText="Yes, Accept Assignment"
          isDestructive={false}
          isLoading={acceptMutation.isPending}
          onConfirm={() => acceptMutation.mutate(selectedPickupToAccept.id)}
        />
      )}
    </div>
  )
}
