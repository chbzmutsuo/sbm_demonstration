'use client'

import {ChevronDown, ChevronUp} from 'lucide-react'
import {SortField, SortOrder} from '../hooks/useExpenseQueryState'

interface SortableHeaderProps {
  label: string
  field: SortField
  currentField: SortField
  currentOrder: SortOrder
  onSort: (field: SortField) => void
}

export const SortableHeader = ({label, field, currentField, currentOrder, onSort}: SortableHeaderProps) => {
  const isActive = currentField === field

  return (
    <th
      onClick={() => onSort(field)}
      className="text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <div className="flex flex-col">
          <ChevronUp size={12} className={isActive && currentOrder === 'asc' ? 'text-blue-600' : 'text-gray-400'} />
          <ChevronDown size={12} className={isActive && currentOrder === 'desc' ? 'text-blue-600' : 'text-gray-400'} />
        </div>
      </div>
    </th>
  )
}
