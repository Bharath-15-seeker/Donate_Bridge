import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building, MapPin, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import { ngoApi } from '@/api/ngo.api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { InteractiveMap } from '@/components/data-display/InteractiveMap'
import { extractErrorMessage } from '@/api/axios'
import type { NGOProfile } from '@/types'

const ngoProfileSchema = z.object({
  organizationName: z.string().min(2, 'Organization name is required'),
  registrationNumber: z.string().min(3, 'Official registration or tax ID is required'),
  address: z.string().min(5, 'Delivery address is required'),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
})

type NGOProfileFormValues = z.infer<typeof ngoProfileSchema>

export const NGOProfilePage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['ngo', 'profile'],
    queryFn: ngoApi.getMyProfile,
    retry: 1,
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NGOProfileFormValues>({
    resolver: zodResolver(ngoProfileSchema),
    defaultValues: {
      organizationName: '',
      registrationNumber: '',
      address: '',
      latitude: null,
      longitude: null,
    },
  })

  useEffect(() => {
    if (profile) {
      setValue('organizationName', profile.organizationName || '')
      setValue('registrationNumber', profile.registrationNumber || '')
      setValue('address', profile.address || '')
      setValue('latitude', profile.latitude || null)
      setValue('longitude', profile.longitude || null)
    }
  }, [profile, setValue])

  const lat = watch('latitude')
  const lng = watch('longitude')
  const addr = watch('address')

  const saveMutation = useMutation({
    mutationFn: (values: NGOProfileFormValues) => {
      const payload: Partial<NGOProfile> = {
        organizationName: values.organizationName,
        registrationNumber: values.registrationNumber,
        address: values.address,
        latitude: values.latitude || undefined,
        longitude: values.longitude || undefined,
      }
      return profile ? ngoApi.updateProfile(payload) : ngoApi.createProfile(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngo', 'profile'] })
      setSuccessMessage('Organization profile updated successfully!')
      setErrorMessage(null)
      setTimeout(() => setSuccessMessage(null), 4000)
    },
    onError: (err) => {
      setErrorMessage(extractErrorMessage(err, 'Failed to update organization profile.'))
    },
  })

  const onSubmit = (values: NGOProfileFormValues) => {
    setSuccessMessage(null)
    setErrorMessage(null)
    saveMutation.mutate(values)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Organization Profile</h1>
        <p className="text-sm text-[#66736f]">
          Manage your verified NGO registration information and primary delivery destination.
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

      <Card className="p-6 bg-white border border-[#cfded8] shadow-card">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eaf2ef]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#eaf2ef] text-[#23332f] font-extrabold text-xl flex items-center justify-center border border-[#cfded8]">
              <Building className="w-7 h-7 text-[#912f56]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#23332f]">
                {profile?.organizationName || user?.name}
              </h2>
              <p className="text-xs text-[#66736f]">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <StatusBadge status={user?.accountStatus || 'ACTIVE'} />
                {profile?.verificationStatus && (
                  <StatusBadge status={profile.verificationStatus} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#23332f] uppercase tracking-wider">
              Legal & Delivery Credentials
            </h3>

            <Input
              label="Organization Legal Name"
              placeholder="e.g. Hope Community Foundation"
              leftIcon={<Building className="w-4 h-4" />}
              error={errors.organizationName?.message}
              {...register('organizationName')}
            />

            <Input
              label="Registration / Non-Profit License Number"
              placeholder="e.g. NGO-REG-2026-98124"
              leftIcon={<FileCheck className="w-4 h-4" />}
              helperText="Verified by platform administrators"
              error={errors.registrationNumber?.message}
              {...register('registrationNumber')}
            />

            <Input
              label="Headquarters / Distribution Delivery Address"
              placeholder="Street address where volunteers will deliver accepted donations"
              leftIcon={<MapPin className="w-4 h-4" />}
              error={errors.address?.message}
              {...register('address')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Latitude (Optional)"
                placeholder="e.g. 13.0827"
                type="number"
                step="any"
                helperText="Enables map routing for delivery couriers"
                {...register('latitude')}
              />

              <Input
                label="Longitude (Optional)"
                placeholder="e.g. 80.2707"
                type="number"
                step="any"
                helperText="Enables map routing for delivery couriers"
                {...register('longitude')}
              />
            </div>
          </div>

          {/* Interactive Map Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#66736f] uppercase tracking-wider">
              Destination Location Preview
            </label>
            <InteractiveMap
              latitude={lat}
              longitude={lng}
              title={watch('organizationName') || 'NGO Hub'}
              address={addr}
              height="200px"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-[#eaf2ef]">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={saveMutation.isPending}
            >
              Save Organization Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
