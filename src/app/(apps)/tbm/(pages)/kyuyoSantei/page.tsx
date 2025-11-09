import {fetchKyuyoSanteiData} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchKyuyoSanteiData'

import {FitMargin} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import {dateSwitcherTemplate} from '@cm/lib/methods/redirect-method'

import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function Page(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  const {tbmBaseId} = scopes.getTbmScopes()
  const {redirectPath, whereQuery} = await dateSwitcherTemplate({query})

  if (redirectPath) return <Redirector {...{redirectPath}} />

  const {KyuyoSanteiRecords} = await fetchKyuyoSanteiData({whereQuery, tbmBaseId})

  return (
    <FitMargin className={`pt-4`}>
      <NewDateSwitcher {...{monthOnly: true}} />
      {CsvTable({
        records: KyuyoSanteiRecords.map(item => {
          const {keyValue} = item
          return {csvTableRow: Object.keys(keyValue).map(key => item.keyValue[key])}
        }),
      }).WithWrapper({
        className: `text-sm max-w-[95vw] max-h-[80vh]`,
      })}
    </FitMargin>
  )
}
