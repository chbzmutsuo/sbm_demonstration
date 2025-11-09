'use client'

import React, {useState, useEffect, useMemo} from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Days} from '@cm/class/Days/Days'
import {getMonthlyTbmDriveData} from '@app/(apps)/tbm/(server-actions)/fetchUnkoMeisaiData'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Button} from '@cm/components/styles/common-components/Button'
import {ChevronLeft, ChevronRight} from 'lucide-react'
import useLocalLoading from '@cm/hooks/globalHooks/useLocalLoading'
import {showSpendTime} from '@cm/lib/methods/toast-helper'
import {cn} from '@cm/shadcn/lib/utils'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {TimeHandler} from '@app/(apps)/tbm/(class)/TimeHandler'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {HREF} from '@cm/lib/methods/urls'

export default function MonthlySchedulePage() {
  const {query, session, addQuery} = useGlobal()
  const {LocalLoader, toggleLocalLoading} = useLocalLoading()

  const scopes = getScopes(session, {query})
  const {tbmBaseId, userId} = scopes.getTbmScopes()

  // queryからパラメータを取得（デフォルトは現在の年月と全ドライバー）
  const currentDate = new Date()
  const defaultYearMonth = formatDate(currentDate, 'YYYY-MM')
  const selectedYearMonth = query.yearMonth || defaultYearMonth
  const selectedDriverId = userId

  const [monthlyData, setMonthlyData] = useState<any>(null)
  const [userList, setUserList] = useState<any[]>([])

  // 年月選択の変更
  const handleYearMonthChange = (newYearMonth: string) => {
    addQuery({yearMonth: newYearMonth})
  }

  // ドライバー選択の変更
  const handleDriverChange = (newDriverId: string) => {
    addQuery({driverId: newDriverId})
  }

  // 前月・次月ボタン
  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentYearMonth = new Date(selectedYearMonth + '-01')
    const newDate = new Date(currentYearMonth)
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    const newYearMonth = formatDate(newDate, 'YYYY-MM')
    handleYearMonthChange(newYearMonth)
  }

  // データ取得
  const fetchData = async () => {
    if (!tbmBaseId) return

    toggleLocalLoading(async () => {
      await showSpendTime(async () => {
        try {
          // 選択された年月の期間を作成
          const startDate = new Date(selectedYearMonth + '-01')
          const endDate = new Date(startDate)
          endDate.setMonth(endDate.getMonth() + 1)

          const whereQuery = {
            gte: startDate,
            lte: endDate,
          }

          // 月間運行データを取得
          const data = await getMonthlyTbmDriveData({
            whereQuery,
            tbmBaseId,
            userId: selectedDriverId,
          })

          setMonthlyData(data)

          const {result: allUsers} = await doStandardPrisma('user', 'findMany', {
            where: {tbmBaseId},
            select: {
              id: true,
              code: true,
              name: true,
            },
            orderBy: {code: 'asc'},
          })
          setUserList(allUsers)
        } catch (error) {
          console.error('データ取得エラー:', error)
        }
      })
    })
  }

  useEffect(() => {
    fetchData()
  }, [selectedYearMonth, tbmBaseId, selectedDriverId])

  // カレンダー表示用のデータ処理
  const calendarData = useMemo(() => {
    if (!monthlyData) return null

    const startDate = new Date(selectedYearMonth + '-01')
    const monthDatum = Days.month.getMonthDatum(startDate)
    const weeks = monthDatum.getWeeks('日')

    // 選択されたドライバーのスケジュールをフィルタリング
    const filteredSchedules = monthlyData.monthlyTbmDriveList.filter(item => {
      // if (selectedDriverId === 'all') return false
      return item.schedule?.User?.id === selectedDriverId
    })

    // 日付別にスケジュールを整理
    const schedulesByDate = filteredSchedules.reduce((acc, item) => {
      const dateKey = formatDate(item.schedule.date, 'YYYY-MM-DD')
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(item)
      return acc
    }, {})

    return {
      weeks,
      schedulesByDate,
      startDate,
    }
  }, [monthlyData, selectedDriverId, selectedYearMonth])

  if (!calendarData) {
    return (
      <div>
        <LocalLoader />
        <div>データを読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="p-6 ">
      <LocalLoader />

      {/* ヘッダー部分 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">月間スケジュール</h1>

        {/* コントロール部分 */}
        <div className="flex items-center gap-4 mb-4 mx-auto w-fit">
          {/* 年月選択 */}
          <div className="flex items-center gap-2">
            <Button onClick={() => navigateMonth('prev')} className="p-2">
              <ChevronLeft size={16} />
            </Button>

            <input
              type="month"
              value={selectedYearMonth}
              onChange={e => handleYearMonthChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />

            <Button onClick={() => navigateMonth('next')} className="p-2">
              <ChevronRight size={16} />
            </Button>
          </div>

          {/* ドライバー選択
          <div className="flex items-center gap-2">
            <label className="font-medium">ドライバー:</label>
            <select
              value={selectedDriverId}
              onChange={e => handleDriverChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md min-w-[200px]"
            >
              <option value=""></option>
              {userList.map(user => (
                <option key={user.id} value={user.id.toString()}>
                  {user.code} - {user.name}
                </option>
              ))}
            </select>
          </div> */}
        </div>
      </div>

      {/* カレンダー部分 */}
      <div className="mx-auto w-fit print-target p-4 border">
        <div className="mb-4">
          <strong className="text-xl flex items-center gap-2">
            <span>{formatDate(calendarData.startDate, 'YYYY年MM月')} </span>
            <span>個別スケジュール</span>
            <span>:</span>
            <span>
              {(() => {
                const user = userList.find(u => u.id.toString() === selectedDriverId)
                return user ? `${user.name}` : ''
              })()}
            </span>
          </strong>
          <div></div>
        </div>

        <table className=" border-[1px]">
          <thead>
            <tr>
              {calendarData.weeks[0]?.map((day, idx) => {
                const dayStr = formatDate(day, 'ddd')
                const isWeekend = dayStr === '土' || dayStr === '日'

                return (
                  <th
                    key={idx}
                    className={`text-center p-2 ${isWeekend ? 'bg-red-50 text-red-600' : 'bg-blue-50'}`}
                    style={{minWidth: '100px'}}
                  >
                    {dayStr}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {calendarData.weeks.map((week, weekIdx) => (
              <tr key={weekIdx}>
                {week.map((date, dayIdx) => {
                  const dayStr = formatDate(date, 'D(ddd)')
                  const dateKey = formatDate(date, 'YYYY-MM-DD')
                  const onThisMonth = formatDate(date, 'MM') === formatDate(calendarData.startDate, 'MM')
                  const isToday = Days.validate.isSameDate(date, new Date())
                  const isWeekend = formatDate(date, 'ddd') === '土' || formatDate(date, 'ddd') === '日'
                  const schedules = calendarData.schedulesByDate[dateKey] || []

                  let cellStyle = {}
                  if (isToday) {
                    cellStyle = {backgroundColor: '#ffeb3b'}
                  } else if (isWeekend) {
                    cellStyle = {backgroundColor: '#ffebee'}
                  }

                  if (onThisMonth) {
                    return (
                      <td key={dayIdx} style={cellStyle} className="border p-1">
                        <T_LINK
                          simple
                          target="_blank"
                          href={HREF(
                            '/tbm/driver/driveInput',
                            {
                              from: formatDate(date, 'YYYY-MM-DD'),
                              g_userId: selectedDriverId,
                              g_tbmBaseId: tbmBaseId,
                            },
                            query
                          )}
                        >
                          <C_Stack className="h-[140px]   gap-0.5 w-full text-sm">
                            {/* 日付表示 */}
                            <div
                              className={cn(
                                'text-right font-bold ',
                                formatDate(date, 'ddd') === '土' && 'text-blue-600',
                                formatDate(date, 'ddd') === '日' && 'text-red-600'
                              )}
                            >
                              {dayStr}
                            </div>

                            {/* スケジュール表示 */}
                            <div className="space-y-2 leading-3">
                              {schedules.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="text-[10px] bg-blue-100 ring-blue-300 ring rounded px-1 py-0.5 truncate"
                                >
                                  <div className="font-semibold">{/* {item.schedule.User.code} {item.schedule.User.name} */}</div>
                                  <div className="text-gray-600">{item.schedule.TbmRouteGroup?.name}</div>
                                  {/* <div className="text-gray-400">{item.schedule.TbmRouteGroup?.routeName}</div> */}
                                  {item.schedule.TbmVehicle && (
                                    <div className="text-gray-500">{item.schedule.TbmVehicle.vehicleNumber}</div>
                                  )}

                                  <div className={`text-red-500`}>
                                    {TimeHandler.formatTimeString(item.schedule.TbmRouteGroup?.departureTime, 'display')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </C_Stack>
                        </T_LINK>
                      </td>
                    )
                  } else {
                    return (
                      <td key={dayIdx} className="border p-1 text-gray-300">
                        <div className="h-[120px] w-full text-sm"></div>
                      </td>
                    )
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
