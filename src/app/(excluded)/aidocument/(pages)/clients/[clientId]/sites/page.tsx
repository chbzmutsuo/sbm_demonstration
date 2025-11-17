import SitesClient from './SitesClient'
import {notFound} from 'next/navigation'
import {getSites} from '@app/(excluded)/aidocument/actions/site-actions'
import {getClientCompanyById} from '@app/(excluded)/aidocument/actions/company-actions'

export default async function SitesPage({params}: {params: Promise<{clientId: string}>}) {
  const {clientId} = await params
  const clientIdNum = parseInt(clientId, 10)

  if (isNaN(clientIdNum)) {
    notFound()
  }

  const [clientResult, sitesResult] = await Promise.all([
    getClientCompanyById(clientIdNum),
    getSites({where: {clientId: clientIdNum}}),
  ])

  if (!clientResult.success || !clientResult.result) {
    notFound()
  }

  if (!sitesResult.success || !sitesResult.result) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">データの取得に失敗しました: {sitesResult.message}</p>
        </div>
      </div>
    )
  }

  return <SitesClient client={clientResult.result} initialSites={sitesResult.result} />
}
