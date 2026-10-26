import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building, ShieldCheck, CheckCircle2, XCircle, FileCheck, MapPin } from 'lucide-react'
import { adminApi } from '@/api/admin.api'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import type { NGOProfile, VerificationStatus } from '@/types'
import { extractErrorMessage } from '@/api/axios'

export const AdminNGOsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedNGOAction, setSelectedNGOAction] = useState<{
    ngo: NGOProfile
    status: VerificationStatus
  } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: ngos = [], isLoading } = useQuery({
    queryKey: ['admin', 'ngos'],
    queryFn: adminApi.getAllNgos,
  })

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: VerificationStatus }) =>
      adminApi.verifyNgo(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ngos'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      setSelectedNGOAction(null)
      setActionError(null)
    },
    onError: (err) => {
      setActionError(extractErrorMessage(err, 'Failed to update NGO verification status.'))
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">NGO Registration & Verification</h1>
        <p className="text-sm text-[#66736f]">
          Audit non-profit license numbers and distribution addresses to verify legitimate redistribution bodies.
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
      ) : ngos.length === 0 ? (
        <EmptyState
          icon={<Building className="w-7 h-7" />}
          title="No NGO profiles registered"
          description="Registered non-profits will appear here once they set up their organization profiles."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profile ID</TableHead>
              <TableHead>Organization Name</TableHead>
              <TableHead>Registration Number</TableHead>
              <TableHead>Delivery Hub Address</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ngos.map((ngo) => (
              <TableRow key={ngo.id}>
                <TableCell className="font-mono text-xs text-[#66736f]">#{ngo.id}</TableCell>
                <TableCell className="font-semibold text-[#23332f]">
                  {ngo.organizationName || 'Unnamed NGO'}
                </TableCell>
                <TableCell className="font-mono text-xs text-[#912f56] font-semibold">
                  {ngo.registrationNumber || 'Not submitted'}
                </TableCell>
                <TableCell className="text-xs text-[#66736f] max-w-xs truncate">
                  {ngo.address || '—'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={ngo.verificationStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {ngo.verificationStatus !== 'VERIFIED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                        onClick={() => setSelectedNGOAction({ ngo, status: 'VERIFIED' })}
                      >
                        Verify NGO
                      </Button>
                    )}
                    {ngo.verificationStatus !== 'REJECTED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-red-600 hover:bg-red-50"
                        onClick={() => setSelectedNGOAction({ ngo, status: 'REJECTED' })}
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

      {selectedNGOAction && (
        <ConfirmDialog
          isOpen={!!selectedNGOAction}
          onClose={() => setSelectedNGOAction(null)}
          title={`Update NGO Verification to ${selectedNGOAction.status}`}
          message={`Are you sure you want to mark "${selectedNGOAction.ngo.organizationName}" as ${selectedNGOAction.status}? Verified NGOs gain public authenticity badges across the platform.`}
          confirmText={`Confirm ${selectedNGOAction.status}`}
          isDestructive={selectedNGOAction.status === 'REJECTED'}
          isLoading={verifyMutation.isPending}
          onConfirm={() =>
            verifyMutation.mutate({
              id: selectedNGOAction.ngo.id!,
              status: selectedNGOAction.status,
            })
          }
        />
      )}
    </div>
  )
}
