import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Gift,
  Search,
  Filter,
  Eye,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from 'lucide-react'
import { donationApi } from '@/api/donation.api'
import { requestApi } from '@/api/request.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Dialog } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDate } from '@/utils/formatters'
import type { Donation } from '@/types'
import { extractErrorMessage } from '@/api/axios'

export const NGOBrowseDonationsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [requestMessage, setRequestMessage] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch available donations
  const { data: donations = [], isLoading } = useQuery({
    queryKey: ['donations', 'available'],
    queryFn: donationApi.getAvailableDonations,
  })

  // Fetch my requests to highlight items already requested
  const { data: myRequests = [] } = useQuery({
    queryKey: ['requests', 'my'],
    queryFn: requestApi.getMyRequests,
  })

  const requestedDonationIds = new Set(myRequests.map((r) => r.donationId))

  const requestMutation = useMutation({
    mutationFn: ({ donationId, message }: { donationId: number; message: string }) =>
      requestApi.createRequest({ donationId, message: message || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['donations', 'available'] })
      setSelectedDonation(null)
      setRequestMessage('')
      setSuccessMessage('Your request has been submitted to the donor!')
      setTimeout(() => setSuccessMessage(null), 4000)
    },
    onError: (err) => {
      setActionError(extractErrorMessage(err, 'Failed to submit request. You may have already requested this item.'))
    },
  })

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (donation.description && donation.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory =
      categoryFilter === 'ALL' || donation.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const categories = ['ALL', ...Array.from(new Set(donations.map((d) => d.category))).filter(Boolean)]

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDonation) return
    setActionError(null)
    requestMutation.mutate({
      donationId: selectedDonation.id,
      message: requestMessage,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Browse Available Donations</h1>
        <p className="text-sm text-[#66736f]">
          Find and claim items donated by individuals and organizations for your community.
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

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

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#cfded8] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search items by name, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#912f56] text-white shadow-sm'
                  : 'bg-[#eaf2ef] text-[#23332f] hover:bg-[#dce8e4]'
              }`}
            >
              {cat === 'ALL' ? 'All Items' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Donation Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : filteredDonations.length === 0 ? (
        <EmptyState
          title="No available donations found"
          description={
            searchTerm || categoryFilter !== 'ALL'
              ? 'Try clearing your search terms or filters.'
              : 'Donors have not listed any new items recently. Check back soon or post a requirement for your needs.'
          }
          actionLabel="Post a Requirement"
          onAction={() => (window.location.href = '/ngo/requirements/new')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((donation) => {
            const alreadyRequested = requestedDonationIds.has(donation.id)

            return (
              <Card
                key={donation.id}
                className="overflow-hidden bg-white border border-[#cfded8] hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                {/* Image */}
                <div className="h-44 w-full bg-[#eaf2ef] relative overflow-hidden">
                  {donation.imageUrls && donation.imageUrls.length > 0 ? (
                    <img
                      src={donation.imageUrls[0]}
                      alt={donation.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#912f56]">
                      <Gift className="w-10 h-10 mb-1" />
                      <span className="text-[11px] text-[#66736f]">No Photo</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={donation.status} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#66736f] mb-1">
                      <span className="font-semibold uppercase tracking-wider text-[#912f56]">
                        {donation.category}
                      </span>
                      <span>{formatDate(donation.createdAt)}</span>
                    </div>
                    <h3 className="font-bold text-base text-[#23332f] line-clamp-1">
                      {donation.title}
                    </h3>
                    <p className="text-xs text-[#66736f] line-clamp-2 mt-1">
                      {donation.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#eaf2ef] text-xs text-[#23332f]">
                    <div className="flex items-center justify-between">
                      <span><strong>Quantity:</strong> {donation.quantity} {donation.unit}</span>
                      <span><strong>Condition:</strong> {donation.condition}</span>
                    </div>
                    <p className="text-[11px] text-[#66736f] flex items-center gap-1 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-[#912f56] shrink-0" />
                      {donation.pickupAddress}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <Link to={`/ngo/donations/${donation.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        Details
                      </Button>
                    </Link>

                    <Button
                      variant={alreadyRequested ? 'subtle' : 'primary'}
                      size="sm"
                      className="flex-1"
                      disabled={alreadyRequested}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setSelectedDonation(donation)
                        setActionError(null)
                      }}
                    >
                      {alreadyRequested ? 'Requested' : 'Request'}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Request Modal Dialog */}
      {selectedDonation && (
        <Dialog
          isOpen={!!selectedDonation}
          onClose={() => setSelectedDonation(null)}
          title={`Request "${selectedDonation.title}"`}
          description="Submit a redistribution request to the donor. Once accepted, a volunteer pickup will be scheduled."
        >
          <form onSubmit={handleSubmitRequest} className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-[#eaf2ef]/70 text-xs text-[#23332f] space-y-1">
              <p><strong>Item:</strong> {selectedDonation.title}</p>
              <p><strong>Quantity:</strong> {selectedDonation.quantity} {selectedDonation.unit}</p>
              <p><strong>Pickup Location:</strong> {selectedDonation.pickupAddress}</p>
            </div>

            <Textarea
              label="Optional Note to Donor"
              placeholder="Explain how this donation will help your beneficiaries or any delivery requirements..."
              rows={3}
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eaf2ef]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedDonation(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={requestMutation.isPending}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit Request
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  )
}
