import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Gift,
  Upload,
  X,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { donationApi } from '@/api/donation.api'
import { donorApi } from '@/api/donor.api'
import { requirementApi } from '@/api/requirement.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { extractErrorMessage } from '@/api/axios'

const donationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Please provide a detailed description (at least 10 characters)'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  condition: z.string().min(1, 'Condition is required'),
  pickupAddress: z.string().min(5, 'Pickup address is required'),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  requirementId: z.coerce.number().optional().nullable(),
})

type DonationFormValues = z.infer<typeof donationSchema>

export const DonorCreateDonationPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [serverError, setServerError] = useState<string | null>(null)

  const initialRequirementId = searchParams.get('requirementId')
    ? Number(searchParams.get('requirementId'))
    : undefined

  // Fetch requirement if linking
  const { data: linkedRequirement } = useQuery({
    queryKey: ['requirement', initialRequirementId],
    queryFn: () => requirementApi.getRequirementById(initialRequirementId!),
    enabled: !!initialRequirementId,
  })

  // Fetch donor profile for default address
  const { data: profile } = useQuery({
    queryKey: ['donor', 'profile'],
    queryFn: donorApi.getMyProfile,
    retry: 1,
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Clothing',
      quantity: 1,
      unit: 'Pieces',
      condition: 'Good',
      pickupAddress: '',
      latitude: null,
      longitude: null,
      requirementId: initialRequirementId || null,
    },
  })

  // Prepopulate address from donor profile
  useEffect(() => {
    if (profile?.address) {
      setValue('pickupAddress', profile.address)
    }
    if (profile?.latitude) {
      setValue('latitude', profile.latitude)
    }
    if (profile?.longitude) {
      setValue('longitude', profile.longitude)
    }
  }, [profile, setValue])

  // Prepopulate category from linked requirement
  useEffect(() => {
    if (linkedRequirement) {
      setValue('title', `Donation for: ${linkedRequirement.title}`)
      setValue('category', linkedRequirement.category || 'Other')
      if (linkedRequirement.unit) {
        setValue('unit', linkedRequirement.unit)
      }
      setValue('requirementId', linkedRequirement.id)
    }
  }, [linkedRequirement, setValue])

  // Image upload handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedImages((prev) => [...prev, ...filesArray])

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file))
      setImagePreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const createMutation = useMutation({
    mutationFn: (values: DonationFormValues) =>
      donationApi.createDonation(
        {
          title: values.title,
          description: values.description,
          category: values.category,
          quantity: values.quantity,
          unit: values.unit,
          condition: values.condition,
          pickupAddress: values.pickupAddress,
          latitude: values.latitude || undefined,
          longitude: values.longitude || undefined,
          requirementId: values.requirementId || undefined,
        },
        selectedImages
      ),
    onSuccess: (newDonation) => {
      queryClient.invalidateQueries({ queryKey: ['donations', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['donations', 'available'] })
      navigate(`/donor/donations/${newDonation.id}`)
    },
    onError: (err) => {
      setServerError(extractErrorMessage(err, 'Failed to create donation. Please check your submission.'))
    },
  })

  const onSubmit = (values: DonationFormValues) => {
    setServerError(null)
    createMutation.mutate(values)
  }

  const donorApproved = profile?.verificationStatus === 'VERIFIED'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {profile && !donorApproved && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Admin approval required.</strong> Your donor profile is {profile.verificationStatus || 'PENDING'}. You can post donations after an admin verifies your profile.
        </div>
      )}
      {/* Back button and title */}
      <div className="flex items-center gap-3">
        <Link to="/donor/donations">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#23332f]">List a New Donation</h1>
          <p className="text-xs text-[#66736f]">
            Offer your items for redistribution to verified non-profit organizations.
          </p>
        </div>
      </div>

      {/* Linked Requirement Callout */}
      {linkedRequirement && (
        <div className="p-4 rounded-2xl bg-[#f6e8ee] border border-[#eed1dd] text-[#912f56] text-xs sm:text-sm flex items-start gap-3">
          <FileText className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Fulfilling NGO Requirement #{linkedRequirement.id}</span>
            <span>
              This donation will be linked to &quot;{linkedRequirement.title}&quot; requested by NGO #{linkedRequirement.ngoId}.
            </span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {serverError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{serverError}</span>
        </div>
      )}

      <Card className="p-6 sm:p-8 bg-white border border-[#cfded8] shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Item Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#23332f] uppercase tracking-wider pb-2 border-b border-[#eaf2ef]">
              1. Item Information
            </h3>

            <Input
              label="Donation Title"
              placeholder="e.g. Winter Jackets Collection, Children's Storybooks"
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                error={errors.category?.message}
                options={[
                  { label: 'Clothing & Apparel', value: 'Clothing' },
                  { label: 'Food & Nutrition', value: 'Food' },
                  { label: 'Books & Educational', value: 'Books' },
                  { label: 'Medical & Mobility Supplies', value: 'Medical' },
                  { label: 'Toys & Children Items', value: 'Toys' },
                  { label: 'Electronics & Computers', value: 'Electronics' },
                  { label: 'Home & Furniture', value: 'Furniture' },
                  { label: 'Other Essentials', value: 'Other' },
                ]}
                {...register('category')}
              />

              <Select
                label="Condition"
                error={errors.condition?.message}
                options={[
                  { label: 'Brand New (Unopened / Tagged)', value: 'Brand New' },
                  { label: 'Like New (Barely Used)', value: 'Like New' },
                  { label: 'Good (Functional, Minor Wear)', value: 'Good' },
                  { label: 'Fair (Usable)', value: 'Fair' },
                ]}
                {...register('condition')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Quantity"
                type="number"
                min="1"
                error={errors.quantity?.message}
                {...register('quantity')}
              />

              <Select
                label="Unit of Measurement"
                error={errors.unit?.message}
                options={[
                  { label: 'Pieces / Items', value: 'Pieces' },
                  { label: 'Boxes / Cartons', value: 'Boxes' },
                  { label: 'Kilograms (Kg)', value: 'Kg' },
                  { label: 'Sets', value: 'Sets' },
                  { label: 'Pairs', value: 'Pairs' },
                ]}
                {...register('unit')}
              />
            </div>

            <Textarea
              label="Description & Details"
              placeholder="Describe the items, sizes, approximate weight, and any handling instructions for the volunteer..."
              rows={4}
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#23332f] uppercase tracking-wider pb-2 border-b border-[#eaf2ef]">
              2. Photos (Optional but Recommended)
            </h3>

            <div className="border-2 border-dashed border-[#cfded8] rounded-2xl p-6 text-center hover:bg-[#f6f9f8] transition-colors relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="images"
              />
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-[#f6e8ee] text-[#912f56] flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[#23332f]">
                  Click or drag images to upload
                </p>
                <p className="text-xs text-[#66736f] mt-0.5">
                  JPEG, PNG, WebP up to 5MB each
                </p>
              </div>
            </div>

            {/* Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                {imagePreviews.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#cfded8] aspect-square">
                    <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pickup Location Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#23332f] uppercase tracking-wider pb-2 border-b border-[#eaf2ef]">
              3. Pickup Location
            </h3>

            <Input
              label="Pickup Address"
              placeholder="Full street address where the volunteer will pick up the items"
              leftIcon={<MapPin className="w-4 h-4" />}
              error={errors.pickupAddress?.message}
              {...register('pickupAddress')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Latitude (Optional)"
                placeholder="e.g. 13.0827"
                type="number"
                step="any"
                helperText="For map routing & volunteer distance"
                {...register('latitude')}
              />

              <Input
                label="Longitude (Optional)"
                placeholder="e.g. 80.2707"
                type="number"
                step="any"
                helperText="For map routing & volunteer distance"
                {...register('longitude')}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#eaf2ef] flex items-center justify-end gap-3">
            <Link to="/donor/donations">
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={createMutation.isPending}
              disabled={!donorApproved || createMutation.isPending}
              leftIcon={<Gift className="w-4 h-4" />}
            >
              Publish Donation
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
