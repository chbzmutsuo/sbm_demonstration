import {getTbmBase_MonthConfig} from '@app/(apps)/tbm/(server-actions)/getBasics'
import {fetchRuisekiKyoriKichoData} from '@app/(apps)/tbm/(server-actions)/fetchRuisekiKyoriKichoData'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {NumHandler} from '@cm/class/NumHandler'
import {FitMargin, R_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import EmptyPlaceholder from '@cm/components/utils/loader/EmptyPlaceHolder'
import Redirector from '@cm/components/utils/Redirector'
import {dateSwitcherTemplate} from '@cm/lib/methods/redirect-method'

import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function Page(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  const {tbmBaseId} = scopes.getTbmScopes()
  const {redirectPath, whereQuery} = await dateSwitcherTemplate({query})
  if (redirectPath) return <Redirector {...{redirectPath}} />

  const yearMonth = whereQuery.gte ?? getMidnight()

  const {TbmBase_MonthConfig} = await getTbmBase_MonthConfig({yearMonth, tbmBaseId})

  const userListWithCarHistory = await fetchRuisekiKyoriKichoData({
    tbmBaseId,
    whereQuery,
    TbmBase_MonthConfig,
  })

  return (
    <FitMargin className={`pt-4`}>
      <NewDateSwitcher {...{monthOnly: true}} />
      <R_Stack className={`w-full items-start gap-8`}>
        {userListWithCarHistory.map(data => {
          const {user, allCars} = data
          const {id: userId} = user

          return (
            <div key={userId} className={`t-paper w-[500px] p-2`}>
              <R_Stack className={` w-full justify-between`}>
                {/* <span>{user.code}</span> */}
                <h2>{user.name}</h2>
                <span className="text-sm text-gray-500">{user.code}</span>
              </R_Stack>
              {allCars.length > 0 ? (
                CsvTable({
                  records: allCars.map(data => {
                    const {car, sokoKyoriInPeriod, heikinNempiInPeriod, sokyuyuRyoInPeriod, fuelCostInPeriod} = data

                    return {
                      csvTableRow: [
                        {
                          label: `車番`,
                          cellValue: car.vehicleNumber,
                        },
                        {
                          label: `走行距離計`,
                          cellValue: NumHandler.WithUnit(sokoKyoriInPeriod, 'km', 1),
                          style: {textAlign: `right`},
                        },
                        {
                          label: `平均燃費`,
                          cellValue: NumHandler.WithUnit(heikinNempiInPeriod, 'km/L', 1),
                          style: {textAlign: `right`},
                        },
                        {
                          label: `総給油量`,
                          cellValue: NumHandler.WithUnit(sokyuyuRyoInPeriod, 'L', 1),
                          style: {textAlign: `right`},
                        },

                        {
                          label: `使用金額`,
                          cellValue: NumHandler.WithUnit(fuelCostInPeriod, '円', 1),
                        },
                      ],
                    }
                  }),
                }).WithWrapper({className: 't-paper'})
              ) : (
                <EmptyPlaceholder>データがありません</EmptyPlaceholder>
              )}
            </div>
          )
        })}
      </R_Stack>
    </FitMargin>
  )
}
