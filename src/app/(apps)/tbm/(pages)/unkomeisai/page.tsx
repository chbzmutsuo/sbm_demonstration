import UnkoMeisaiCC from '@app/(apps)/tbm/(pages)/unkomeisai/UnkoMeisaiCC'

import {FitMargin} from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import {dateSwitcherTemplate} from '@cm/lib/methods/redirect-method'

import {initServerComopnent} from 'src/non-common/serverSideFunction'

import {fetchUnkoMeisaiData} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'

export default async function Page(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  const {tbmBaseId} = scopes.getTbmScopes()
  const {redirectPath, whereQuery} = await dateSwitcherTemplate({query})

  if (redirectPath) return <Redirector {...{redirectPath}} />

  const {monthlyTbmDriveList, ConfigForMonth} = await fetchUnkoMeisaiData({
    whereQuery,
    tbmBaseId,
    userId: undefined,
  })

  return (
    <FitMargin className={`pt-4`}>
      <NewDateSwitcher {...{monthOnly: true}} />
      <UnkoMeisaiCC {...{monthlyTbmDriveList}} />
    </FitMargin>
  )
}
