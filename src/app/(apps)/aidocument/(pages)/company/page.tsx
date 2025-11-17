import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {getSelfCompany} from '../../actions/company-actions'
import CompanyClient from './CompanyClient'

export default async function CompanyPage() {
  const {session} = await initServerComopnent({query: {}})
  const result = await getSelfCompany({userId: session.id})

  if (!result.success || !result.result) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">自社データが設定されていません。管理者に連絡してください。</p>
        </div>
      </div>
    )
  }

  return <CompanyClient initialCompany={result.result} />
}
