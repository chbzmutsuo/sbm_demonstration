'use client'

import React, { useMemo } from 'react'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

import { C_Stack, FitMargin, R_Stack } from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { getUserWorkStatusForMonth, UserWorkStatusItem } from '@app/(apps)/tbm/(server-actions)/userWorkStatusActions'
import { getMidnight } from '@cm/class/Days/date-utils/calculations'
import InlineEditField from './components/InlineEditField'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import useSWR from 'swr'
import { TBM_CODE } from '@app/(apps)/tbm/(class)/TBM_CODE'
import { TimeHandler } from '@app/(apps)/tbm/(class)/TimeHandler'
import { UseWorkStatusCl } from '@app/(apps)/tbm/(class)/UseWorkStatusCl'
import { Days } from '@cm/class/Days/Days'
import { T_LINK } from '@cm/components/styles/common-components/links'
import { HREF } from '@cm/lib/methods/urls'
import { Alert } from '@cm/components/styles/common-components/Alert'
import { MarkDownDisplay } from '@cm/components/utils/texts/MarkdownDisplay'

export default function AttendancePage() {
  const { query, session } = useGlobal()

  const {
    data,
    isLoading,
    mutate: fetchData,
    error,
  } = useSWR(JSON.stringify([query.g_userId, query.month]), async () => {
    const tbmBaseId = session.scopes?.getTbmScopes?.()?.tbmBaseId
    const selectedUserId = session.scopes?.getTbmScopes?.()?.userId
    const theDate = getCurrentMonth()
    return await getUserWorkStatusForMonth({
      tbmBaseId,
      userId: selectedUserId,
      yearMonth: theDate,
    })
  })

  const User = data as Awaited<ReturnType<typeof getUserWorkStatusForMonth>>

  const { UserWorkStatus = [], TbmRefuelHistory = [], OdometerInput = [], TbmDriveSchedule = [] } = User ?? {}

  const selectedUserId = query.g_userId ? parseInt(query.g_userId) : undefined

  // 現在の月を取得（クエリパラメータから、または現在の日付から）
  const getCurrentMonth = () => {
    if (query.month) {
      return new Date(query.month)
    }
    if (query.from) {
      return new Date(query.from)
    }
    return getMidnight()
  }

  const theDate = getCurrentMonth()

  const { days: daysInMonth } = Days.month.getMonthDatum(theDate)

  const SummaryTable = useMemo(() => {
    // UseWorkStatusClを使用した月間サマリー計算
    const monthlySummaryResult = UseWorkStatusCl.calculateMonthlySummary(UserWorkStatus, selectedUserId, daysInMonth)

    const { monthlyTotals, summary } = monthlySummaryResult

    return (
      <C_Stack className="items-start ">
        <div>
          <div>
            {CsvTable({
              records: [
                {
                  csvTableRow: [
                    { label: '出勤日数', cellValue: summary.workDays },
                    { label: '公休日数', cellValue: summary.holidays },
                    { label: '欠勤日数', cellValue: summary.absences },
                    { label: '休日出勤', cellValue: summary.holidayWork },
                    { label: '早退日数', cellValue: summary.earlyLeave },
                    { label: '有給休暇', cellValue: summary.paidLeave },
                    { label: '総出勤日数', cellValue: summary.totalWorkDays },
                  ],
                },
              ],
              chunked: { enabled: false },
            }).WithWrapper({})}
          </div>
        </div>

        <div>
          {CsvTable({
            records: [
              {
                csvTableRow: [
                  { label: '拘束時間', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.kosokuMins) },
                  { label: '労働時間', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.rodoMins) },
                  { label: '一日平均', cellValue: UseWorkStatusCl.formatMinutesToTime(Math.round(summary.averageDailyHours)) },
                  { label: '所定内', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.shoteinai) },
                  { label: '時間外1', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.jikangai1) },
                  { label: '時間外2', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.jikangai2) },
                  { label: '深夜', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.shinyaZangyo) },
                  { label: '休日勤務', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.kyujitsuShukkin) },
                  { label: '月間距離', cellValue: '-' },
                  { label: '給油量', cellValue: '-' },
                  { label: '燃費', cellValue: '-' },
                ],
              },
            ],
            chunked: { enabled: false },
          }).WithWrapper({})}
        </div>
      </C_Stack>
    )
  }, [UserWorkStatus, selectedUserId, daysInMonth])

  const DailyRecordsTable = useMemo(() => {
    if (!selectedUserId) {
      return <Alert color="yellow">ユーザーを選択してください</Alert>
    }
    // 各ユーザーの各日付のレコードを作成
    const records = daysInMonth.map(date => {
      const userWorkStatus = UserWorkStatus.find(item => {
        return item.userId === selectedUserId && Days.validate.isSameDate(new Date(item.date), date)
      })

      // 走行距離の計算 - そのドライバーがその日に走行した距離をOdometerInputから算出
      const odometerInput = OdometerInput.filter(item => {
        return item.userId === selectedUserId && Days.validate.isSameDate(item.date, date)
      }).reduce((acc, item) => {
        acc += item.odometerEnd - item.odometerStart
        return acc
      }, 0)

      // 給油量の計算 - そのドライバーがその日に実施した給油合計をTbmRefuelHistoryから計算
      const tbmRefuelHistory = TbmRefuelHistory.filter(item => {
        return item.userId === selectedUserId && Days.validate.isSameDate(item.date, date)
      }).reduce((acc, item) => {
        acc += item.amount
        return acc
      }, 0)

      // 車番の取得 - そのドライバーがその日に走った車両をカンマ区切りで出力
      const vehicleNumbers = TbmDriveSchedule.filter(
        item => item.userId === selectedUserId && Days.validate.isSameDate(item.date, date) && item.TbmVehicle
      )
        .map(item => item.TbmVehicle?.vehicleNumber)
        .filter((value, index, self) => value && self.indexOf(value) === index) // 重複排除
        .join('\n')

      // 運行内容の取得 - その人の、当日のTbmDriveScheduleの内容をカンマ区切りで出力
      const driveContents = TbmDriveSchedule.filter(
        item => item.userId === selectedUserId && Days.validate.isSameDate(item.date, date)
      )
        .map(item => `${item.TbmRouteGroup?.name}【${item.TbmRouteGroup?.routeName}】`)
        .filter(Boolean)
        .join('\n')

      const useWorkStatusCl = new UseWorkStatusCl(userWorkStatus as UserWorkStatusItem)

      const {
        kosokuMins,
        rodoMins,
        kyukeiMins,
        shinyaKyukeiMins,
        kyusokuMins,
        shoteinai,
        jikangai1,
        shinyaZangyo,
        kyujitsuShukkin,
        shinyaTime,
      } = useWorkStatusCl.getAllTimeData()

      const dateStr = formatDate(date, 'DD(ddd)')

      const driveInputPageHref = HREF('/tbm/driver/driveInput', { g_userId: selectedUserId, from: date }, query)

      return {
        csvTableRow: [
          // isDev && {label: 'id', cellValue: <T_LINK href={driveInputPageHref}>{userWorkStatus?.id}</T_LINK>},
          { label: '日付', cellValue: <T_LINK href={driveInputPageHref}>{dateStr}</T_LINK> },
          {
            label: '勤怠',
            cellValue: (
              <InlineEditField
                value={userWorkStatus?.workStatus || ''}
                userId={selectedUserId}
                date={date}
                fieldName="workStatus"
                placeholder=""
                onUpdate={fetchData}
                select={{
                  options: TBM_CODE.WORK_STATUS_KBN.array.map(item => ({
                    label: item.label,
                    value: item.code,
                  })),
                }}
              />
            ),
          },
          {
            label: '車番',
            cellValue: (
              <small>
                <MarkDownDisplay>{vehicleNumbers || ''}</MarkDownDisplay>
              </small>
            ),
            style: { minWidth: 120 },
          },
          {
            label: '出社時間',
            cellValue: (
              <InlineEditField
                value={userWorkStatus?.startTime || ''} // TODO: 別フィールドとして実装
                userId={selectedUserId}
                date={date}
                fieldName="startTime"
                type="time"
                placeholder="--:--"
                onUpdate={fetchData}
              />
            ),
          },
          {
            label: '退社時間',
            cellValue: (
              <InlineEditField
                value={userWorkStatus?.endTime || ''} // TODO: 別フィールドとして実装
                userId={selectedUserId}
                date={date}
                fieldName="endTime"
                type="time"
                placeholder="--:--"
                onUpdate={fetchData}
              />
            ),
          },
          {
            label: '走行距離',
            cellValue: odometerInput,
            className: odometerInput < 0 ? 'bg-red-500 text-white' : ''
          }, // TODO: 別データソースから取得
          { label: '給油量', cellValue: tbmRefuelHistory }, // TODO: 別データソースから取得
          {
            label: '拘束時間',
            cellValue: kosokuMins ? TimeHandler.minutesToTimeString(kosokuMins) : '',
          },
          {
            label: '労働時間',
            cellValue: rodoMins ? TimeHandler.minutesToTimeString(rodoMins) : '',
          },
          {
            label: '休憩時間',
            cellValue: (
              <InlineEditField
                value={userWorkStatus?.kyukeiMins || ''}
                userId={selectedUserId}
                date={date}
                fieldName="kyukeiMins"
                type="time"
                placeholder="--:--"
                onUpdate={fetchData}
              />
            ),
          },
          {
            label: '深夜休憩',
            cellValue: (
              <InlineEditField
                value={userWorkStatus?.shinyaKyukeiMins || ''}
                userId={selectedUserId}
                date={date}
                fieldName="shinyaKyukeiMins"
                type="time"
                placeholder="--:--"
                onUpdate={fetchData}
              />
            ),
          },
          {
            label: '休息時間',
            cellValue: (
              <InlineEditField
                value={userWorkStatus?.kyusokuMins || ''}
                userId={selectedUserId}
                date={date}
                fieldName="kyusokuMins"
                type="time"
                placeholder="--:--"
                onUpdate={fetchData}
              />
            ),
          },
          {
            label: '所定内',
            cellValue: shoteinai ? TimeHandler.minutesToTimeString(shoteinai) : '',
          },
          {
            label: '時間外1',
            cellValue: jikangai1 ? TimeHandler.minutesToTimeString(jikangai1) : '',
          },
          {
            label: '深夜時間',
            cellValue: shinyaTime ? TimeHandler.minutesToTimeString(shinyaTime) : '',
          },
          {
            label: '深夜残業',
            cellValue: shinyaZangyo ? TimeHandler.minutesToTimeString(shinyaZangyo) : '',
          },
          {
            label: '休日出勤',
            cellValue: kyujitsuShukkin ? TimeHandler.minutesToTimeString(kyujitsuShukkin) : '',
          },
          {
            label: '運行内容',
            cellValue: (
              <small>
                <MarkDownDisplay>{driveContents || ''}</MarkDownDisplay>
              </small>
            ),
            style: { minWidth: 240 },
          },
        ]
          .filter(Boolean)
          .map((d: any) => ({ ...d, style: { minWidth: 80, ...d.style } })),
      }
    })

    // 月間合計行を追加
    const monthlySummaryResult = UseWorkStatusCl.calculateMonthlySummary(UserWorkStatus, selectedUserId, daysInMonth)
    const { monthlyTotals } = monthlySummaryResult

    const totalRow = {
      className: 'bg-blue-50 font-bold',
      csvTableRow: [
        { label: '日付', cellValue: '合計' },
        { label: '勤怠', cellValue: '' },
        { label: '車番', cellValue: '' },
        { label: '出社時間', cellValue: '' },
        { label: '退社時間', cellValue: '' },
        { label: '走行距離', cellValue: '' },
        { label: '給油量', cellValue: '' },
        { label: '拘束時間', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.kosokuMins) },
        { label: '労働時間', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.rodoMins) },
        { label: '休憩時間', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.kyukeiMins) },
        { label: '深夜休憩', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.shinyaKyukeiMins) },
        { label: '休息時間', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.kyusokuMins) },
        { label: '所定内', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.shoteinai) },
        { label: '時間外1', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.jikangai1) },
        { label: '深夜時間', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.shinyaTime) },
        { label: '深夜残業', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.shinyaZangyo) },
        { label: '休日出勤', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.kyujitsuShukkin) },
        { label: '運行内容', cellValue: '' },
      ].map(d => ({ ...d, style: { minWidth: 80 } })),
    }

    const allRecords = [...records, totalRow]

    return (
      <div>
        {CsvTable({ records: allRecords }).WithWrapper({
          className: 'max-h-none',
        })}
      </div>
    )
  }, [UserWorkStatus, selectedUserId, daysInMonth])

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  return (
    <FitMargin className="pt-4">
      <div>
        <C_Stack className="items-start gap-8">
          <R_Stack className={` items-start justify-between  w-full`}>
            {SummaryTable}
            <div className={` w-fit`}>
              <NewDateSwitcher
                {...{
                  monthOnly: true,
                  additionalCols: [{ label: '', id: 'g_userId', forSelect: {} }],
                }}
              />
            </div>
          </R_Stack>
          {DailyRecordsTable}
        </C_Stack>
      </div>
    </FitMargin>
  )
}
