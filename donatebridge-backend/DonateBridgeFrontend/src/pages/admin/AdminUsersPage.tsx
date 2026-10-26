import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Search, Shield, CheckCircle2, AlertTriangle, XCircle, Filter } from 'lucide-react'
import { adminApi } from '@/api/admin.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { formatDate } from '@/utils/formatters'
import type { AccountStatus, User } from '@/types'
import { extractErrorMessage } from '@/api/axios'

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [userToModify, setUserToModify] = useState<{ user: User; newStatus: AccountStatus } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getAllUsers,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AccountStatus }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      setUserToModify(null)
      setActionError(null)
    },
    onError: (err) => {
      setActionError(extractErrorMessage(err, 'Failed to update user account status.'))
    },
  })

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm))

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || u.accountStatus === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Platform Users Management</h1>
        <p className="text-sm text-[#66736f]">
          Inspect user registrations across all four platform roles and control account standing.
        </p>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="underline text-red-800">Dismiss</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#cfded8] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role selector */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#cfded8] bg-white text-xs font-semibold text-[#23332f] focus:ring-2 focus:ring-[#912f56]/20"
          >
            <option value="ALL">All Roles</option>
            <option value="DONOR">Donors</option>
            <option value="NGO">NGOs</option>
            <option value="VOLUNTEER">Volunteers</option>
            <option value="ADMIN">Admins</option>
          </select>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#cfded8] bg-white text-xs font-semibold text-[#23332f] focus:ring-2 focus:ring-[#912f56]/20"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="No users match your criteria"
          description="Try broadening your search query or role filter settings."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-mono text-xs text-[#66736f]">#{u.id}</TableCell>
                <TableCell className="font-semibold text-[#23332f]">{u.name}</TableCell>
                <TableCell className="text-xs text-[#66736f]">{u.email}</TableCell>
                <TableCell>
                  <Badge variant="brand" size="sm">
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={u.accountStatus} />
                </TableCell>
                <TableCell className="text-xs text-[#66736f]">
                  {formatDate(u.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {u.accountStatus !== 'ACTIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                        onClick={() => setUserToModify({ user: u, newStatus: 'ACTIVE' })}
                      >
                        Activate
                      </Button>
                    )}
                    {u.accountStatus !== 'SUSPENDED' && u.role !== 'ADMIN' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-red-600 hover:bg-red-50"
                        onClick={() => setUserToModify({ user: u, newStatus: 'SUSPENDED' })}
                      >
                        Suspend
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Confirmation Dialog */}
      {userToModify && (
        <ConfirmDialog
          isOpen={!!userToModify}
          onClose={() => setUserToModify(null)}
          title={`Update Status for ${userToModify.user.name}`}
          message={`Are you sure you want to change this account status to ${userToModify.newStatus}? ${
            userToModify.newStatus === 'SUSPENDED'
              ? 'Suspended accounts cannot log in or perform platform operations.'
              : 'The user will gain full active privileges for their role.'
          }`}
          confirmText={`Set to ${userToModify.newStatus}`}
          isDestructive={userToModify.newStatus === 'SUSPENDED'}
          isLoading={statusMutation.isPending}
          onConfirm={() =>
            statusMutation.mutate({
              id: userToModify.user.id,
              status: userToModify.newStatus,
            })
          }
        />
      )}
    </div>
  )
}
