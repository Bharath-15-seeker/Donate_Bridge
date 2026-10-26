import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none rounded-xl'

    const variants = {
      primary:
        'bg-[#912f56] text-white hover:bg-[#782445] active:bg-[#621c36] shadow-sm focus-visible:ring-[#912f56]',
      secondary:
        'bg-[#23332f] text-white hover:bg-[#1a2623] active:bg-[#121b19] shadow-sm focus-visible:ring-[#23332f]',
      outline:
        'border border-[#cfded8] bg-white text-[#23332f] hover:bg-[#eaf2ef] hover:border-[#b8cec6] active:bg-[#dce8e4] focus-visible:ring-[#912f56]',
      ghost:
        'text-[#23332f] hover:bg-[#eaf2ef] active:bg-[#dce8e4] focus-visible:ring-[#912f56]',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm focus-visible:ring-red-600',
      subtle:
        'bg-[#f6e8ee] text-[#912f56] hover:bg-[#eed1dd] active:bg-[#e1acc1] focus-visible:ring-[#912f56]',
    }

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-4 py-2 h-10 gap-2',
      lg: 'text-base px-5 py-2.5 h-12 gap-2.5',
      icon: 'h-10 w-10 p-0',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
