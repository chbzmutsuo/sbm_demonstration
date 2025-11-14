'use client'

import {Building} from 'lucide-react'
import {SiteWithRelations} from '../../types'
import SiteCard from './SiteCard'

interface SiteListProps {
  sites: SiteWithRelations[]
  onEdit: (site: SiteWithRelations) => void
  onDelete: (siteId: number) => void
  onNavigateToDocuments: (siteId: number) => void
}

export default function SiteList({sites, onEdit, onDelete, onNavigateToDocuments}: SiteListProps) {
  if (sites.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <Building className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">まだ現場が登録されていません。</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {sites.map(site => (
        <SiteCard key={site.id} site={site} onEdit={onEdit} onDelete={onDelete} onNavigateToDocuments={onNavigateToDocuments} />
      ))}
    </div>
  )
}
