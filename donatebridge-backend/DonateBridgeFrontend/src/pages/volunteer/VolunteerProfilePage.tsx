import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Truck, CheckCircle2, AlertCircle } from 'lucide-react'
import { volunteerApi } from '@/api/volunteer.api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { extractErrorMessage } from '@/api/axios'
import type { VolunteerProfile } from '@/types'

const volunteerProfileSchema = z.object({
  vehicleType: z.string().min(2, 'Vehicle type is required'),
  vehicleNumber: z.string().min(2, 'License plate or vehicle number is required'),
})

type VolunteerProfileFormValues = z.infer<typeof volunteerProfileSchema>

export const VolunteerProfilePage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['volunteer', 'profile'],
    queryFn: volunteerApi.getMyProfile,
    retry: 1,
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VolunteerProfileFormValues>({
    resolver: zodResolver(volunteerProfileSchema),
    defaultValues: {
      vehicleType: 'Car',
      vehicleNumber: '',
    },
  })

  useEffect(() => {
    if (profile) {
      setValue('vehicleType', profile.vehicleType || 'Car')
      setValue('vehicleNumber', profile.vehicleNumber || '')
    }
  }, [profile, setValue])

  const saveMutation = useMutation({
    mutationFn: (values: VolunteerProfileFormValues) => {
      const payload: Partial<VolunteerProfile> = {
        vehicleType: values.vehicleType,
        vehicleNumber: values.vehicleNumber,
      }
      return profile ? volunteerApi.updateProfile(payload) : volunteerApi.createProfile(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteer', 'profile'] })
      setSuccessMessage('Volunteer profile updated successfully!')
      setErrorMessage(null)
      setTimeout(() => setSuccessMessage(null), 4000)
    },
    onError: (err) => {
      setErrorMessage(extractErrorMessage(err, 'Failed to update profile.'))
    },
  })

  const onSubmit = (values: VolunteerProfileFormValues) => {
    setSuccessMessage(null)
    setErrorMessage(null)
    saveMutation.mutate(values)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Volunteer Profile</h1>
        <p className="text-sm text-[#66736f]">
          Manage your transport vehicle registration and delivery credentials.
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

      <Card className="p-6 sm:p-8 bg-white border border-[#cfded8] shadow-card">
        {/* Account Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-[#eaf2ef]">
          <div className="w-14 h-14 rounded-2xl bg-[#eaf2ef] text-[#23332f] font-extrabold text-xl flex items-center justify-center border border-[#cfded8]">
            <Truck className="w-7 h-7 text-[#912f56]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#23332f]">{user?.name}</h2>
            <p className="text-xs text-[#66736f]">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <StatusBadge status={user?.accountStatus || 'ACTIVE'} />
              {profile?.verificationStatus && (
                <StatusBadge status={profile.verificationStatus} />
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-6">
          <Select
            label="Vehicle Type"
            error={errors.vehicleType?.message}
            options={[
              { label: 'Passenger Car / Sedan', value: 'Car' },
              { label: 'SUV / Crossover', value: 'SUV' },
              { label: 'Van / Minivan', value: 'Van' },
              { label: 'Pickup Truck', value: 'Pickup Truck' },
              { label: 'Motorcycle / Scooter', value: 'Motorcycle' },
              { label: 'Bicycle / Cargo Bike', value: 'Bicycle' },
            ]}
            {...register('vehicleType')}
          />

          <Input
            label="Vehicle License Plate / Registration"
            placeholder="e.g. ABC-1234 or TN01AB1234"
            leftIcon={<Truck className="w-4 h-4" />}
            error={errors.vehicleNumber?.message}
            {...register('vehicleNumber')}
          />

          <div className="flex justify-end pt-4 border-t border-[#eaf2ef]">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={saveMutation.isPending}
            >
              Save Volunteer Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
