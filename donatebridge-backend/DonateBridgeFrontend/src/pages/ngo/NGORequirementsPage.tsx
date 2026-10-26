import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FileText, PlusCircle, Trash2, Edit3, AlertCircle, CheckCircle2 } from 'lucide-react'
import { requirementApi } from '@/api/requirement.api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Tabs } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { formatDate } from '@/utils/formatters'
import type { Requirement } from '@/types'
import { extractErrorMessage } from '@/api/axios'

export const NGORequirementsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedReqToCancel, setSelectedReqToCancel] = useState<Requirement | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: requirements = [], isLoading } = useQuery({
    queryKey: ['requirements', 'my'],
    queryFn: requirementApi.getMyRequirements,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => requirementApi.cancelRequirement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['requirements', 'available'] })
      setSelectedReqToCancel(null)
      setActionError(null)
    },
    onError: (err) => {
      setActionError(extractErrorMessage(err, 'Failed to cancel requirement.'))
    },
  })

  const filtered = requirements.filter((req) => {
    if (statusFilter === 'ALL') return true
    return req.status === statusFilter
  })

  const tabs = [
    { id: 'ALL', label: 'All Requirements', count: requirements.length },
    { id: 'ACTIVE', label: 'Active', count: requirements.filter((r) => r.status === 'ACTIVE').length },
    { id: 'FULFILLED', label: 'Fulfilled', count: requirements.filter((r) => r.status === 'FULFILLED').length },
    { id: 'CANCELLED', label: 'Cancelled', count: requirements.filter((r) => r.status === 'CANCELLED').length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#23332f]">My Posted Requirements</h1>
          <p className="text-sm text-[#66736f]">
            Signal shortages and needed community supplies to donors across the platform.
          </p>
        </div>
        <Link to="/ngo/requirements/new">
          <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Requirement
          </Button>
        </Link>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="underline text-red-800">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={statusFilter} onChange={setStatusFilter} />

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={statusFilter === 'ALL' ? 'No requirements posted yet' : `No ${statusFilter.toLowerCase()} requirements`}
          description="Create a requirement to let donors know what items, quantities, and urgency your beneficiaries need."
          actionLabel="Post Requirement"
          onAction={() => (window.location.href = '/ngo/requirements/new')}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <Card
              key={req.id}
              className="p-6 bg-white border border-[#cfded8] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#912f56] uppercase tracking-wider">
                    {req.category}
                  </span>
                  <StatusBadge status={req.status} />
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    {req.urgency} Urgency
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#23332f]">{req.title}</h3>
                <p className="text-xs text-[#66736f]">{req.description}</p>

                <div className="flex items-center gap-4 text-xs text-[#23332f] pt-1">
                  <span><strong>Needed:</strong> {req.quantity} {req.unit}</span>
                  <span className="text-[#66736f]">Posted on {formatDate(req.createdAt)}</span>
                </div>
              </div>

              {req.status === 'ACTIVE' && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 border-red-200"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={() => setSelectedReqToCancel(req)}
                  >
                    Cancel Requirement
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {selectedReqToCancel && (
        <ConfirmDialog
          isOpen={!!selectedReqToCancel}
          onClose={() => setSelectedReqToCancel(null)}
          title="Cancel Requirement"
          message={`Are you sure you want to cancel the requirement "${selectedReqToCancel.title}"? Donors will no longer see it in active NGO needs.`}
          confirmText="Yes, Cancel"
          isDestructive={true}
          isLoading={cancelMutation.isPending}
          onConfirm={() => cancelMutation.mutate(selectedReqToCancel.id)}
        />
      )}
    </div>
  )
}
