import React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  variant?: 'default' | 'brand' | 'success' | 'warning'
  className?: string
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  className,
  onClick,
}) => {
  const iconVariants = {
    default: 'bg-[#eaf2ef] text-[#23332f]',
    brand: 'bg-[#f6e8ee] text-[#912f56]',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
  }

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-5 transition-all duration-200 hover:shadow-elevated',
        onClick && 'cursor-pointer hover:border-[#912f56]/40',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#66736f]">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#23332f]">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[#66736f] flex items-center gap-1 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm',
              iconVariants[variant]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
