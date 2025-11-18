import {fetchErrorCheckData} from '@app/(apps)/tbm/(server-actions)/fetchErrorCheckData'
import {FitMargin, R_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import EmptyPlaceholder from '@cm/components/utils/loader/EmptyPlaceHolder'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {NumHandler} from '@cm/class/NumHandler'
import prisma from 'src/lib/prisma'

import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {Card} from '@cm/shadcn/ui/card'
import LabelValue from '@cm/shadcn/ui/Organisms/LabelValue'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

export default async function Page(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})

  // すべての営業所を取得
  const allTbmBases = await prisma.tbmBase.findMany({
    orderBy: {
      code: 'asc',
    },
  })

  // 各営業所ごとにエラーデータを取得
  const errorDataByBase = await Promise.all(
    allTbmBases.map(async tbmBase => {
      const errorData = await fetchErrorCheckData({tbmBaseId: tbmBase.id})
      return {
        tbmBase,
        ...errorData,
      }
    })
  )

  return (
    <FitMargin className={`pt-4`}>
      <R_Stack className={`w-full items-start gap-8 flex-wrap`}>
        {errorDataByBase.map(({tbmBase, odometerErrors, driveScheduleErrors}) => (
          <Card key={tbmBase.id} className={` max-w-[360px] w-fit `}>
            <h2 className={`mb-4 text-lg font-bold`}>{tbmBase.name}</h2>
            {tbmBase.code && <p className={`mb-4 text-sm text-gray-500`}>コード: {tbmBase.code}</p>}

            <R_Stack className={`w-full items-start gap-6`}>
              {/* オドメーター入力エラー */}
              <div className={`w-full`}>
                <h3 className={`mb-2 text-base font-semibold`}>オドメーター入力エラー</h3>
                <p className={`mb-2 text-xs text-gray-600`}>開始のみ入力で、終了が入っていないもの</p>
                {odometerErrors.length > 0 ? (
                  CsvTable({
                    records: odometerErrors.map(error => {
                      return {
                        csvTableRow: [
                          {
                            label: `日付`,
                            cellValue: formatDate(error.date),
                          },
                          {
                            label: `車番`,
                            cellValue: (
                              <div>
                                <R_Stack>{error.TbmVehicle?.vehicleNumber ?? '-'}</R_Stack>
                                <R_Stack>{error.User?.name ?? '-'}</R_Stack>
                              </div>
                            ),
                          },

                          {
                            label: `オドメーター`,
                            cellValue: (
                              <div>
                                <R_Stack>
                                  開始:<div>{NumHandler.WithUnit(error.odometerStart, 'km', 1)}</div>
                                </R_Stack>
                                <R_Stack>
                                  終了:<div>{NumHandler.WithUnit(error.odometerEnd, 'km', 1)}</div>
                                </R_Stack>
                              </div>
                            ),
                          },
                        ],
                      }
                    }),
                  }).WithWrapper({className: '[&_td]:!text-[12px] w-[340px]'})
                ) : (
                  <EmptyPlaceholder>エラーはありません</EmptyPlaceholder>
                )}
              </div>

              {/* 運行入力エラー */}
              <div className={`w-full`}>
                <h3 className={`mb-2 text-base font-semibold`}>運行入力エラー</h3>
                <p className={`mb-2 text-xs text-gray-600`}>
                  運行入力は「完了」されているが、ドライバーの締めや管理者の承認がされていないもの
                </p>
                {driveScheduleErrors.length > 0 ? (
                  CsvTable({
                    records: driveScheduleErrors.map(error => {
                      return {
                        csvTableRow: [
                          {
                            label: `日付`,
                            cellValue: formatDate(error.date),
                          },

                          {
                            label: `車番`,
                            cellValue: (
                              <div>
                                {/* <R_Stack>{error.TbmVehicle?.vehicleNumber ?? '-'}</R_Stack>
                                <R_Stack>{error.TbmVehicle?.name ?? '-'}</R_Stack> */}
                                <R_Stack>{error.TbmRouteGroup?.routeName ?? '-'}</R_Stack>
                                <R_Stack>{error.TbmRouteGroup?.name ?? '-'}</R_Stack>
                                <R_Stack>{error.User?.name ?? '-'}</R_Stack>
                              </div>
                            ),
                          },

                          {
                            label: `運行完了/ドライバー締め/管理者承認`,
                            cellValue: (
                              <div>
                                <LabelValue
                                  label="運行完了"
                                  value={
                                    <IconBtn color={error.finished ? 'gray' : 'red'} className="!text-[10px] p-0 px-1">
                                      {error.finished ? 'OK' : 'NG'}
                                    </IconBtn>
                                  }
                                />
                                <LabelValue
                                  label="締め"
                                  value={
                                    <IconBtn color={error.confirmed ? 'gray' : 'red'} className="!text-[10px] p-0 px-1">
                                      {error.confirmed ? 'OK' : 'NG'}
                                    </IconBtn>
                                  }
                                />
                                <LabelValue
                                  label="承認"
                                  value={
                                    <IconBtn color={error.approved ? 'gray' : 'red'} className="!text-[10px] p-0 px-1">
                                      {error.approved ? 'OK' : 'NG'}
                                    </IconBtn>
                                  }
                                />
                              </div>
                            ),
                            style: {width: 100},
                          },
                        ],
                      }
                    }),
                  }).WithWrapper({className: '[&_td]:!text-[12px] w-[340px]'})
                ) : (
                  <EmptyPlaceholder>エラーはありません</EmptyPlaceholder>
                )}
              </div>
            </R_Stack>
          </Card>
        ))}
      </R_Stack>
    </FitMargin>
  )
}
