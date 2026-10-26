import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Inbox, Search } from 'lucide-react'
import { adminApi } from '@/api/admin.api'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDateTime } from '@/utils/formatters'

export const AdminRequestsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('ALL')

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin', 'requests'],
    queryFn: adminApi.getAllRequests,
  })

  const filtered = requests.filter((r) => {
    if (statusFilter === 'ALL') return true
    return r.status === statusFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Donation Requests Monitor</h1>
        <p className="text-sm text-[#66736f]">
          Oversight of all match requests submitted between NGOs and donors.
        </p>
      </div>

      <div className="flex justify-end bg-white p-4 rounded-2xl border border-[#cfded8] shadow-sm">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-[#cfded8] bg-white text-xs font-semibold text-[#23332f] focus:ring-2 focus:ring-[#912f56]/20"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox className="w-7 h-7" />}
          title="No requests found"
          description="Try selecting a different status filter."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Donation ID</TableHead>
              <TableHead>NGO ID</TableHead>
              <TableHead>NGO Note</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-mono text-xs text-[#66736f]">#{req.id}</TableCell>
                <TableCell className="text-xs text-[#23332f]">Item #{req.donationId}</TableCell>
                <TableCell className="text-xs text-[#66736f]">NGO #{req.ngoId}</TableCell>
                <TableCell className="text-xs text-[#23332f] max-w-xs truncate">
                  {req.message || '—'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={req.status} />
                </TableCell>
                <TableCell className="text-xs text-[#66736f]">
                  {formatDateTime(req.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
