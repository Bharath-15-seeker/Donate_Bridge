import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { HeartHandshake, LogIn, AlertCircle, KeyRound, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/api/axios'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const { login, getRoleDashboardPath } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [serverError, setServerError] = useState<string | null>(null)

  const isExpired = searchParams.get('expired') === 'true'

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    try {
      const response = await login(values)
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname
      const redirectPath = from || getRoleDashboardPath(response.role)
      navigate(redirectPath, { replace: true })
    } catch (err) {
      const message = extractErrorMessage(err, 'Invalid credentials. Please verify your email and password.')
      setServerError(message)
    }
  }

  // Quick fill helper for evaluator convenience
  const fillCredentials = (email: string, pass: string) => {
    setValue('email', email)
    setValue('password', pass)
    setServerError(null)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#912f56] text-white flex items-center justify-center mx-auto shadow-sm mb-4">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#23332f]">
            Welcome Back
          </h2>
          <p className="text-sm text-[#66736f] mt-1">
            Sign in to access your DonateBridge portal
          </p>
        </div>

        {/* Expired Session Alert */}
        {isExpired && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Your session has expired. Please sign in again to continue.</span>
          </div>
        )}

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form Card */}
        <Card className="p-6 sm:p-8 bg-white border border-[#cfded8] shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@organization.org"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<KeyRound className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#66736f]">
            <span>Don&apos;t have an account yet? </span>
            <Link to="/register" className="font-semibold text-[#912f56] hover:underline">
              Create an account
            </Link>
          </div>
        </Card>

        {/* Quick Testing Helper */}
        <div className="p-4 rounded-2xl bg-white/70 border border-[#cfded8] text-xs text-[#66736f] space-y-2">
          <p className="font-semibold text-[#23332f] flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-[#912f56]" />
            New here? You can register any role or sign in:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link to="/register?role=DONOR">
              <span className="px-2 py-1 rounded-md bg-[#eaf2ef] text-[#23332f] hover:bg-[#dce8e4] cursor-pointer font-medium">
                + Register Donor
              </span>
            </Link>
            <Link to="/register?role=NGO">
              <span className="px-2 py-1 rounded-md bg-[#eaf2ef] text-[#23332f] hover:bg-[#dce8e4] cursor-pointer font-medium">
                + Register NGO
              </span>
            </Link>
            <Link to="/register?role=VOLUNTEER">
              <span className="px-2 py-1 rounded-md bg-[#eaf2ef] text-[#23332f] hover:bg-[#dce8e4] cursor-pointer font-medium">
                + Register Volunteer
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
