import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { HeartHandshake, UserPlus, AlertCircle, User, Mail, KeyRound, Phone, Gift, Building, Truck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/api/axios'
import type { Role } from '@/types'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['DONOR', 'NGO', 'VOLUNTEER'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export const RegisterPage: React.FC = () => {
  const { register: registerAuth, getRoleDashboardPath } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [serverError, setServerError] = useState<string | null>(null)

  const rawRole = searchParams.get('role')?.toUpperCase()
  const initialRole: 'DONOR' | 'NGO' | 'VOLUNTEER' =
    rawRole === 'NGO' || rawRole === 'VOLUNTEER' ? rawRole : 'DONOR'

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: initialRole,
    },
  })

  const selectedRole = watch('role')

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    try {
      const response = await registerAuth(values)
      navigate(getRoleDashboardPath(response.role), { replace: true })
    } catch (err) {
      const message = extractErrorMessage(err, 'Failed to create account. Please check your information.')
      setServerError(message)
    }
  }

  const roleOptions: { role: 'DONOR' | 'NGO' | 'VOLUNTEER'; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      role: 'DONOR',
      label: 'Donor',
      icon: <Gift className="w-4 h-4" />,
      desc: 'Give items & support community needs',
    },
    {
      role: 'NGO',
      label: 'NGO Organization',
      icon: <Building className="w-4 h-4" />,
      desc: 'Request donations & post requirements',
    },
    {
      role: 'VOLUNTEER',
      label: 'Volunteer',
      icon: <Truck className="w-4 h-4" />,
      desc: 'Pick up & deliver items to NGOs',
    },
  ]

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#912f56] text-white flex items-center justify-center mx-auto shadow-sm mb-4">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#23332f]">
            Join DonateBridge
          </h2>
          <p className="text-sm text-[#66736f] mt-1">
            Create an account to start giving, requesting, or volunteering
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{serverError}</span>
          </div>
        )}

        <Card className="p-6 sm:p-8 bg-white border border-[#cfded8] shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection Tabs */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#23332f]">
                Select Your Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {roleOptions.map((opt) => {
                  const isSelected = selectedRole === opt.role
                  return (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => setValue('role', opt.role)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#912f56] bg-[#f6e8ee] ring-2 ring-[#912f56]/20'
                          : 'border-[#cfded8] bg-white hover:bg-[#eaf2ef]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-[#23332f]">
                        <span className={isSelected ? 'text-[#912f56]' : 'text-[#66736f]'}>
                          {opt.icon}
                        </span>
                        <span>{opt.label}</span>
                      </div>
                      <p className="text-[11px] text-[#66736f] mt-1 leading-tight">
                        {opt.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
              {errors.role && (
                <p className="text-xs text-red-600 font-medium">{errors.role.message}</p>
              )}
            </div>

            <Input
              label="Full Name or Organization Name"
              placeholder="Jane Doe or Green Hope Foundation"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="contact@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              leftIcon={<KeyRound className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="+1 (555) 000-0000"
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={isSubmitting}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Register as {selectedRole}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#66736f]">
            <span>Already have an account? </span>
            <Link to="/login" className="font-semibold text-[#912f56] hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
