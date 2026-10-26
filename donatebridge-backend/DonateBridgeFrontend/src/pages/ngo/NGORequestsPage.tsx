import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Inbox, Clock, CheckCircle2, XCircle, Gift, MessageSquare, ArrowRight } from 'lucide-react'
import { requestApi } from '@/api/request.api'
import { donationApi } from '@/api/donation.api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Tabs } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDateTime } from '@/utils/formatters'

export const NGORequestsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('ALL')

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests', 'my'],
    queryFn: requestApi.getMyRequests,
  })

  // Fetch available donations to display titles
  const { data: donations = [] } = useQuery({
    queryKey: ['donations', 'available'],
    queryFn: donationApi.getAvailableDonations,
  })

  const donationsMap = new Map(donations.map((d) => [d.id, d]))

  const filteredRequests = requests.filter((req) => {
    if (statusFilter === 'ALL') return true
    return req.status === statusFilter
  })

  const tabs = [
    { id: 'ALL', label: 'All Requests', count: requests.length },
    { id: 'PENDING', label: 'Pending', count: requests.filter((r) => r.status === 'PENDING').length },
    { id: 'ACCEPTED', label: 'Accepted', count: requests.filter((r) => r.status === 'ACCEPTED').length },
    { id: 'REJECTED', label: 'Rejected', count: requests.filter((r) => r.status === 'REJECTED').length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#23332f]">My Donation Requests</h1>
          <p className="text-sm text-[#66736f]">
            Track the approval status of items your organization has requested from donors.
          </p>
        </div>
        <Link to="/ngo/donations">
          <Button variant="primary" size="md" leftIcon={<Gift className="w-4 h-4" />}>
            Browse More Items
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={statusFilter}
        onChange={setStatusFilter}
      />

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title={statusFilter === 'ALL' ? 'No requests submitted yet' : `No ${statusFilter.toLowerCase()} requests`}
          description="Browse available donations and submit a request to receive supplies for your charitable programs."
          actionLabel="Browse Available Donations"
          onAction={() => (window.location.href = '/ngo/donations')}
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const donation = donationsMap.get(req.donationId)

            return (
              <Card
                key={req.id}
                className="p-6 bg-white border border-[#cfded8] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6"
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
                      <Link to={`/ngo/donations/${donation.id}`} className="hover:text-[#912f56]">
                        {donation.title}
                      </Link>
                    ) : (
                      `Donation Item #${req.donationId}`
                    )}
                  </h3>

                  {req.message && (
                    <p className="text-xs text-[#66736f] bg-[#fbfdfc] p-2.5 rounded-lg border border-[#eaf2ef]">
                      <strong>Your Note:</strong> &quot;{req.message}&quot;
                    </p>
                  )}

                  <p className="text-[11px] text-[#66736f]">
                    Submitted on {formatDateTime(req.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {req.status === 'ACCEPTED' && (
                    <Link to="/ngo/pickups">
                      <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Track Delivery
                      </Button>
                    </Link>
                  )}

                  {donation && (
                    <Link to={`/ngo/donations/${donation.id}`}>
                      <Button variant="outline" size="sm">
                        View Item
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
