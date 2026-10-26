import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Gift, ShieldCheck, CheckCircle2, XCircle, Clock, MapPin, Building } from 'lucide-react'
import { adminApi } from '@/api/admin.api'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import type { DonorProfile, VerificationStatus } from '@/types'
import { extractErrorMessage } from '@/api/axios'

export const AdminDonorsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedDonorAction, setSelectedDonorAction] = useState<{
    donor: DonorProfile
    status: VerificationStatus
  } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: donors = [], isLoading } = useQuery({
    queryKey: ['admin', 'donors'],
    queryFn: adminApi.getAllDonors,
  })

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: VerificationStatus }) =>
      adminApi.verifyDonor(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'donors'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      setSelectedDonorAction(null)
      setActionError(null)
    },
    onError: (err) => {
      setActionError(extractErrorMessage(err, 'Failed to update donor verification status.'))
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Donor Verification Governance</h1>
        <p className="text-sm text-[#66736f]">
          Review donor organizations and individuals to ensure safe, authentic community redistribution.
        </p>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="underline text-red-800">Dismiss</button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : donors.length === 0 ? (
        <EmptyState
          icon={<Gift className="w-7 h-7" />}
          title="No donor profiles registered"
          description="Registered donors who set up their profiles will appear here for verification review."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profile ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Organization / Group</TableHead>
              <TableHead>Pickup Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Verification Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donors.map((donor) => (
              <TableRow key={donor.id}>
                <TableCell className="font-mono text-xs text-[#66736f]">#{donor.id}</TableCell>
                <TableCell className="text-xs text-[#66736f]">User #{donor.userId}</TableCell>
                <TableCell className="font-semibold text-[#23332f]">
                  {donor.organizationName || 'Individual Donor'}
                </TableCell>
                <TableCell className="text-xs text-[#66736f] max-w-xs truncate">
                  {donor.address || '—'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={donor.verificationStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {donor.verificationStatus !== 'VERIFIED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                        onClick={() => setSelectedDonorAction({ donor, status: 'VERIFIED' })}
                      >
                        Verify
                      </Button>
                    )}
                    {donor.verificationStatus !== 'REJECTED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-red-600 hover:bg-red-50"
                        onClick={() => setSelectedDonorAction({ donor, status: 'REJECTED' })}
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedDonorAction && (
        <ConfirmDialog
          isOpen={!!selectedDonorAction}
          onClose={() => setSelectedDonorAction(null)}
          title={`Mark Donor as ${selectedDonorAction.status}`}
          message={`Are you sure you want to change Donor Profile #${selectedDonorAction.donor.id} verification status to ${selectedDonorAction.status}?`}
          confirmText={`Confirm ${selectedDonorAction.status}`}
          isDestructive={selectedDonorAction.status === 'REJECTED'}
          isLoading={verifyMutation.isPending}
          onConfirm={() =>
            verifyMutation.mutate({
              id: selectedDonorAction.donor.id!,
              status: selectedDonorAction.status,
            })
          }
        />
      )}
    </div>
  )
}
