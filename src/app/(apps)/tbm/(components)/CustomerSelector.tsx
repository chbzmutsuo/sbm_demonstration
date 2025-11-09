'use client'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'

interface Customer {
  id: number
  name: string
  transactionCount?: number
}

interface CustomerSelectorProps {
  customers: Customer[]
  currentCustomerId?: number
}

export default function CustomerSelector({customers, currentCustomerId}: CustomerSelectorProps) {
  const {addQuery} = useGlobal()

  const handleCustomerChange = (customerId: string) => {
    if (customerId) {
      addQuery({customerId})
    } else {
      addQuery({customerId: undefined})
    }
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">請求書設定</h3>
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">請求先:</label>
        <select
          className="border border-gray-300 rounded px-3 py-2"
          value={currentCustomerId || ''}
          onChange={e => handleCustomerChange(e.target.value)}
        >
          <option value="">-- 顧客を選択してください --</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
              {customer.transactionCount !== undefined && customer.transactionCount > 0 ? ` (${customer.transactionCount})` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
