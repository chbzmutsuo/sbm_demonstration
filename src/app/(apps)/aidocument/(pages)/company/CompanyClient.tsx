'use client'

import {useState} from 'react'
import {Loader2, AlertCircle, Save} from 'lucide-react'
import {AidocumentCompany} from '@prisma/client'
import {updateSelfCompany} from '../../actions/company-actions'
import CompanyForm from '../../components/company/CompanyForm'

interface CompanyClientProps {
  initialCompany: AidocumentCompany
}

export default function CompanyClient({initialCompany}: CompanyClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async (data: {
    name: string
    representativeName?: string
    address?: string
    phone?: string
    constructionLicense?: Array<{type: string; number: string; date: string}>
    socialInsurance?: {
      health: string
      pension: string
      employment: string
      officeName?: string
      officeCode?: string
    }
  }) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateSelfCompany(data)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-2 sm:p-4 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">自社情報管理</h1>
          <p className="text-sm text-gray-600">自社の基本情報を登録・編集します。</p>
        </div>
      </div>

      {/* Status */}
      {isLoading && (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-700">保存中...</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md flex items-center mb-3">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-md flex items-center mb-3">
          <Save className="w-5 h-5 mr-2" />
          保存しました
        </div>
      )}

      {/* Company Form */}
      {!isLoading && <CompanyForm initialData={initialCompany} onSave={handleSave} />}
    </div>
  )
}

