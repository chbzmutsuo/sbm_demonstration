import CompaniesClient from './CompaniesClient'
import {getClientCompanies} from '../../actions/company-actions'

export default async function CompaniesPage() {
  const result = await getClientCompanies()

  if (!result.success || !result.result) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">データの取得に失敗しました: {result.message}</p>
        </div>
      </div>
    )
  }

  return <CompaniesClient initialCompanies={result.result} />
}
