'use client'

import {Briefcase, Edit2, Trash2, ChevronRight} from 'lucide-react'
import {ClientWithSites} from '../../types'
import {Button} from '@cm/components/styles/common-components/Button'

interface ClientListProps {
  clients: ClientWithSites[]
  onEdit: (client: ClientWithSites) => void
  onDelete: (clientId: number) => void
  onNavigateToSites: (clientId: number) => void
}

export default function ClientList({clients, onEdit, onDelete, onNavigateToSites}: ClientListProps) {
  if (clients.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">まだ取引先が登録されていません。</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {clients.map(client => (
          <li
            key={client.id}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 hover:bg-gray-50"
          >
            <div
              className="font-medium text-blue-700 hover:underline cursor-pointer flex items-center gap-2"
              onClick={() => onNavigateToSites(client.id)}
            >
              <Briefcase className="w-4 h-4 text-gray-600" />
              <span>{client.name}</span>
            </div>
            <div className="flex gap-2 shrink-0 self-end sm:self-center">
              <Button color="blue" size="sm" onClick={() => onNavigateToSites(client.id)}>
                <ChevronRight className="w-4 h-4 ml-1 inline-block" />
                <span>現場一覧</span>
              </Button>
              <Button color="blue" size="sm" onClick={() => onEdit(client)}>
                <Edit2 className="w-3 h-3 mr-1 inline-block " /> 名称変更
              </Button>
              <Button color="red" size="sm" onClick={() => onDelete(client.id)}>
                <Trash2 className="w-3 h-3 mr-1 inline-block " /> 削除
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
