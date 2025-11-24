import { fetchUnkoKaisuData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoKaisuData'

import { FitMargin } from '@cm/components/styles/common-components/common-components'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import { dateSwitcherTemplate } from '@cm/lib/methods/redirect-method'

import { initServerComopnent } from 'src/non-common/serverSideFunction'

export default async function Page(props) {
 const query = await props.searchParams
 const { session, scopes } = await initServerComopnent({ query })
 const { tbmBaseId } = scopes.getTbmScopes()
 const { redirectPath, whereQuery } = await dateSwitcherTemplate({ query })

 if (redirectPath) return <Redirector {...{ redirectPath }} />

 const { UnkoKaisuRecords, userList } = await fetchUnkoKaisuData({ whereQuery, tbmBaseId })

 return (
  <FitMargin className={`pt-4`}>
   <NewDateSwitcher {...{ monthOnly: true }} />
   {CsvTable({
    records: UnkoKaisuRecords.map(record => {
     const { keyValue } = record

     // 列の順序を定義: コード、便名、各ユーザー、合計、通行料、運賃、付帯料金、通行料(税抜)、通行料(税込)、通行料差額
     const rightItemKeys = [
      'total',
      'tollFee',
      'freightRevenue',
      'futaiFee',
      'tollFeeExclTax',
      'tollFeeInclTax',
      'tollFeeDifference',
     ]
     const orderedKeys = [
      'CD',
      'routeName',
      'name',
      ...userList.map(user => `user_${user.id}`),
      ...rightItemKeys
     ]





     return {
      csvTableRow: orderedKeys
       .map(key => {
        const item = keyValue[key]

        const isUserCell = userList.map(user => `user_${user.id}`).includes(key)
        const style = isUserCell ? { minWidth: 50, } : { minWidth: 120 }
        return {
         ...item,
         cellValue: item?.cellValue ?? '',
         style: style,
        }
       }),
     }
    }),
   }).WithWrapper({
    className: `text-sm max-w-[95vw] max-h-[80vh]`,
   })}
  </FitMargin>
 )
}

