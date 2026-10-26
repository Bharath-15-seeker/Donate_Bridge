import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Gift, Search, Trash2 } from 'lucide-react'
import { adminApi } from '@/api/admin.api'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDate } from '@/utils/formatters'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { extractErrorMessage } from '@/api/axios'
import type { Donation } from '@/types'

export const AdminDonationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: donations = [], isLoading } = useQuery({
    queryKey: ['admin', 'donations'],
    queryFn: adminApi.getAllDonations,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteDonation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'donations'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      setSelectedDonation(null)
      setActionError(null)
    },
    onError: (error) => setActionError(extractErrorMessage(error, 'Failed to delete donation.')),
  })

  const filtered = donations.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Platform Donations Monitor</h1>
        <p className="text-sm text-[#66736f]">
          Oversight of all item donations listed across the DonateBridge ecosystem.
        </p>
      </div>

      {actionError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">{actionError}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#cfded8] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search by title, category, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-[#cfded8] bg-white text-xs font-semibold text-[#23332f] focus:ring-2 focus:ring-[#912f56]/20"
        >
          <option value="ALL">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ACCEPTED">Accepted</option>
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
          icon={<Gift className="w-7 h-7" />}
          title="No donations found"
          description="Try adjusting your search criteria."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Donor ID</TableHead>
              <TableHead>Item Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Pickup Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs text-[#66736f]">#{d.id}</TableCell>
                <TableCell className="text-xs text-[#66736f]">Donor #{d.donorId}</TableCell>
                <TableCell className="font-semibold text-[#23332f]">{d.title}</TableCell>
                <TableCell className="text-xs text-[#66736f]">{d.category}</TableCell>
                <TableCell className="text-xs text-[#23332f]">{d.quantity} {d.unit}</TableCell>
                <TableCell className="text-xs text-[#66736f] max-w-xs truncate">{d.pickupAddress}</TableCell>
                <TableCell>
                  <StatusBadge status={d.status} />
                </TableCell>
                <TableCell className="text-xs text-[#66736f]">{formatDate(d.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setSelectedDonation(d)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedDonation && (
        <ConfirmDialog
          isOpen={!!selectedDonation}
          onClose={() => setSelectedDonation(null)}
          title="Delete donation permanently"
          message={`Delete "${selectedDonation.title}" and its related requests/pickup records? This cannot be undone.`}
          confirmText="Delete donation"
          isDestructive
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(selectedDonation.id)}
        />
      )}
    </div>
  )
}
