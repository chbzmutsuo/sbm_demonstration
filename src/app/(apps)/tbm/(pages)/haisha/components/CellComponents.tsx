'use client'
import React from 'react'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {R_Stack, C_Stack} from '@cm/components/styles/common-components/common-components'
import {CarIcon, Clock, MapPinIcon, Notebook, PlusCircleIcon, SquarePen, TruckIcon, UserIcon} from 'lucide-react'
import Link from 'next/link'
import {HREF} from '@cm/lib/methods/urls'
import {createUpdate} from '@cm/lib/methods/createUpdate'
import {TBM_STATUS} from '@app/(apps)/tbm/(constants)/TBM_STATUS'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {VehicleCl} from '@app/(apps)/tbm/(class)/VehicleCl'
import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {RouteGroupCl} from '@app/(apps)/tbm/(class)/RouteGroupCl'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import {cn} from '@cm/shadcn/lib/utils'
import {
  WorkStatusSelectorProps,
  AddScheduleButtonProps,
  ScheduleCardProps,
  StatusButtonsProps,
  UserWithWorkStatus,
} from '../types/haisha-page-types'
import {shorten} from '@cm/lib/methods/common'
import {TimeHandler} from '@app/(apps)/tbm/(class)/TimeHandler'

const WorkStatusList = TBM_CODE.WORK_STATUS_KBN.array

// 作業ステータス選択コンポーネント
export const WorkStatusSelector = React.memo(({userWorkStatus, user, date, fetchData}: WorkStatusSelectorProps) => (
  <select
    value={userWorkStatus?.workStatus ?? ''}
    className={`w-[100px] rounded-sm border  p-0.5 ${userWorkStatus?.workStatus ? '' : 'bg-gray-200 opacity-80'}`}
    onChange={async e => {
      const unique_userId_date = {
        userId: user?.id ?? 0,
        date: date,
      }
      await doStandardPrisma(`userWorkStatus`, `upsert`, {
        where: {unique_userId_date},
        ...createUpdate({...unique_userId_date, workStatus: e.target.value}),
      })
      fetchData()
    }}
  >
    <option value="">-</option>
    {WorkStatusList.map((workStatus, i) => (
      <option key={i} value={workStatus.code}>
        {workStatus.label}
      </option>
    ))}
  </select>
))

// 配車追加ボタンコンポーネント
export const AddScheduleButton = React.memo(({date, tbmBase, user, tbmRouteGroup, setModalOpen}: AddScheduleButtonProps) => (
  <PlusCircleIcon
    className="onHover text-gray-500 h-4 w-4 hover:text-gray-700"
    onClick={() =>
      setModalOpen({
        date,
        tbmBase,
        user,
        tbmRouteGroup,
      })
    }
  />
))

// ステータスボタンコンポーネント
export const StatusButtons = React.memo(({tbmDriveSchedule, fetchData}: StatusButtonsProps) => (
  <R_Stack className="justify-end gap-1">
    {Object.entries(TBM_STATUS).map(([key, value], i) => {
      const {label, color} = value as {label: string; color: string}
      const active = tbmDriveSchedule[key]

      return (
        <IconBtn
          key={i}
          active={active}
          rounded={false}
          className={`text-[12px] !px-1.5   cursor-pointer`}
          color={color}
          onClick={async () => {
            if (key === 'approved') {
              const isApproved = tbmDriveSchedule.approved
              const confirmed = tbmDriveSchedule.confirmed

              if (isApproved) {
                if (confirm('承認を取り消してよろしいですか？')) {
                  await doStandardPrisma(`tbmDriveSchedule`, `update`, {
                    where: {id: tbmDriveSchedule.id},
                    data: {approved: false},
                  })
                  fetchData()
                }
              } else {
                if (!confirmed) {
                  if (confirm('ドライバーが確定処理を実施していません。強制承認をしてもよろしいですか？')) {
                    if (confirm('承認してよろしいですか？')) {
                      await doStandardPrisma(`tbmDriveSchedule`, `update`, {
                        where: {id: tbmDriveSchedule.id},
                        data: {approved: true},
                      })
                      fetchData()
                    }
                  }
                } else {
                  if (confirm('承認してよろしいですか？')) {
                    await doStandardPrisma(`tbmDriveSchedule`, `update`, {
                      where: {id: tbmDriveSchedule.id},
                      data: {approved: true},
                    })
                    fetchData()
                  }
                }
              }
            } else {
              alert('「運行」、「締め」入力はドライバー画面から実施できます。')
            }
          }}
        >
          {label}
        </IconBtn>
      )
    })}
  </R_Stack>
))

// スケジュール詳細カードコンポーネント
export const ScheduleCard = React.memo(
  ({tbmDriveSchedule, user, date, setModalOpen, fetchData, query, tbmBase}: ScheduleCardProps) => {
    const {TbmRouteGroup, TbmVehicle, User, remark} = tbmDriveSchedule

    // const foo = new vhi

    return (
      <div
        className={cn(
          `border border-gray-300 rounded-sm p-1  hover:shadow-sm transition-shadow`,
          tbmDriveSchedule.duplicated ? 'bg-red-300' : 'white'
        )}
      >
        <C_Stack className="gap-1 relative">
          <div className={` absolute top-0 right-0 text-[10px] text-gray-500`}>{tbmDriveSchedule.id}</div>
          <section className={`row-stack flex-nowrap gap-0 leading-4 -ml-1.5`}>
            <MapPinIcon className={`h-3 text-blue-800 stroke-2 `} />
            <MarkDownDisplay>{new RouteGroupCl(TbmRouteGroup).name}</MarkDownDisplay>
          </section>

          <section className={`row-stack flex-nowrap gap-0 leading-4 -ml-1.5`}>
            <Clock className={`h-3 text-blue-800 stroke-2 `} />
            <span>
              {(() => {
                const departureTime = TimeHandler.formatTimeString(TbmRouteGroup.departureTime, 'display')
                const finalArrivalTime = TimeHandler.formatTimeString(TbmRouteGroup.finalArrivalTime, 'display')

                if (departureTime && finalArrivalTime) {
                  return `${departureTime} - ${finalArrivalTime}`
                } else if (departureTime) {
                  return `出発: ${departureTime}`
                } else if (finalArrivalTime) {
                  return `到着: ${finalArrivalTime}`
                } else {
                  return '時刻未設定'
                }
              })()}
            </span>
          </section>

          <section className={`row-stack flex-nowrap gap-0 leading-4 -ml-1.5`}>
            <CarIcon className={`h-3 text-blue-800 stroke-2 `} />

            {TbmVehicle ? new VehicleCl(TbmVehicle).shortName : <span className={`text-red-500`}>未設定</span>}
          </section>

          <section className={`row-stack flex-nowrap gap-0 leading-4 -ml-1.5`}>
            <UserIcon className={`h-3 text-blue-800 stroke-2 `} />

            {user ? user?.name : <span className={`text-red-500`}>未設定</span>}
          </section>
          <section className={`row-stack flex-nowrap gap-0 leading-4 -ml-1.5`}>
            <Notebook className={`h-3 text-blue-800 stroke-2 `} />

            <div className={remark ? '' : 'text-gray-500 opacity-60'}>{shorten(remark || '特記なし', 15)}</div>
          </section>

          <R_Stack className="justify-between">
            <R_Stack>
              <SquarePen
                className="text-blue-main onHover h-3.5 w-3.5"
                onClick={() => {
                  setModalOpen({
                    tbmDriveSchedule,
                    user: user as UserWithWorkStatus,
                    date,
                    tbmBase,
                  })
                }}
              />
              <Link target="_blank" href={HREF('/tbm/driver/driveInput', {g_userId: User?.id, from: formatDate(date)}, query)}>
                <TruckIcon className="text-yellow-main w-4 h-4 hover:opacity-80" />
              </Link>
            </R_Stack>

            <StatusButtons tbmDriveSchedule={tbmDriveSchedule} fetchData={fetchData} />
          </R_Stack>
        </C_Stack>
      </div>
    )
  }
)
