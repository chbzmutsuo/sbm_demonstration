'use client'

import {memo} from 'react'

interface FormInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'number' | 'date'
  required?: boolean
  placeholder?: string
  className?: string
  getFieldClass?: (value: string | number | string[], required?: boolean) => string
}

export const FormInput = memo(function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
  className = '',
  getFieldClass,
}: FormInputProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={getFieldClass ? getFieldClass(value, required) : 'w-full px-3 py-2 border rounded-md'}
        placeholder={placeholder}
        required={required}
      />
    </div>
  )
})
