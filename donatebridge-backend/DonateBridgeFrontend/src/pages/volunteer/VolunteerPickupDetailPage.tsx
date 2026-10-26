import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Truck,
  ArrowLeft,
  MapPin,
  Clock,
  Package,
  CheckCircle2,
  AlertCircle,
  Flag,
  Navigation,
} from 'lucide-react'
import { pickupApi } from '@/api/pickup.api'
import { donationApi } from '@/api/donation.api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PickupTimeline } from '@/components/data-display/PickupTimeline'
import { InteractiveMap } from '@/components/data-display/InteractiveMap'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { formatDateTime } from '@/utils/formatters'
import { extractErrorMessage } from '@/api/axios'
import { DonationContactsCard } from '@/components/data-display/DonationContactsCard'

export const VolunteerPickupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    action: 'accept' | 'start' | 'pickedUp' | 'delivered' | 'complete'
    title: string
    message: string
  } | null>(null)

  const pickupId = Number(id)

  const { data: pickup, isLoading, error } = useQuery({
    queryKey: ['pickup', pickupId],
    queryFn: () => pickupApi.getPickupById(pickupId),
    enabled: !isNaN(pickupId),
  })

  // Fetch associated donation for item details & coordinates
  const { data: donation } = useQuery({
    queryKey: ['donation', pickup?.donationId],
    queryFn: () => donationApi.getDonationById(pickup!.donationId),
    enabled: !!pickup?.donationId,
  })

  // Lifecycle mutations
  const acceptMutation = useMutation({
    mutationFn: () => pickupApi.acceptPickup(pickupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup', pickupId] })
      queryClient.invalidateQueries({ queryKey: ['pickups'] })
      setConfirmModal(null)
    },
    onError: (err) => setActionError(extractErrorMessage(err)),
  })

  const startMutation = useMutation({
    mutationFn: () => pickupApi.startPickup(pickupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup', pickupId] })
      queryClient.invalidateQueries({ queryKey: ['pickups'] })
      setConfirmModal(null)
    },
    onError: (err) => setActionError(extractErrorMessage(err)),
  })

  const pickedUpMutation = useMutation({
    mutationFn: () => pickupApi.markPickedUp(pickupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup', pickupId] })
      queryClient.invalidateQueries({ queryKey: ['pickups'] })
      setConfirmModal(null)
    },
    onError: (err) => setActionError(extractErrorMessage(err)),
  })

  const deliveredMutation = useMutation({
    mutationFn: () => pickupApi.markDelivered(pickupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup', pickupId] })
      queryClient.invalidateQueries({ queryKey: ['pickups'] })
      setConfirmModal(null)
    },
    onError: (err) => setActionError(extractErrorMessage(err)),
  })

  const completeMutation = useMutation({
    mutationFn: () => pickupApi.completePickup(pickupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup', pickupId] })
      queryClient.invalidateQueries({ queryKey: ['pickups'] })
      setConfirmModal(null)
    },
    onError: (err) => setActionError(extractErrorMessage(err)),
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !pickup) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#23332f]">Pickup Job Not Found</h2>
        <Link to="/volunteer/pickups/my">
          <Button variant="primary" size="md">
            Back to My Pickups
          </Button>
        </Link>
      </div>
    )
  }

  const isPendingMutation =
    acceptMutation.isPending ||
    startMutation.isPending ||
    pickedUpMutation.isPending ||
    deliveredMutation.isPending ||
    completeMutation.isPending

  const handleConfirmAction = () => {
    if (!confirmModal) return
    setActionError(null)
    switch (confirmModal.action) {
      case 'accept':
        acceptMutation.mutate()
        break
      case 'start':
        startMutation.mutate()
        break
      case 'pickedUp':
        pickedUpMutation.mutate()
        break
      case 'delivered':
        deliveredMutation.mutate()
        break
      case 'complete':
        completeMutation.mutate()
        break
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <Link to="/volunteer/pickups/my">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Deliveries
          </Button>
        </Link>

        {/* Current status tag */}
        <StatusBadge status={pickup.status} />
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

      {/* Main Pickup Card */}
      {donation && <DonationContactsCard donationId={donation.id} title="Donor and NGO contact details" />}
      <Card className="p-6 sm:p-8 bg-white border border-[#cfded8] shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eaf2ef]">
          <div>
            <span className="text-xs font-bold text-[#912f56] uppercase tracking-wider block">
              Pickup Delivery #{pickup.id}
            </span>
            <h1 className="text-2xl font-extrabold text-[#23332f] mt-1">
              {donation ? donation.title : `Donation Item #${pickup.donationId}`}
            </h1>
            {donation && (
              <p className="text-xs text-[#66736f] mt-1">
                Category: {donation.category} • Quantity: {donation.quantity} {donation.unit} • Condition: {donation.condition}
              </p>
            )}
          </div>

          {/* Context-aware action button in card header */}
          <div className="shrink-0">
            {pickup.status === 'ASSIGNED' && !pickup.volunteerId && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() =>
                  setConfirmModal({
                    action: 'accept',
                    title: 'Accept Delivery Assignment',
                    message: 'Take responsibility for picking up this item from the donor and transporting it to the NGO?',
                  })
                }
              >
                Accept Assignment
              </Button>
            )}

            {pickup.status === 'ASSIGNED' && pickup.volunteerId && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<Navigation className="w-4 h-4" />}
                onClick={() =>
                  setConfirmModal({
                    action: 'start',
                    title: 'Start Pickup Journey',
                    message: 'Mark that you have begun transit toward the donor pickup location?',
                  })
                }
              >
                Start Journey (En Route)
              </Button>
            )}

            {pickup.status === 'STARTED' && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<Package className="w-4 h-4" />}
                onClick={() =>
                  setConfirmModal({
                    action: 'pickedUp',
                    title: 'Confirm Items Picked Up',
                    message: 'Confirm that you have arrived at the donor address and safely loaded the items?',
                  })
                }
              >
                Mark Items Picked Up
              </Button>
            )}

            {pickup.status === 'PICKED_UP' && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<MapPin className="w-4 h-4" />}
                onClick={() =>
                  setConfirmModal({
                    action: 'delivered',
                    title: 'Confirm Delivery to NGO',
                    message: 'Confirm that you have arrived at the NGO destination and unloaded the items?',
                  })
                }
              >
                Mark Delivered to NGO
              </Button>
            )}

            {pickup.status === 'DELIVERED' && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<Flag className="w-4 h-4" />}
                onClick={() =>
                  setConfirmModal({
                    action: 'complete',
                    title: 'Complete Pickup Task',
                    message: 'Mark this pickup task as fully complete and closed in the system?',
                  })
                }
              >
                Complete Pickup Task
              </Button>
            )}

            {pickup.status === 'COMPLETED' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Delivery Completed
              </div>
            )}
          </div>
        </div>

        {/* Stepper Timeline */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-[#23332f] uppercase tracking-wider">
            Delivery Lifecycle Progress
          </h3>
          <PickupTimeline pickup={pickup} />
        </div>

        {/* Interactive OpenStreetMap */}
        <div className="space-y-3 pt-4 border-t border-[#eaf2ef]">
          <h3 className="font-bold text-sm text-[#23332f] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#912f56]" />
            Route Coordinates & Map
          </h3>
          <InteractiveMap
            latitude={donation?.latitude}
            longitude={donation?.longitude}
            title={donation?.title || 'Pickup Spot'}
            address={pickup.pickupAddress}
            height="260px"
          />
        </div>
      </Card>

      {/* Confirmation Dialog */}
      {confirmModal && (
        <ConfirmDialog
          isOpen={!!confirmModal}
          onClose={() => setConfirmModal(null)}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="Yes, Proceed"
          isDestructive={false}
          isLoading={isPendingMutation}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  )
}
