'use client'

import {Building} from 'lucide-react'
import {CompanyWithSites} from '../../types'
import CompanyCard from './CompanyCard'

interface CompanyListProps {
  companies: CompanyWithSites[]
  onEdit: (company: CompanyWithSites) => void
  onDelete: (companyId: number) => void
  onNavigateToSites: (companyId: number) => void
}

export default function CompanyList({companies, onEdit, onDelete, onNavigateToSites}: CompanyListProps) {
  if (companies.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <Building className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">まだ取引先が登録されていません。</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {companies.map(company => (
        <CompanyCard
          key={company.id}
          company={company}
          onEdit={onEdit}
          onDelete={onDelete}
          onNavigateToSites={onNavigateToSites}
        />
      ))}
    </div>
  )
}

