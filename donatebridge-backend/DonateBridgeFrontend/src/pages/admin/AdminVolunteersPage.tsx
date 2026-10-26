import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Truck, ShieldCheck, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { adminApi } from '@/api/admin.api'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import type { VerificationStatus, VolunteerProfile } from '@/types'
import { extractErrorMessage } from '@/api/axios'

export const AdminVolunteersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedVolunteerAction, setSelectedVolunteerAction] = useState<{
    volunteer: VolunteerProfile
    status: VerificationStatus
  } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: volunteers = [], isLoading } = useQuery({
    queryKey: ['admin', 'volunteers'],
    queryFn: adminApi.getAllVolunteers,
  })

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: VerificationStatus }) =>
      adminApi.verifyVolunteer(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'volunteers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      setSelectedVolunteerAction(null)
      setActionError(null)
    },
    onError: (err) => {
      setActionError(extractErrorMessage(err, 'Failed to update volunteer verification status.'))
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Volunteer Courier Verification</h1>
        <p className="text-sm text-[#66736f]">
          Validate delivery volunteer transport vehicles and driving readiness for safe doorstep dispatching.
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
      ) : volunteers.length === 0 ? (
        <EmptyState
          icon={<Truck className="w-7 h-7" />}
          title="No volunteer profiles registered"
          description="Volunteers who complete their registration and vehicle profiles will appear here for review."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profile ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Vehicle Type</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Duty Status</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {volunteers.map((vol) => (
              <TableRow key={vol.id}>
                <TableCell className="font-mono text-xs text-[#66736f]">#{vol.id}</TableCell>
                <TableCell className="text-xs text-[#66736f]">User #{vol.userId}</TableCell>
                <TableCell className="font-semibold text-[#23332f]">
                  {vol.vehicleType || 'Not specified'}
                </TableCell>
                <TableCell className="font-mono text-xs text-[#912f56] font-semibold">
                  {vol.vehicleNumber || '—'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={vol.availabilityStatus} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={vol.verificationStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {vol.verificationStatus !== 'VERIFIED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                        onClick={() => setSelectedVolunteerAction({ volunteer: vol, status: 'VERIFIED' })}
                      >
                        Verify Volunteer
                      </Button>
                    )}
                    {vol.verificationStatus !== 'REJECTED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-red-600 hover:bg-red-50"
                        onClick={() => setSelectedVolunteerAction({ volunteer: vol, status: 'REJECTED' })}
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

      {selectedVolunteerAction && (
        <ConfirmDialog
          isOpen={!!selectedVolunteerAction}
          onClose={() => setSelectedVolunteerAction(null)}
          title={`Update Volunteer Status to ${selectedVolunteerAction.status}`}
          message={`Are you sure you want to mark Volunteer #${selectedVolunteerAction.volunteer.id} as ${selectedVolunteerAction.status}?`}
          confirmText={`Confirm ${selectedVolunteerAction.status}`}
          isDestructive={selectedVolunteerAction.status === 'REJECTED'}
          isLoading={verifyMutation.isPending}
          onConfirm={() =>
            verifyMutation.mutate({
              id: selectedVolunteerAction.volunteer.id!,
              status: selectedVolunteerAction.status,
            })
          }
        />
      )}
    </div>
  )
}
