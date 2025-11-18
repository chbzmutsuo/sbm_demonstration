import {cn} from '@shadcn/lib/utils'
import React from 'react'

export default function LabelValue({
  label,
  value,
  direction = 'row',
  labelClass = '',
  valueClass = '',
  children,
}: {
  label: string | React.ReactNode
  value?: string | React.ReactNode
  children?: React.ReactNode
  labelClass?: string
  valueClass?: string
  direction?: 'row' | 'column'
}) {
  return (
    <div className={cn('flex justify-between text-xs gap-1', direction === 'column' && 'flex-col')}>
      <div className={cn('text-gray-500  font-light', labelClass)}>{label}:</div>
      <div className={cn('font-medium text-gray-900    text-end', valueClass)}>
        <div className={` flex justify-end`}>{value || children} </div>
      </div>
    </div>
  )
}
