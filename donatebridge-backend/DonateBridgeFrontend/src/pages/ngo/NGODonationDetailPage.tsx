import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Gift,
  ArrowLeft,
  MapPin,
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { donationApi } from '@/api/donation.api'
import { requestApi } from '@/api/request.api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog } from '@/components/ui/dialog'
import { InteractiveMap } from '@/components/data-display/InteractiveMap'
import { formatDate, formatDateTime } from '@/utils/formatters'
import { extractErrorMessage } from '@/api/axios'

export const NGODonationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const donationId = Number(id)

  const { data: donation, isLoading, error } = useQuery({
    queryKey: ['donation', donationId],
    queryFn: () => donationApi.getDonationById(donationId),
    enabled: !isNaN(donationId),
  })

  // Check if already requested
  const { data: myRequests = [] } = useQuery({
    queryKey: ['requests', 'my'],
    queryFn: requestApi.getMyRequests,
  })

  const alreadyRequested = myRequests.some((r) => r.donationId === donationId)

  const requestMutation = useMutation({
    mutationFn: () =>
      requestApi.createRequest({
        donationId,
        message: requestMessage || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['donations', 'available'] })
      setShowRequestDialog(false)
      navigate('/ngo/requests')
    },
    onError: (err) => {
      setActionError(extractErrorMessage(err, 'Failed to submit request.'))
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !donation) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#23332f]">Donation Not Found</h2>
        <Link to="/ngo/donations">
          <Button variant="primary" size="md">
            Back to Available Donations
          </Button>
        </Link>
      </div>
    )
  }

  const images = donation.imageUrls || []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link to="/ngo/donations">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Donations
          </Button>
        </Link>

        {donation.status === 'AVAILABLE' && (
          <Button
            variant={alreadyRequested ? 'subtle' : 'primary'}
            size="md"
            disabled={alreadyRequested}
            leftIcon={<Send className="w-4 h-4" />}
            onClick={() => setShowRequestDialog(true)}
          >
            {alreadyRequested ? 'Already Requested' : 'Request This Donation'}
          </Button>
        )}
      </div>

      {/* Action Error Alert */}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="underline text-red-800">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Detail Card */}
      <Card className="overflow-hidden bg-white border border-[#cfded8] shadow-card">
        {/* Photo Gallery */}
        {images.length > 0 ? (
          <div className="bg-[#f6f9f8] p-4 border-b border-[#eaf2ef]">
            <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-black/5 relative">
              <img
                src={images[activeImageIndex]}
                alt={donation.title}
                className="w-full h-full object-contain"
              />
            </div>
            {images.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      idx === activeImageIndex
                        ? 'border-[#912f56] ring-2 ring-[#912f56]/20'
                        : 'border-[#cfded8] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-44 bg-[#eaf2ef] flex flex-col items-center justify-center text-[#912f56]">
            <Gift className="w-12 h-12 mb-1" />
            <span className="text-xs text-[#66736f]">No images uploaded</span>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#912f56]">
                  {donation.category}
                </span>
                <StatusBadge status={donation.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#23332f]">
                {donation.title}
              </h1>
              <p className="text-xs text-[#66736f] mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Listed on {formatDateTime(donation.createdAt)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#eaf2ef]/70 border border-[#cfded8] text-right space-y-1 sm:min-w-[160px]">
              <p className="text-xs text-[#66736f]">Quantity Available</p>
              <p className="text-lg font-bold text-[#23332f]">
                {donation.quantity} {donation.unit}
              </p>
              <p className="text-[11px] font-semibold text-[#912f56]">
                Condition: {donation.condition}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#23332f] uppercase tracking-wider">
              Description & Item Details
            </h3>
            <p className="text-sm text-[#23332f] whitespace-pre-line leading-relaxed bg-[#fbfdfc] p-4 rounded-xl border border-[#eaf2ef]">
              {donation.description || 'No description provided.'}
            </p>
          </div>

          {/* Pickup Location & Interactive Map */}
          <div className="space-y-3 pt-4 border-t border-[#eaf2ef]">
            <h3 className="font-bold text-sm text-[#23332f] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#912f56]" />
              Donor Pickup Location
            </h3>
            <p className="text-sm font-medium text-[#23332f]">
              {donation.pickupAddress}
            </p>

            <InteractiveMap
              latitude={donation.latitude}
              longitude={donation.longitude}
              title={donation.title}
              address={donation.pickupAddress}
              height="260px"
            />
          </div>
        </div>
      </Card>

      {/* Request Modal Dialog */}
      <Dialog
        isOpen={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        title={`Request "${donation.title}"`}
        description="Submit a request to receive this donation for your organization."
      >
        <div className="space-y-4 pt-2">
          <Textarea
            label="Note to Donor (Optional)"
            placeholder="Explain how your NGO intends to redistribute these items..."
            rows={3}
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eaf2ef]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRequestDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={requestMutation.isPending}
              onClick={() => requestMutation.mutate()}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
