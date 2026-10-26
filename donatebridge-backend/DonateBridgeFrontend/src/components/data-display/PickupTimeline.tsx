import React from 'react'
import type { Pickup } from '@/types'
import { formatDateTime } from '@/utils/formatters'
import { CheckCircle2, Clock, MapPin, Truck, Package, Flag } from 'lucide-react'

interface PickupTimelineProps {
  pickup: Pickup
}

export const PickupTimeline: React.FC<PickupTimelineProps> = ({ pickup }) => {
  const steps = [
    {
      key: 'ASSIGNED',
      label: 'Assigned',
      description: 'Volunteer accepted pickup assignment',
      time: pickup.assignedAt,
      icon: <Clock className="w-4 h-4" />,
    },
    {
      key: 'STARTED',
      label: 'On the Way',
      description: 'Volunteer started travel to donor address',
      time: pickup.startedAt,
      icon: <Truck className="w-4 h-4" />,
    },
    {
      key: 'PICKED_UP',
      label: 'Picked Up',
      description: 'Items collected from donor',
      time: pickup.pickedUpAt,
      icon: <Package className="w-4 h-4" />,
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      description: 'Items delivered to NGO destination',
      time: pickup.deliveredAt,
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      key: 'COMPLETED',
      label: 'Completed',
      description: 'Delivery verified and marked complete',
      time: pickup.completedAt,
      icon: <Flag className="w-4 h-4" />,
    },
  ]

  const statusOrder: Record<string, number> = {
    ASSIGNED: 1,
    STARTED: 2,
    PICKED_UP: 3,
    DELIVERED: 4,
    COMPLETED: 5,
    CANCELLED: 0,
  }

  const currentLevel = statusOrder[pickup.status] || 0

  return (
    <div className="space-y-6">
      {/* Route Addresses Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#eaf2ef]/60 border border-[#cfded8]/60 text-xs sm:text-sm">
        <div>
          <span className="font-semibold text-[#66736f] block mb-1">📍 Pickup Address (Donor):</span>
          <span className="font-medium text-[#23332f]">{pickup.pickupAddress || 'Not specified'}</span>
        </div>
        <div>
          <span className="font-semibold text-[#66736f] block mb-1">🏢 Delivery Address (NGO):</span>
          <span className="font-medium text-[#23332f]">{pickup.deliveryAddress || 'Not specified'}</span>
        </div>
      </div>

      {/* Lifecycle Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#cfded8]">
        {steps.map((step, idx) => {
          const stepLevel = statusOrder[step.key] || 0
          const isDone =
            pickup.status !== 'CANCELLED' &&
            (pickup.status === 'COMPLETED' ? stepLevel <= currentLevel : stepLevel < currentLevel)
          const isCurrent =
            pickup.status !== 'CANCELLED' &&
            pickup.status !== 'COMPLETED' &&
            stepLevel === currentLevel
          const isPending = pickup.status === 'CANCELLED' || stepLevel > currentLevel

          return (
            <div key={step.key} className="relative flex items-start gap-4">
              {/* Stepper Node */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  isDone
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-[#912f56] text-white ring-4 ring-[#f6e8ee]'
                    : 'bg-white text-[#66736f] border-2 border-[#cfded8]'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  step.icon
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-semibold text-sm ${
                      isCurrent
                        ? 'text-[#912f56]'
                        : isDone
                        ? 'text-[#23332f]'
                        : 'text-[#66736f]'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.time && (
                    <span className="text-xs text-[#66736f] font-medium">
                      {formatDateTime(step.time)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#66736f] mt-0.5">{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
