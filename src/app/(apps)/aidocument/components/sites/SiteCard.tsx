'use client'

import {MoreVertical, Edit2, Trash2, Wallet, Calendar, Users, Truck, ChevronRight} from 'lucide-react'
import {SiteWithRelations} from '../../types'
import {Button} from '@cm/components/styles/common-components/Button'
import {useState} from 'react'

interface SiteCardProps {
  site: SiteWithRelations
  onEdit: (site: SiteWithRelations) => void
  onDelete: (siteId: number) => void
  onNavigateToDocuments: (siteId: number) => void
}

export default function SiteCard({site, onEdit, onDelete, onNavigateToDocuments}: SiteCardProps) {
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '未定'
    return new Date(date).toLocaleDateString('ja-JP')
  }

  return (
    <div className="bg-white shadow border border-gray-200 rounded-lg flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex justify-between items-start relative">
        <div className="flex-1">
          <h3 className="font-bold text-blue-700 hover:underline cursor-pointer" onClick={() => onNavigateToDocuments(site.id)}>
            {site.name}
          </h3>
          <p className="text-xs text-gray-500">{site.address || ''}</p>
        </div>
        <div className="relative">
          <div className="absolute right-0 mt-1 flex gap-1 bg-white p-1  rounded shadow-lg z-10">
            <Button color="blue" onClick={() => onEdit(site)}>
              <Edit2 className="w-3 h-3 " />
            </Button>
            <Button color="red" onClick={() => onDelete(site.id)}>
              <Trash2 className="w-3 h-3 " />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex-grow space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <Wallet className="w-4 h-4 text-gray-500" />
          <span>{site.amount ? `${site.amount.toLocaleString()} 円` : '金額未設定'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>
            {formatDate(site.startDate)} 〜 {formatDate(site.endDate)}
          </span>
        </div>
        <div className="flex items-start gap-2 text-gray-700">
          <Users className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
          <span className="truncate">{site.Staff?.length > 0 ? site.Staff.map(s => s.name).join(', ') : 'スタッフ未登録'}</span>
        </div>
        <div className="flex items-start gap-2 text-gray-700">
          <Truck className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
          <span className="truncate">{site.aidocumentVehicles?.length > 0 ? site.aidocumentVehicles.map(v => v.plate).join(', ') : '車両未登録'}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <Button size="sm" className="w-full justify-between" onClick={() => onNavigateToDocuments(site.id)}>
          <span>書類一覧・作成</span>
          <ChevronRight className="w-4 h-4 inline-block" />
        </Button>
      </div>
    </div>
  )
}
