import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#23332f]">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={cn(
            'flex w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#23332f] placeholder:text-[#66736f]/60 transition-all duration-150',
            'border-[#cfded8] focus:border-[#912f56] focus:outline-none focus:ring-2 focus:ring-[#912f56]/20',
            'disabled:cursor-not-allowed disabled:bg-[#f3f7f5] disabled:text-[#66736f]/70 resize-y',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#66736f]">{helperText}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
