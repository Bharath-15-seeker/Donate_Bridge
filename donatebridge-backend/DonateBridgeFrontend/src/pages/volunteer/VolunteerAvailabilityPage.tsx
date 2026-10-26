import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'
import { volunteerApi } from '@/api/volunteer.api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { extractErrorMessage } from '@/api/axios'
import type { AvailabilityStatus } from '@/types'

export const VolunteerAvailabilityPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['volunteer', 'profile'],
    queryFn: volunteerApi.getMyProfile,
  })

  const availabilityMutation = useMutation({
    mutationFn: (status: AvailabilityStatus) => volunteerApi.updateAvailability(status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['volunteer', 'profile'] })
      setSuccessMessage(`Availability updated to ${updated.availabilityStatus}!`)
      setErrorMessage(null)
      setTimeout(() => setSuccessMessage(null), 3000)
    },
    onError: (err) => {
      setErrorMessage(extractErrorMessage(err, 'Failed to update availability.'))
    },
  })

  const currentStatus = profile?.availabilityStatus || 'OFFLINE'

  const statuses: {
    status: AvailabilityStatus
    title: string
    description: string
    color: string
  }[] = [
    {
      status: 'AVAILABLE',
      title: 'Ready for Pickups (Available)',
      description: 'You are on duty and open to accept and receive urgent donation transport jobs in your area.',
      color: 'border-emerald-500 bg-emerald-50/40 text-emerald-900',
    },
    {
      status: 'BUSY',
      title: 'On A Route / Busy',
      description: 'You are currently handling an active delivery or temporarily preoccupied with other tasks.',
      color: 'border-amber-500 bg-amber-50/40 text-amber-900',
    },
    {
      status: 'OFFLINE',
      title: 'Off Duty (Offline)',
      description: 'You are off duty and will not be displayed for new immediate delivery dispatches.',
      color: 'border-slate-400 bg-slate-50/40 text-slate-800',
    },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Volunteer Availability Status</h1>
        <p className="text-sm text-[#66736f]">
          Control whether the platform dispatch system shows you as active for collection runs.
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Card className="p-6 sm:p-8 bg-white border border-[#cfded8] shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#eaf2ef]">
          <div>
            <p className="text-xs font-bold text-[#66736f] uppercase">Current Duty Status</p>
            <div className="mt-1">
              <StatusBadge status={currentStatus} />
            </div>
          </div>
          <Clock className="w-8 h-8 text-[#912f56]" />
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#23332f] uppercase tracking-wider">
            Select Your Availability
          </h3>

          <div className="space-y-3">
            {statuses.map((item) => {
              const isSelected = currentStatus === item.status
              return (
                <div
                  key={item.status}
                  onClick={() => availabilityMutation.mutate(item.status)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-4 ${
                    isSelected
                      ? `${item.color} shadow-sm ring-2 ring-[#912f56]/20`
                      : 'border-[#cfded8] bg-white hover:bg-[#eaf2ef]/50'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[#23332f]">{item.title}</h4>
                    <p className="text-xs text-[#66736f] leading-relaxed">{item.description}</p>
                  </div>

                  <input
                    type="radio"
                    name="availability"
                    checked={isSelected}
                    onChange={() => availabilityMutation.mutate(item.status)}
                    className="mt-1 text-[#912f56] focus:ring-[#912f56]"
                  />
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}
