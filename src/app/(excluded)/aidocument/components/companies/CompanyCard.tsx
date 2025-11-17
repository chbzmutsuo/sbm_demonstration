'use client'

import {Edit2, Trash2, ChevronRight} from 'lucide-react'
import {CompanyWithSites} from '../../types'
import {Button} from '@cm/components/styles/common-components/Button'

interface CompanyCardProps {
  company: CompanyWithSites
  onEdit: (company: CompanyWithSites) => void
  onDelete: (companyId: number) => void
  onNavigateToSites: (companyId: number) => void
}

export default function CompanyCard({company, onEdit, onDelete, onNavigateToSites}: CompanyCardProps) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800 truncate flex-1">{company.name}</h3>
        <div className="flex gap-1 ml-2">
          <Button
            type="button"
            color="gray"
            size="sm"
            onClick={() => onEdit(company)}
            className="p-1"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            color="red"
            size="sm"
            onClick={() => onDelete(company.id)}
            className="p-1"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {company.representativeName && (
        <p className="text-sm text-gray-600 mb-1">代表者: {company.representativeName}</p>
      )}
      {company.address && <p className="text-sm text-gray-600 mb-1 truncate">住所: {company.address}</p>}
      <p className="text-xs text-gray-500 mb-3">現場数: {company.SitesAsClient?.length || 0}件</p>
      <Button
        type="button"
        color="blue"
        size="sm"
        onClick={() => onNavigateToSites(company.id)}
        className="w-full"
      >
        現場一覧を見る
        <ChevronRight className="w-4 h-4 ml-1 inline-block" />
      </Button>
    </div>
  )
}

