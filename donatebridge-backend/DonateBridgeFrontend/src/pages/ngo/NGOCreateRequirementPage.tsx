import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, ArrowLeft, PlusCircle, AlertCircle } from 'lucide-react'
import { requirementApi } from '@/api/requirement.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { extractErrorMessage } from '@/api/axios'

const requirementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Please provide a clear description (at least 10 characters)'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  urgency: z.string().min(1, 'Urgency level is required'),
})

type RequirementFormValues = z.infer<typeof requirementSchema>

export const NGOCreateRequirementPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequirementFormValues>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Clothing',
      quantity: 1,
      unit: 'Pieces',
      urgency: 'HIGH',
    },
  })

  const createMutation = useMutation({
    mutationFn: (values: RequirementFormValues) =>
      requirementApi.createRequirement({
        title: values.title,
        description: values.description,
        category: values.category,
        quantity: values.quantity,
        unit: values.unit,
        urgency: values.urgency,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['requirements', 'available'] })
      navigate('/ngo/requirements')
    },
    onError: (err) => {
      setServerError(extractErrorMessage(err, 'Failed to post requirement.'))
    },
  })

  const onSubmit = (values: RequirementFormValues) => {
    setServerError(null)
    createMutation.mutate(values)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/ngo/requirements">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#23332f]">Post a Supply Requirement</h1>
          <p className="text-xs text-[#66736f]">
            Signal items your community or shelter urgently needs.
          </p>
        </div>
      </div>

      {serverError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{serverError}</span>
        </div>
      )}

      <Card className="p-6 sm:p-8 bg-white border border-[#cfded8] shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Requirement Title"
            placeholder="e.g. Blankets & Bedding for Flood Relief, Children School Backpacks"
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
                { label: 'Books & Education', value: 'Books' },
                { label: 'Medical & Mobility Supplies', value: 'Medical' },
                { label: 'Children & Toys', value: 'Toys' },
                { label: 'Electronics & Computers', value: 'Electronics' },
                { label: 'Shelter & Furniture', value: 'Furniture' },
                { label: 'Other Urgent Supplies', value: 'Other' },
              ]}
              {...register('category')}
            />

            <Select
              label="Urgency Level"
              error={errors.urgency?.message}
              options={[
                { label: 'Urgent (Immediate Crisis / Within 48h)', value: 'URGENT' },
                { label: 'High (Within 1 Week)', value: 'HIGH' },
                { label: 'Medium (Standard Need)', value: 'MEDIUM' },
                { label: 'Low (Ongoing Need)', value: 'LOW' },
              ]}
              {...register('urgency')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Quantity Needed"
              type="number"
              min="1"
              error={errors.quantity?.message}
              {...register('quantity')}
            />

            <Select
              label="Unit"
              error={errors.unit?.message}
              options={[
                { label: 'Pieces / Items', value: 'Pieces' },
                { label: 'Boxes / Cartons', value: 'Boxes' },
                { label: 'Kilograms (Kg)', value: 'Kg' },
                { label: 'Sets', value: 'Sets' },
                { label: 'Kits', value: 'Kits' },
              ]}
              {...register('unit')}
            />
          </div>

          <Textarea
            label="Requirement Description"
            placeholder="Describe who these items are for, any specific dimensions or guidelines for prospective donors..."
            rows={4}
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="pt-4 border-t border-[#eaf2ef] flex items-center justify-end gap-3">
            <Link to="/ngo/requirements">
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={createMutation.isPending}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Post Requirement
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
