import React from 'react'
import { Badge } from './badge'
import { formatEnumLabel } from '@/utils/formatters'
import type {
  AccountStatus,
  AvailabilityStatus,
  DonationRequestStatus,
  DonationStatus,
  PickupStatus,
  RequirementStatus,
  VerificationStatus,
} from '@/types'

type StatusType =
  | DonationStatus
  | RequirementStatus
  | DonationRequestStatus
  | PickupStatus
  | VerificationStatus
  | AccountStatus
  | AvailabilityStatus
  | string

interface StatusBadgeProps {
  status?: StatusType | null
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  if (!status) {
    return <Badge variant="outline" className={className}>Unknown</Badge>
  }

  // Determine variant and dot color based on exact backend enum
  let variant: 'default' | 'brand' | 'success' | 'warning' | 'destructive' | 'outline' | 'sage' = 'default'
  let dotColor = 'bg-gray-400'

  switch (status) {
    // Success / Completed / Verified / Active
    case 'ACTIVE':
    case 'VERIFIED':
    case 'AVAILABLE':
    case 'COMPLETED':
    case 'FULFILLED':
    case 'DELIVERED':
      variant = 'success'
      dotColor = 'bg-emerald-500'
      break

    // Pending / In progress / Started / Assigned / Picked Up
    case 'PENDING':
    case 'REQUESTED':
    case 'PARTIALLY_FULFILLED':
    case 'ASSIGNED':
    case 'BUSY':
      variant = 'warning'
      dotColor = 'bg-amber-500'
      break

    case 'STARTED':
    case 'PICKED_UP':
    case 'ACCEPTED':
      variant = 'brand'
      dotColor = 'bg-[#912f56]'
      break

    // Destructive / Rejected / Cancelled / Suspended
    case 'REJECTED':
    case 'CANCELLED':
    case 'SUSPENDED':
    case 'EXPIRED':
      variant = 'destructive'
      dotColor = 'bg-red-500'
      break

    // Offline / Neutral
    case 'OFFLINE':
      variant = 'sage'
      dotColor = 'bg-slate-400'
      break

    default:
      variant = 'default'
      dotColor = 'bg-slate-400'
  }

  return (
    <Badge variant={variant} className={`inline-flex items-center gap-1.5 ${className || ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{formatEnumLabel(status)}</span>
    </Badge>
  )
}
