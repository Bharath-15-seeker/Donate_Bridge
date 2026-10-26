import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Gift,
  ArrowLeft,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Trash2,
  Edit3,
  FileText,
  AlertCircle,
  Truck,
} from 'lucide-react'
import { donationApi } from '@/api/donation.api'
import { requirementApi } from '@/api/requirement.api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { InteractiveMap } from '@/components/data-display/InteractiveMap'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { formatDate, formatDateTime } from '@/utils/formatters'
import { extractErrorMessage } from '@/api/axios'

export const DonorDonationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const donationId = Number(id)

  const { data: donation, isLoading, error } = useQuery({
    queryKey: ['donation', donationId],
    queryFn: () => donationApi.getDonationById(donationId),
    enabled: !isNaN(donationId),
  })

  // Linked requirement details if present
  const { data: linkedRequirement } = useQuery({
    queryKey: ['requirement', donation?.requirementId],
    queryFn: () => requirementApi.getRequirementById(donation!.requirementId!),
    enabled: !!donation?.requirementId,
  })

  const deleteMutation = useMutation({
    mutationFn: () => donationApi.deleteDonation(donationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations', 'my'] })
      setShowDeleteDialog(false)
      navigate('/donor/donations')
    },
    onError: (err) => {
      setActionError(extractErrorMessage(err, 'Failed to delete donation'))
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
        <p className="text-sm text-[#66736f]">
          This donation may have been removed or does not belong to your account.
        </p>
        <Link to="/donor/donations">
          <Button variant="primary" size="md">
            Back to My Donations
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
        <Link to="/donor/donations">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Donations
          </Button>
        </Link>

        {(donation.status === 'AVAILABLE' || donation.status === 'CANCELLED') && (
          <Button
            variant="destructive"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Donation
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
        {/* Gallery / Image Display */}
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

        {/* Content Body */}
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

            {/* Quick Specs Pill */}
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
              Description & Item Notes
            </h3>
            <p className="text-sm text-[#23332f] whitespace-pre-line leading-relaxed bg-[#fbfdfc] p-4 rounded-xl border border-[#eaf2ef]">
              {donation.description || 'No description provided.'}
            </p>
          </div>

          {/* Associated Requirement */}
          {linkedRequirement && (
            <div className="p-4 rounded-2xl bg-[#f6e8ee]/60 border border-[#eed1dd] space-y-2">
              <span className="text-xs font-bold text-[#912f56] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Linked to NGO Requirement
              </span>
              <p className="text-sm font-semibold text-[#23332f]">
                {linkedRequirement.title}
              </p>
              <p className="text-xs text-[#66736f]">
                Category: {linkedRequirement.category} • Urgency: {linkedRequirement.urgency}
              </p>
            </div>
          )}

          {/* Pickup Address & Interactive Map */}
          <div className="space-y-3 pt-4 border-t border-[#eaf2ef]">
            <h3 className="font-bold text-sm text-[#23332f] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#912f56]" />
              Pickup Location
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

      {/* Permanent Deletion Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete This Donation Permanently"
        message="Are you sure you want to permanently delete this donation? It will be removed from your donation list and active listings. Donations with accepted requests or an active delivery cannot be deleted."
        confirmText="Yes, Delete"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  )
}
