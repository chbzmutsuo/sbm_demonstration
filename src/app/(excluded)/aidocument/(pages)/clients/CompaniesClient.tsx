'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Plus, Search, Loader2, AlertCircle} from 'lucide-react'
import {CompanyWithSites} from '../../types'
import {createClientCompany, updateClientCompany, deleteClientCompany} from '../../actions/company-actions'
import CompanyList from '../../components/companies/CompanyList'
import CompanyFormSimple from '../../components/companies/CompanyFormSimple'
import {Button} from '@cm/components/styles/common-components/Button'

interface CompaniesClientProps {
  initialCompanies: CompanyWithSites[]
}

export default function CompaniesClient({initialCompanies}: CompaniesClientProps) {
  const router = useRouter()
  const [companies, setCompanies] = useState<CompanyWithSites[]>(initialCompanies)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<CompanyWithSites | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleOpenModal = (company: CompanyWithSites | null = null) => {
    setEditingCompany(company)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingCompany(null)
    setIsModalOpen(false)
  }

  const handleSave = async (data: {id?: number; name: string; representativeName?: string; address?: string; phone?: string}) => {
    setIsLoading(true)
    setError(null)

    try {
      if (data.id) {
        const result = await updateClientCompany(data.id, {
          name: data.name,
          representativeName: data.representativeName,
          address: data.address,
          phone: data.phone,
        })
        if (result.success && result.result) {
          setCompanies(prev =>
            prev.map(c =>
              c.id === data.id
                ? {
                    ...result.result,
                    SitesAsClient: c.SitesAsClient, // 既存のSite情報を保持
                  }
                : c
            )
          )
        } else {
          setError(result.message)
        }
      } else {
        const result = await createClientCompany({
          name: data.name,
          representativeName: data.representativeName,
          address: data.address,
          phone: data.phone,
        })
        if (result.success && result.result) {
          setCompanies(prev => [
            {
              ...result.result,
              SitesAsClient: [], // 新規作成時は空配列
            },
            ...prev,
          ])
        } else {
          setError(result.message)
        }
      }
      handleCloseModal()
    } catch (err) {
      setError('保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (companyId: number) => {
    if (!window.confirm('この取引先を削除しますか？関連する現場も削除されます。')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await deleteClientCompany(companyId)
      if (result.success) {
        setCompanies(prev => prev.filter(c => c.id !== companyId))
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('削除に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCompanies = companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">取引先マスタ管理</h1>
          <p className="text-sm text-gray-600">取引先（発注者）の情報を登録・編集します。</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2 inline-block" />
          新規取引先を登録
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-3 relative">
        <input
          type="text"
          placeholder="取引先名で検索..."
          className="w-full p-2 pl-8 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* Status */}
      {isLoading && (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-700">読み込み中...</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Company List */}
      {!isLoading && (
        <CompanyList
          companies={filteredCompanies}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onNavigateToSites={companyId => router.push(`/aidocument/clients/${companyId}/sites`)}
        />
      )}

      {/* 編集・新規作成モーダル */}
      <CompanyFormSimple
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editingCompany}
      />
    </div>
  )
}

