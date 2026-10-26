import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  Gift,
  AlertCircle,
  MessageSquare,
} from 'lucide-react'
import { requestApi } from '@/api/request.api'
import { donationApi } from '@/api/donation.api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { formatDate, formatDateTime } from '@/utils/formatters'
import { extractErrorMessage } from '@/api/axios'
import type { DonationRequest } from '@/types'
import { DonationContactsCard } from '@/components/data-display/DonationContactsCard'

export const DonorRequestsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedRequestToAccept, setSelectedRequestToAccept] = useState<DonationRequest | null>(null)
  const [selectedRequestToReject, setSelectedRequestToReject] = useState<DonationRequest | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Fetch incoming requests
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['requests', 'donor'],
    queryFn: requestApi.getMyRequests,
  })

  // Fetch donor's donations to cross-reference titles
  const { data: donations = [] } = useQuery({
    queryKey: ['donations', 'my'],
    queryFn: donationApi.getMyDonations,
  })

  const donationsMap = new Map(donations.map((d) => [d.id, d]))

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: (id: number) => requestApi.acceptRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['donations', 'my'] })
      setSelectedRequestToAccept(null)
      setActionError(null)
    },
    onError: (err) => {
      setActionError(extractErrorMessage(err, 'Failed to accept request'))
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (id: number) => requestApi.rejectRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['donations', 'my'] })
      setSelectedRequestToReject(null)
      setActionError(null)
    },
    onError: (err) => {
      setActionError(extractErrorMessage(err, 'Failed to reject request'))
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Incoming Donation Requests</h1>
        <p className="text-sm text-[#66736f]">
          Review requests from verified NGOs seeking your listed items. When you accept a request, a volunteer pickup will be automatically initiated.
        </p>
      </div>

      {/* Action Error Alert */}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="underline text-red-800">Dismiss</button>
        </div>
      )}

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No incoming requests yet"
          description="When a verified NGO finds your listed donations and submits a redistribution request, it will appear here for your review."
          actionLabel="View My Listed Items"
          onAction={() => (window.location.href = '/donor/donations')}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const donation = donationsMap.get(req.donationId)
            const isPending = req.status === 'PENDING'

            return (
              <Card
                key={req.id}
                className="p-6 bg-white border border-[#cfded8] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#912f56] uppercase tracking-wider">
                      Request #{req.id}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>

                  <h3 className="text-base font-bold text-[#23332f]">
                    {donation ? (
                      <Link to={`/donor/donations/${donation.id}`} className="hover:text-[#912f56] transition-colors">
                        {donation.title}
                      </Link>
                    ) : (
                      `Donation Item #${req.donationId}`
                    )}
                  </h3>

                  {req.message && (
                    <div className="p-3 rounded-xl bg-[#fbfdfc] border border-[#eaf2ef] text-xs text-[#23332f] flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-[#912f56] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-[#66736f]">Message from NGO:</span>
                        <span>{req.message}</span>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-[#66736f]">
                    Received on {formatDateTime(req.createdAt)}
                  </p>
                  <DonationContactsCard donationId={req.donationId} title="Requesting NGO profile and contact" />
                </div>

                {/* Accept / Reject Action Buttons */}
                {isPending && (
                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-700 hover:bg-red-50 border-red-200"
                      leftIcon={<XCircle className="w-4 h-4" />}
                      onClick={() => setSelectedRequestToReject(req)}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() => setSelectedRequestToAccept(req)}
                    >
                      Accept Request
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Accept Confirmation Dialog */}
      {selectedRequestToAccept && (
        <ConfirmDialog
          isOpen={!!selectedRequestToAccept}
          onClose={() => setSelectedRequestToAccept(null)}
          title="Accept Donation Request"
          message="By accepting this request, the item will be reserved for this NGO, and a volunteer pickup dispatch will be created automatically. Proceed?"
          confirmText="Yes, Accept Request"
          isDestructive={false}
          isLoading={acceptMutation.isPending}
          onConfirm={() => acceptMutation.mutate(selectedRequestToAccept.id)}
        />
      )}

      {/* Reject Confirmation Dialog */}
      {selectedRequestToReject && (
        <ConfirmDialog
          isOpen={!!selectedRequestToReject}
          onClose={() => setSelectedRequestToReject(null)}
          title="Decline Donation Request"
          message="Are you sure you want to decline this request? The donation will remain available for other verified non-profits to request."
          confirmText="Decline Request"
          isDestructive={true}
          isLoading={rejectMutation.isPending}
          onConfirm={() => rejectMutation.mutate(selectedRequestToReject.id)}
        />
      )}
    </div>
  )
}
