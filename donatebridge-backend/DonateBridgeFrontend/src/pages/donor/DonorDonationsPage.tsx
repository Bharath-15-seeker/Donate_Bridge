import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Gift,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Trash2,
  AlertTriangle,
  LayoutGrid,
  List,
} from 'lucide-react'
import { donationApi } from '@/api/donation.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Tabs } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { formatDate } from '@/utils/formatters'
import type { Donation, DonationStatus } from '@/types'
import { extractErrorMessage } from '@/api/axios'

export const DonorDonationsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedDonationToDelete, setSelectedDonationToDelete] = useState<Donation | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: donations = [], isLoading, error } = useQuery({
    queryKey: ['donations', 'my'],
    queryFn: donationApi.getMyDonations,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => donationApi.deleteDonation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations', 'my'] })
      setSelectedDonationToDelete(null)
      setActionError(null)
    },
    onError: (err) => {
      setActionError(extractErrorMessage(err, 'Failed to delete donation'))
    },
  })

  // Filter donations
  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (donation.description && donation.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus =
      statusFilter === 'ALL' || donation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusTabs = [
    { id: 'ALL', label: 'All Items', count: donations.length },
    { id: 'AVAILABLE', label: 'Available', count: donations.filter((d) => d.status === 'AVAILABLE').length },
    { id: 'ACCEPTED', label: 'Accepted', count: donations.filter((d) => d.status === 'ACCEPTED').length },
    { id: 'COMPLETED', label: 'Completed', count: donations.filter((d) => d.status === 'COMPLETED').length },
    { id: 'CANCELLED', label: 'Cancelled', count: donations.filter((d) => d.status === 'CANCELLED').length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#23332f]">My Donations</h1>
          <p className="text-sm text-[#66736f]">
            Manage all the items you have listed for community redistribution.
          </p>
        </div>
        <Link to="/donor/donations/new">
          <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Donation
          </Button>
        </Link>
      </div>

      {/* Action Error Alert */}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="underline text-red-800">Dismiss</button>
        </div>
      )}

      {/* Filter Bar & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#cfded8] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search by title, category, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3">
          <Tabs
            tabs={statusTabs}
            activeTab={statusFilter}
            onChange={setStatusFilter}
          />

          <div className="hidden sm:flex items-center border border-[#cfded8] rounded-xl overflow-hidden p-0.5 bg-[#eaf2ef]/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-[#912f56] shadow-sm' : 'text-[#66736f]'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-[#912f56] shadow-sm' : 'text-[#66736f]'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Donation Items */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : filteredDonations.length === 0 ? (
        <EmptyState
          title={searchTerm || statusFilter !== 'ALL' ? 'No matching donations found' : 'No donations listed yet'}
          description={
            searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your search terms or filter criteria.'
              : 'Start by offering useful items you no longer need to vetted non-profits in your area.'
          }
          actionLabel="Create Donation"
          onAction={() => (window.location.href = '/donor/donations/new')}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((donation) => (
            <Card
              key={donation.id}
              className="overflow-hidden bg-white border border-[#cfded8] hover:shadow-elevated transition-all flex flex-col"
            >
              {/* Image Preview */}
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
                    <span className="text-[11px] text-[#66736f]">No Image Uploaded</span>
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

                <div className="pt-2 border-t border-[#eaf2ef] flex items-center justify-between text-xs text-[#23332f]">
                  <span>
                    <strong>Quantity:</strong> {donation.quantity} {donation.unit}
                  </span>
                  <span>
                    <strong>Condition:</strong> {donation.condition}
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <Link to={`/donor/donations/${donation.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                      View
                    </Button>
                  </Link>

                  {(donation.status === 'AVAILABLE' || donation.status === 'CANCELLED') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete Donation Permanently"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setSelectedDonationToDelete(donation)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* List / Table View */
        <div className="rounded-2xl border border-[#cfded8] bg-white overflow-hidden shadow-card">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#f3f7f5] border-b border-[#cfded8] text-[#23332f] uppercase text-[11px] font-semibold">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Condition</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaf2ef]">
              {filteredDonations.map((donation) => (
                <tr key={donation.id} className="hover:bg-[#f6f9f8] transition-colors">
                  <td className="p-4 font-semibold text-[#23332f]">
                    <Link to={`/donor/donations/${donation.id}`} className="hover:text-[#912f56]">
                      {donation.title}
                    </Link>
                  </td>
                  <td className="p-4 text-[#66736f]">{donation.category}</td>
                  <td className="p-4 text-[#23332f]">{donation.quantity} {donation.unit}</td>
                  <td className="p-4 text-[#66736f]">{donation.condition}</td>
                  <td className="p-4">
                    <StatusBadge status={donation.status} />
                  </td>
                  <td className="p-4 text-[#66736f]">{formatDate(donation.createdAt)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/donor/donations/${donation.id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          Details
                        </Button>
                      </Link>
                      {(donation.status === 'AVAILABLE' || donation.status === 'CANCELLED') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-red-600 hover:bg-red-50"
                          onClick={() => setSelectedDonationToDelete(donation)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Dialog for Permanent Deletion */}
      {selectedDonationToDelete && (
        <ConfirmDialog
          isOpen={!!selectedDonationToDelete}
          onClose={() => setSelectedDonationToDelete(null)}
          title="Delete Donation Permanently"
          message={`Are you sure you want to permanently delete "${selectedDonationToDelete.title}"? It will be removed from your donations and active listings. Donations with an accepted request or active delivery cannot be deleted.`}
          confirmText="Yes, Delete Donation"
          isDestructive={true}
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(selectedDonationToDelete.id)}
        />
      )}
    </div>
  )
}
