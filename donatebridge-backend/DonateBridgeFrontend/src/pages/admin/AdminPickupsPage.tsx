import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Truck, Search } from 'lucide-react'
import { adminApi } from '@/api/admin.api'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDateTime } from '@/utils/formatters'

export const AdminPickupsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('ALL')

  const { data: pickups = [], isLoading } = useQuery({
    queryKey: ['admin', 'pickups'],
    queryFn: adminApi.getAllPickups,
  })

  const filtered = pickups.filter((p) => {
    if (statusFilter === 'ALL') return true
    return p.status === statusFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Delivery Pickups Monitor</h1>
        <p className="text-sm text-[#66736f]">
          Track volunteer courier progress across all door-to-door transit routes.
        </p>
      </div>

      <div className="flex justify-end bg-white p-4 rounded-2xl border border-[#cfded8] shadow-sm">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-[#cfded8] bg-white text-xs font-semibold text-[#23332f] focus:ring-2 focus:ring-[#912f56]/20"
        >
          <option value="ALL">All Statuses</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="STARTED">Started</option>
          <option value="PICKED_UP">Picked Up</option>
          <option value="DELIVERED">Delivered</option>
          <option value="COMPLETED">Completed</option>
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
          icon={<Truck className="w-7 h-7" />}
          title="No pickups found"
          description="Try selecting a different status filter."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pickup ID</TableHead>
              <TableHead>Donation ID</TableHead>
              <TableHead>Volunteer ID</TableHead>
              <TableHead>Donor Pickup Location</TableHead>
              <TableHead>NGO Destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs text-[#66736f]">#{p.id}</TableCell>
                <TableCell className="text-xs text-[#23332f]">Item #{p.donationId}</TableCell>
                <TableCell className="text-xs text-[#66736f]">
                  {p.volunteerId ? `Volunteer #${p.volunteerId}` : <span className="text-amber-600 font-semibold">Unclaimed</span>}
                </TableCell>
                <TableCell className="text-xs text-[#66736f] max-w-xs truncate">{p.pickupAddress}</TableCell>
                <TableCell className="text-xs text-[#66736f] max-w-xs truncate">{p.deliveryAddress}</TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell className="text-xs text-[#66736f]">
                  {formatDateTime(p.assignedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
