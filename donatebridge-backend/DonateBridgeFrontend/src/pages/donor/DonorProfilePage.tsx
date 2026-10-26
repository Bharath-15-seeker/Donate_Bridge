import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Mail, Phone, MapPin, Building, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import { donorApi } from '@/api/donor.api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { InteractiveMap } from '@/components/data-display/InteractiveMap'
import { extractErrorMessage } from '@/api/axios'
import type { DonorProfile } from '@/types'

const profileSchema = z.object({
  organizationName: z.string().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export const DonorProfilePage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['donor', 'profile'],
    queryFn: donorApi.getMyProfile,
    retry: 1,
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      organizationName: '',
      address: '',
      latitude: null,
      longitude: null,
    },
  })

  useEffect(() => {
    if (profile) {
      setValue('organizationName', profile.organizationName || '')
      setValue('address', profile.address || '')
      setValue('latitude', profile.latitude || null)
      setValue('longitude', profile.longitude || null)
    }
  }, [profile, setValue])

  const lat = watch('latitude')
  const lng = watch('longitude')
  const addr = watch('address')

  const saveMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => {
      const payload: Partial<DonorProfile> = {
        organizationName: values.organizationName,
        address: values.address,
        latitude: values.latitude || undefined,
        longitude: values.longitude || undefined,
      }
      return profile ? donorApi.updateProfile(payload) : donorApi.createProfile(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donor', 'profile'] })
      setSuccessMessage('Profile saved successfully!')
      setErrorMessage(null)
      setTimeout(() => setSuccessMessage(null), 4000)
    },
    onError: (err) => {
      setErrorMessage(extractErrorMessage(err, 'Failed to update profile.'))
    },
  })

  const onSubmit = (values: ProfileFormValues) => {
    setSuccessMessage(null)
    setErrorMessage(null)
    saveMutation.mutate(values)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Donor Profile</h1>
        <p className="text-sm text-[#66736f]">
          Manage your contact credentials and default doorstep pickup location.
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

      {/* Account Overview Card */}
      <Card className="p-6 bg-white border border-[#cfded8] shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eaf2ef]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f6e8ee] text-[#912f56] font-extrabold text-xl flex items-center justify-center border border-[#eed1dd]">
              {user?.name?.charAt(0).toUpperCase()}
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
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#23332f] uppercase tracking-wider">
              Profile & Default Pickup Address
            </h3>

            <Input
              label="Donor Name"
              placeholder="e.g. Acme CSR Department, Community Donors"
              leftIcon={<Building className="w-4 h-4" />}
              error={errors.organizationName?.message}
              {...register('organizationName')}
            />

            <Input
              label="Default Pickup Address"
              placeholder="Street address for doorstep donation collections"
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
                helperText="Enables map placement for volunteers"
                {...register('latitude')}
              />

              <Input
                label="Longitude (Optional)"
                placeholder="e.g. 80.2707"
                type="number"
                step="any"
                helperText="Enables map placement for volunteers"
                {...register('longitude')}
              />
            </div>
          </div>

          {/* Interactive Map Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#66736f] uppercase tracking-wider">
              Location Preview
            </label>
            <InteractiveMap
              latitude={lat}
              longitude={lng}
              title={user?.name || 'My Location'}
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
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
