'use client'

import React, {Dispatch, SetStateAction, useState} from 'react'
import {AlertTriangle, CheckCircle} from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {updateDailyStaffAssignment} from './_actions/dashboard-actions'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {cn} from '@cm/shadcn/lib/utils'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'
import {NumHandler} from '@cm/class/NumHandler'

type ProductData = {
  id: number
  name: string
  color: string
  productionCapacity: number
  allowanceStock: number
  monthlyTarget: number
  monthStartStock: number
  monthlyProduction: number
  monthlyShipment: number
  currentStock: number
  remainingTarget: number
  targetAchievementRate: number
  expectedProduction: number
  excessExpected: number
  scheduledProduction: number
  isFullFilledOnLastDay: boolean
}

export type DailyPlan = {
  productId: number
  productName: string
  productColor: string
  monthlyTarget: number
  dailyTarget: number
  dailyCapacity: number
  staffCount: number
  actualProduction: number
  cumulativeProduction: number
  remainingWorkingDays: number
  isRisky: boolean
}

type CalendarDay = {
  day: number | null
  date?: string
  dayOfWeek?: number
  isHoliday?: boolean
  isPast?: boolean
  isToday?: boolean
  plans?: DailyPlan[]
}

type DashboardClientProps = {
  products: ProductData[]
  calendar: {
    year: number
    month: number
    days: CalendarDay[]
  }
  workingDays: number[]
}

const DashboardClient = ({products, calendar, workingDays}: DashboardClientProps) => {
  const {toggleLoad} = useGlobal()
  const DayModalReturn = useModal<{day: CalendarDay}>()
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [dashboardData, setDashboardData] = useState({products, calendar, workingDays})
  const [staffCounts, setStaffCounts] = useState<Record<number, number>>({})

  const handleDayClick = (day: CalendarDay) => {
    if (day.day) {
      setSelectedDay(day)
      // 選択した日のプランから初期値を設定
      const initialStaffCounts: Record<number, number> = {}
      day.plans?.forEach(plan => {
        initialStaffCounts[plan.productId] = plan.staffCount
      })
      setStaffCounts(initialStaffCounts)
      DayModalReturn.handleOpen({day})
    }
  }

  const handleStaffCountSubmit = async (productId: number) => {
    await toggleLoad(async () => {
      if (!selectedDay?.date) return

      const staffCount = staffCounts[productId]
      if (staffCount === undefined) return

      // await toggleLoad(async () => {
      const result = await updateDailyStaffAssignment(new Date(selectedDay.date!), productId, staffCount)

      // if (result.success) {
      //   // ダッシュボード全体のデータを再取得
      //   const dashboardResult = await getDashboardData(new Date())
      //   if (dashboardResult.success && dashboardResult.data) {
      //     setDashboardData(dashboardResult.data)

      //     // 選択中の日のデータも更新
      //     const updatedDay = dashboardResult.data.calendar.days.find(d => d.date === selectedDay.date)
      //     if (updatedDay) {
      //       setSelectedDay(updatedDay)
      //       // 更新された値で staffCounts も更新
      //       const updatedStaffCounts: Record<number, number> = {}
      //       updatedDay.plans?.forEach(plan => {
      //         updatedStaffCounts[plan.productId] = plan.staffCount
      //       })
      //       setStaffCounts(updatedStaffCounts)
      //     }
      //   }
      // } else {
      //   alert(result.error || '人員配置の更新に失敗しました')
      // }
    })
    // })
  }

  const dayLabels = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">生産管理ダッシュボード</h1>
          <p className="text-sm text-gray-600 mt-1">
            {dashboardData.calendar.year}年 {dashboardData.calendar.month}月 / 稼働日: {dashboardData.workingDays.length}日
          </p>
        </div>
      </div>

      {/* 製品別テーブル */}
      <ProductSummaryTable products={dashboardData.products} />

      {/* 月間生産スケジュール */}
      <Calendar dashboardData={dashboardData} handleDayClick={handleDayClick} dayLabels={dayLabels} />

      {/* 日別モーダル */}
      <DayModalReturn.Modal title={selectedDay?.date ? `${formatDate(new Date(selectedDay.date))} の生産計画` : '生産計画'}>
        <DailyModal {...{selectedDay, staffCounts, setStaffCounts, handleStaffCountSubmit}} />
      </DayModalReturn.Modal>
    </div>
  )
}

export default DashboardClient

const Calendar = ({dashboardData, handleDayClick, dayLabels}) => {
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* カレンダー */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
          {/* 曜日ヘッダー */}
          {dayLabels.map((label, index) => (
            <div
              key={label}
              className={`bg-gray-50 p-2 text-center text-xs font-semibold ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {label}
            </div>
          ))}

          {/* 日付セル */}
          {dashboardData.calendar.days.map((day, index) => {
            if (!day.day) {
              return <div key={`empty-${index}`} className="bg-white min-h-[120px] min-w-[180px]" />
            }

            const fullfilledInLastDay = day.plans?.some(plan => plan.actualProduction === plan.dailyCapacity)

            const isHoliday = day.isHoliday
            const isPast = day.isPast
            const isToday = day.isToday

            const dayClassName = cn(
              `bg-white min-h-[120px] min-w-[180px] p-2 cursor-pointer hover:bg-gray-50 transition-colors border-l border-t`,
              isHoliday ? 'bg-gray-100' : '',
              isToday ? 'ring-2 ring-blue-500' : ''
            )

            return (
              <div key={day.day} className={dayClassName} onClick={() => handleDayClick(day)}>
                {/* 日付 */}
                <div
                  className={`text-sm font-medium mb-1 ${day.isToday ? 'text-blue-600' : day.isHoliday ? 'text-red-500' : ''}`}
                >
                  {day.day}
                </div>

                {/* 製品別生産計画 */}
                {day.plans && (
                  <div className="space-y-1">
                    {day.plans.map(plan => {
                      const productData = dashboardData.products.find(p => p.id === plan.productId)
                      const {isFullFilledOnLastDay} = productData

                      const isRisky = plan.isRisky
                      const dailyTarget = plan.dailyTarget

                      let itemBgClassName = ''
                      let itemTextClassName = ''

                      if (isPast) {
                        itemBgClassName = 'bg-gray-200  opacity-80'
                        itemTextClassName = 'text-gray-700  '
                      } else {
                        itemBgClassName = 'bg-gray-50 '

                        if (isFullFilledOnLastDay) {
                          itemBgClassName = 'bg-green-50 '
                        } else {
                          itemBgClassName = 'bg-red-50 '
                        }

                        if (isRisky) {
                          // itemBgClassName = 'bg-red-50 '
                          itemTextClassName = 'text-red-700 font-bold'
                        } else {
                          // itemBgClassName = 'bg-green-50 '
                          itemTextClassName = 'text-green-700 font-bold'
                        }
                      }

                      const diff = plan.dailyCapacity - dailyTarget

                      return (
                        <C_Stack key={plan.productId} className={cn(`text-xs p-1 rounded 0.5 `, itemBgClassName)}>
                          <R_Stack className=" gap-1 justify-between w-full">
                            <R_Stack className={` gap-0.5`}>
                              {!!dailyTarget && !isPast && (
                                <div>
                                  {isRisky && <AlertTriangle className={cn('w-3 h-3', itemTextClassName)} strokeWidth={4} />}
                                  {!isRisky && <CheckCircle className={cn('w-3 h-3', itemTextClassName)} strokeWidth={3} />}
                                </div>
                              )}

                              <span className="font-medium truncate">
                                {plan.productName}({plan.productColor})
                              </span>
                            </R_Stack>

                            {!!plan.actualProduction && (
                              <div className={` ml-auto px-2 py-1 rounded-full bg-blue-100 border-blue-500 border text-blue-600`}>
                                <div className={plan.actualProduction ? 'font-bold ' : 'opacity-50'}>
                                  <C_Stack className={`gap-0.5 leading-2`}>
                                    {/* <span className={`text-[8px] text-gray-600`}>実績</span> */}
                                    <span>済{plan.actualProduction}</span>
                                  </C_Stack>
                                </div>
                              </div>
                            )}
                          </R_Stack>

                          <R_Stack className=" gap-0.5">
                            {!isPast && (
                              <R_Stack className={`gap-0.5`}>
                                <R_Stack className={cn('gap-2   items-baseline-last')}>
                                  <C_Stack className={`gap-0.5 leading-2`}>
                                    <span className={`text-[8px] text-gray-600`}>見込</span>
                                    <span>{plan.dailyCapacity}</span>
                                  </C_Stack>
                                  <span>/</span>
                                  <C_Stack className={`gap-0.5 leading-2`}>
                                    <span className={`text-[8px] text-gray-600`}>目標</span>
                                    <span>{NumHandler.round(plan.dailyTarget, 1)}</span>
                                  </C_Stack>

                                  <span className={itemTextClassName}>
                                    ({diff > 0 ? `+${NumHandler.round(diff, 1)}` : NumHandler.round(diff, 1)})
                                  </span>
                                </R_Stack>
                              </R_Stack>
                            )}
                          </R_Stack>
                        </C_Stack>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const DailyModal = ({
  selectedDay,
  staffCounts,
  setStaffCounts,
  handleStaffCountSubmit,
}: {
  selectedDay: CalendarDay | null
  staffCounts: Record<number, number>
  setStaffCounts: Dispatch<SetStateAction<Record<number, number>>>
  handleStaffCountSubmit: (productId: number) => void
}) => {
  return (
    <>
      {selectedDay?.plans && (
        <AutoGridContainer {...{maxCols: {xl: 2, '2xl': 3}, className: 'gap-8'}}>
          {selectedDay.plans.map(plan => (
            <div key={plan.productId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">
                  {plan.productName}（{plan.productColor}）
                </h3>
                {plan.isRisky ? (
                  <span className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    危険
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    安全
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">月間生産目標</p>
                  <p className="text-lg font-semibold">{plan.monthlyTarget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">昨日までの実績</p>
                  <p className="text-lg font-semibold">{plan.cumulativeProduction.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">今日の生産目標</p>
                  <p className="text-lg font-semibold text-orange-600">{plan.dailyTarget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">今日の生産能力</p>
                  <p className={`text-lg font-semibold ${plan.isRisky ? 'text-red-600' : 'text-green-600'}`}>
                    {plan.dailyCapacity.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">残りの稼働日</p>
                  <p className="text-lg font-semibold">{plan.remainingWorkingDays}日</p>
                </div>
                <div>
                  <p className="text-gray-600">本日の実績</p>
                  <p className="text-lg font-semibold text-blue-600">{plan.actualProduction.toLocaleString()}</p>
                </div>
              </div>

              {/* 人員配置設定 */}
              <div className="mt-4 pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">割り当て人員数</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={(staffCounts[plan.productId] ?? plan.staffCount) || ''}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                    onChange={e => {
                      const newCount = e.target.value ? parseInt(e.target.value ?? 0) : 0

                      if (!isNaN(newCount)) {
                        setStaffCounts(prev => ({
                          ...prev,
                          [plan.productId]: newCount,
                        }))
                      }
                    }}
                  />
                  <span className="text-sm text-gray-600">人</span>
                  <button
                    onClick={() => handleStaffCountSubmit(plan.productId)}
                    disabled={staffCounts[plan.productId] === undefined || staffCounts[plan.productId] === plan.staffCount}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    確定
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  （能力: {staffCounts[plan.productId] ?? plan.staffCount} ×{' '}
                  {(plan.dailyCapacity / plan.staffCount / 8 || 0).toFixed(1)} 枚/人・時 × 8時間 ={' '}
                  {((staffCounts[plan.productId] ?? plan.staffCount) * (plan.dailyCapacity / plan.staffCount)).toLocaleString()}）
                </div>
              </div>
            </div>
          ))}
        </AutoGridContainer>
      )}
    </>
  )
}

const ProductSummaryTable = ({products}: {products: ProductData[]}) => {
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden w-fit">
      <div
        className={cn(
          //
          'overflow-x-auto',
          '[&_th]:p-2',
          '[&_th]:text-xs',
          '[&_td]:p-2',
          '[&_td]:text-xs',
          '[&_td]:text-center'
        )}
      >
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left">製品名（カラー）</th>

              <th className="">生産実績</th>
              <th>+</th>
              <th className="">生産予定</th>
              <th>-</th>
              <th className="">
                月間目標
                <br />
                <R_Stack className={`text-[10px] bg-gray-200 text-gray-600 gap-1 p-1`}>
                  <span>過去3ヶ月受注平均 </span>
                  <span>-</span>
                  <span>月初在庫</span>
                </R_Stack>
              </th>
              <th>=</th>
              <th className="">過不足予定数</th>

              {/* <th className="">月初在庫</th> */}
              {/* <th className="">今月出荷</th> */}
              {/* <th className="">現在在庫</th> */}
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="">
                  {product.name}（{product.color}）
                </td>
                <td className="text-blue-600">{product.monthlyProduction.toLocaleString()}</td>
                <td>+</td>
                <td>
                  <C_Stack className={`gap-1`}>
                    <span className="text-orange-600">{product.scheduledProduction.toLocaleString()}</span>
                    <span className="text-gray-600 text-[10px]">(必要数:{product.remainingTarget.toLocaleString()})</span>
                  </C_Stack>
                </td>
                <td>-</td>
                <td>
                  <div className="bg-yellow-300 border-2 border-yellow-500 p-1">{product.monthlyTarget.toLocaleString()}</div>
                </td>

                <td>=</td>
                <td
                  className={cn(
                    '  font-semibold ',
                    product.isFullFilledOnLastDay ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                  )}
                >
                  {NumHandler.withPlusMinus(product.excessExpected)}
                </td>

                {/* <td className="font-semibold text-orange-600">{product.remainingTarget.toLocaleString()}</td> */}
                {/* <td className="">{product.monthStartStock.toLocaleString()}</td> */}
                {/* <td className="">{product.monthlyShipment.toLocaleString()}</td>

                <td className="font-semibold">{product.currentStock.toLocaleString()}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
