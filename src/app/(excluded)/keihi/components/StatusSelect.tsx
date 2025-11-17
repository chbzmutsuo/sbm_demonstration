'use client'

import React from 'react'
import {cn} from '@cm/shadcn/lib/utils'
import {Check, Loader2} from 'lucide-react'
import {KEIHI_STATUS} from '@app/(excluded)/keihi/actions/expense/constants'

interface StatusSelectProps {
  value: string
  onChange: (value: string) => Promise<void>
  className?: string
}

export const StatusSelect = ({value, onChange, className}: StatusSelectProps) => {
  const [localValue, setLocalValue] = React.useState(value)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)

  const handleChange = async (newValue: string) => {
    setLocalValue(newValue)
    setIsUpdating(true)
    try {
      await onChange(newValue)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1000)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="relative">
      <select
        value={localValue}
        onChange={e => handleChange(e.target.value)}
        disabled={isUpdating}
        className={cn(
          'px-2 py-1 text-sm border rounded w-[100px] transition-colors duration-200',
          isUpdating && 'opacity-50 cursor-not-allowed',
          showSuccess && 'border-green-500 bg-green-50',
          className
        )}
      >
        {KEIHI_STATUS.map(status => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      {/* ローディングインジケーター */}
      {isUpdating && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        </div>
      )}

      {/* 成功インジケーター */}
      {showSuccess && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Check className="h-4 w-4 text-green-500" />
        </div>
      )}
    </div>
  )
}
