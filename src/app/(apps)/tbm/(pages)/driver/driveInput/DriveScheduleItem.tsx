'use client'

import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import {TimeHandler} from '@app/(apps)/tbm/(class)/TimeHandler'
import {RouteGroupCl} from '@app/(apps)/tbm/(class)/RouteGroupCl'
import {driveInputPageType} from '@app/(apps)/tbm/(pages)/driver/driveInput/driveInput-page-type'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'

import {TextBlue, TextGray, TextGreen, TextRed} from '@cm/components/styles/common-components/Alert'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import BasicModal from '@cm/components/utils/modal/BasicModal'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import React from 'react'
import {isDev} from '@cm/lib/methods/common'

export const DriveScheduleItem = (props: {
  HK_HaishaTableEditorGMF: any
  drive: driveInputPageType['driveScheduleList'][number]
  finished: boolean
  TextBtnClass: string
  useGlobalProps: any
}) => {
  const {drive, finished, TextBtnClass, HK_HaishaTableEditorGMF, useGlobalProps} = props
  const {toggleLoad, session, query} = useGlobalProps

  return (
    <R_Stack className="gap-4 relative">
      <div className={` absolute top-0 right-0 text-[10px] text-gray-500`}>{drive.id}</div>
      <section>
        <C_Stack>
          <span
            {...{
              onClick: async () => {
                toggleLoad(async () => {
                  await doStandardPrisma(`tbmDriveSchedule`, `update`, {
                    where: {id: drive.id},
                    data: {finished: !finished},
                  })
                })
              },
            }}
          >
            {finished ? <TextGreen className={TextBtnClass}>完了</TextGreen> : <TextRed className={TextBtnClass}>未</TextRed>}
          </span>
          <small>{formatDate(drive.date)}</small>
        </C_Stack>
      </section>

      <section>
        <C_Stack className={`gap-0`}>
          <strong>
            <MarkDownDisplay>{new RouteGroupCl(drive.TbmRouteGroup).name}</MarkDownDisplay>
          </strong>
          <TextBlue
            {...{
              className: TextBtnClass,
              onClick: async item => {
                HK_HaishaTableEditorGMF.setGMF_OPEN({
                  tbmDriveSchedule: drive,
                  user: session,
                  date: drive.date,
                  tbmBase: drive.TbmBase,
                  tbmRouteGroup: drive.TbmRouteGroup,
                })
              },
            }}
          >
            {drive.TbmVehicle?.vehicleNumber}
          </TextBlue>
          <R_Stack>
            <TextGray>出発: {TimeHandler.formatTimeString(drive.TbmRouteGroup?.departureTime, 'display') ?? '未設定'}</TextGray>
            <TextGray>
              到着: {TimeHandler.formatTimeString(drive.TbmRouteGroup?.finalArrivalTime, 'display') ?? '未設定'}
            </TextGray>
          </R_Stack>
        </C_Stack>
      </section>

      <section>
        <BasicModal Trigger={<div className={`t-link`}>画像({drive.TbmDriveScheduleImage.length})</div>}>
          <ChildCreator
            {...{
              ParentData: drive,
              useGlobalProps,
              additional: {
                include: {TbmDriveSchedule: {}},
              },

              models: {parent: `tbmDriveSchedule`, children: `tbmDriveScheduleImage`},
              columns: ColBuilder.tbmDriveScheduleImage({
                useGlobalProps,
                ColBuilderExtraProps: {tbmDriveScheduleId: drive.id},
              }),
            }}
          />
        </BasicModal>
      </section>
    </R_Stack>
  )
}
