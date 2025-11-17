'use client'

import {
  jquants_getStockList,
  upsertStockHistory,
  updateAlgorithm,
} from '@app/(excluded)/stock/api/jquants-server-actions/jquants-getter'
import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {Button} from '@cm/components/styles/common-components/Button'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import {createUpdate} from '@cm/lib/methods/createUpdate'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {twMerge} from 'tailwind-merge'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

import {HREF} from '@cm/lib/methods/urls'
import useWindowSize from '@cm/hooks/useWindowSize'
import {sleep} from '@cm/lib/methods/common'

export default function TemplateBottomButton() {
  const {toggleLoad, pathname, query} = useGlobal()
  const {PC} = useWindowSize()

  const theDate = toUtc(query.from ?? new Date())

  if (!query.from) {
    return <Redirector {...{redirectPath: HREF(pathname, {from: formatDate(theDate), ...query}, query)}} />
  }

  return (
    <div>
      <div className={` fixed bottom-16 center-x z-[100] container `}>
        <C_Stack className={twMerge(`  items-center `, ` gap-4 mx-auto p-4  t-paper  justify-center w-fit bg-blue-50 `)}>
          <NewDateSwitcher />

          <Button
            className={``}
            onClick={async () => {
              toggleLoad(async () => {
                const list = await jquants_getStockList({})

                const res = await doTransaction({
                  transactionQueryList: list.map(data => {
                    const Date = toUtc(data.Date)
                    return {
                      model: `stock`,
                      method: `upsert`,
                      queryObject: {
                        where: {Code: data.Code},
                        ...createUpdate({...data, Date}),
                      },
                    }
                  }),
                })
              })
            }}
          >
            ①銘柄一覧
          </Button>

          {/* <Button
              className={``}
              onClick={async () => {
                toggleLoad(async () => {
                  // await doStandardPrisma(`stock`, `updateMany`, {
                  //   data: {favorite: 0, heldCount: 0, averageBuyPrice: 0},
                  // })
                  await doTransaction({
                    transactionQueryList: seedData.map(data => {
                      const {Code, HeldCount, AverageBuyPrice} = data

                      return {
                        model: `stock`,
                        method: `update`,
                        queryObject: {
                          where: {Code: `${Code}0`},
                          data: {
                            favorite: 1,
                            heldCount: HeldCount,
                            averageBuyPrice: AverageBuyPrice,
                          },
                        },
                      }
                    }),
                  })
                })
              }}
            >
              ①Fav反映
            </Button> */}

          <Button
            className={``}
            onClick={async () => {
              toggleLoad(async () => {
                await upsertStockHistory({date: theDate})
              })
            }}
          >
            ②当日
          </Button>

          <Button
            className={``}
            onClick={async () => {
              toggleLoad(async () => {
                await updateAlgorithm({date: theDate})
              })
            }}
          >
            ③バロメータ
          </Button>

          {PC && (
            <Button
              className={``}
              onClick={async () => {
                toggleLoad(async () => {
                  const days = Days.day.getDaysBetweenDates(theDate, new Date())

                  for (let i = 0; i < days.length; i++) {
                    const date = days[i]
                    await updateFunc({date})
                    await sleep(1000)
                  }

                  return
                })
              }}
            >
              一括処理（複数）
            </Button>
          )}
          {PC && (
            <Button
              className={``}
              onClick={async () => {
                toggleLoad(async () => {
                  if (confirm('履歴を削除しますか？')) {
                    await doStandardPrisma(`stockHistory`, `deleteMany`, {where: {id: {gte: 0}}})
                  }
                })
              }}
            >
              履歴削除
            </Button>
          )}
        </C_Stack>
      </div>
    </div>
  )

  return null
}

const updateFunc = async ({date}) => {
  const res = await fetch(`/stock/api/cron/4_dailyBatchAll?date=${formatDate(date)}`)

  console.log(res.json())
}
