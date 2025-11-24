
import { getTbmBase_MonthConfig } from '@app/(apps)/tbm/(server-actions)/getBasics'
import { getNenpiDataByCar } from '@app/(apps)/tbm/(server-actions)/getNenpiDataByCar'
import { FitMargin } from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import { dateSwitcherTemplate } from '@cm/lib/methods/redirect-method'
import prisma from 'src/lib/prisma'

import { initServerComopnent } from 'src/non-common/serverSideFunction'
import React from 'react'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { NumHandler } from '@cm/class/NumHandler'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { KeyValue } from '@cm/components/styles/common-components/ParameterCard'
import EmptyPlaceholder from '@cm/components/utils/loader/EmptyPlaceHolder'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'
import { TbmReportCl } from '@app/(apps)/tbm/(class)/TbmReportCl'


export default async function Page(props) {
  const query = await props.searchParams
  const { session, scopes } = await initServerComopnent({ query })
  const { tbmBaseId } = scopes.getTbmScopes()
  const { redirectPath, whereQuery } = await dateSwitcherTemplate({ query })
  if (redirectPath) return <Redirector {...{ redirectPath }} />

  const { TbmBase_MonthConfig } = await getTbmBase_MonthConfig({ yearMonth: whereQuery.gte, tbmBaseId })
  const { nenpiKanriDataListByCar } = await getNenpiDataByCar({ tbmBaseId, whereQuery, TbmBase_MonthConfig })

  const vehicleList = await prisma.tbmVehicle.findMany({
    where: { tbmBaseId },
    orderBy: [{ code: 'asc' }, { id: 'asc' }],
    include: {
      TbmRefuelHistory: {
        where: { date: whereQuery },
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
      },
    },
  })

  const lastRefuelHistoryByCar = await prisma.tbmVehicle.findMany({
    where: { tbmBaseId },
    orderBy: [{ code: 'asc' }, { id: 'asc' }],
    include: { TbmRefuelHistory: { where: { date: { lt: whereQuery.gte } } } },
  })

  return (
    <FitMargin className={`pt-4`}>
      <NewDateSwitcher {...{ monthOnly: true }} />
      <AutoGridContainer maxCols={{ lg: 2, '2xl': 3 }} className={`mx-auto w-fit gap-8`}>
        {vehicleList.map((vehicle, idx) => {
          const nenpiKanriData = nenpiKanriDataListByCar.find(data => data?.vehicle?.id === vehicle.id)




          const flexChild = `w-1/2 px-1`

          const prevRefuelHistory = [
            ...lastRefuelHistoryByCar
              .filter(v => v.id === vehicle.id)
              .map(v => v.TbmRefuelHistory)
              .flat(),
          ]
          prevRefuelHistory.sort((a, b) => {
            const sortByodometer = b.odometer - a.odometer
            const sortByDate = b.date.getTime() - a.date.getTime()
            if (sortByodometer === 0) {
              return sortByDate
            }
            return sortByodometer
          })

          const hasHistory = vehicle.TbmRefuelHistory.length > 0
          return (
            <div key={idx} className={`t-paper w-[450px]  p-2 `}>
              <div>
                <section>
                  <R_Stack className={` text-lg font-bold justify-between`}>
                    <span>{vehicle?.vehicleNumber}</span>
                    <span className="text-sm text-gray-500">{vehicle?.frameNo}</span>
                  </R_Stack>
                </section>

                <section className={`${hasHistory ? 'opacity-100' : 'opacity-20'}`}>
                  <R_Stack className={`gap-0 text-lg`}>
                    <div className={flexChild}>
                      <KeyValue label="総走行距離">
                        <strong>{NumHandler.toPrice(nenpiKanriData?.sokoKyoriInPeriod)}</strong>
                      </KeyValue>
                    </div>
                    <div className={flexChild}>
                      <KeyValue label="総給油量">
                        <strong>{NumHandler.toPrice(nenpiKanriData?.sokyuyuRyoInPeriod)}</strong>
                      </KeyValue>
                    </div>
                    <div className={flexChild}>
                      <KeyValue label="燃費">
                        <strong>{NumHandler.toPrice(nenpiKanriData?.heikinNempiInPeriod)}</strong>
                      </KeyValue>
                    </div>
                    <div className={flexChild}>
                      <KeyValue label="金額">
                        <strong>{NumHandler.toPrice(nenpiKanriData?.fuelCostInPeriod)}</strong>
                      </KeyValue>
                    </div>
                  </R_Stack>
                </section>

                <section>
                  {hasHistory ? (
                    <>
                      {CsvTable({
                        records: (vehicle.TbmRefuelHistory ?? []).map((current, i) => {

                          const prev = vehicle.TbmRefuelHistory[i - 1] ?? prevRefuelHistory[0]

                          const kukanKyori = TbmReportCl.getKukankYori(prev?.odometer ?? 0, current.odometer ?? 0)

                          const kyuyuryo = current.amount
                          const nempi = kukanKyori && kyuyuryo ? kukanKyori / kyuyuryo : null

                          return {
                            csvTableRow: [
                              //
                              { label: '日付', cellValue: formatDate(current.date, 'short') },
                              { label: '給油時走行距離', cellValue: current.odometer },
                              { label: '区間距離', cellValue: kukanKyori ?? '-' },
                              { label: '給油量', cellValue: kyuyuryo },
                              { label: '燃費', cellValue: nempi ? NumHandler.round(nempi) : '-' },
                            ],
                          }
                        }),
                      }).WithWrapper({ className: '' })}
                    </>
                  ) : (
                    <EmptyPlaceholder>データがありません</EmptyPlaceholder>
                  )}
                </section>
              </div>
            </div>
          )
        })}
      </AutoGridContainer>
    </FitMargin>
  )
}
