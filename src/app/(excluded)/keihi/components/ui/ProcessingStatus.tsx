'use client'

import {LoadingSpinner} from './LoadingSpinner'

interface ProcessingStatusProps {
  isVisible: boolean
  message: string
  variant?: 'info' | 'success' | 'warning' | 'error'
}

export const ProcessingStatus = ({isVisible, message, variant = 'info'}: ProcessingStatusProps) => {
  if (!isVisible) return null

  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  }

  return (
    <div className={`p-4 border rounded-lg ${variantClasses[variant]}`}>
      <div className="flex items-center gap-3">
        {variant === 'info' && <LoadingSpinner size="sm" />}
        <p className="font-medium">{message}</p>
      </div>
    </div>
  )
}
