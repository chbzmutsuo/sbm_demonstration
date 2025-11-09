'use client'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {Fields} from '@cm/class/Fields/Fields'
import React, {useMemo, useState} from 'react'
import {getVehicleForSelectConfig} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Button} from '@cm/components/styles/common-components/Button'
import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'

import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {createUpdate} from '@cm/lib/methods/createUpdate'
import {NumHandler} from '@cm/class/NumHandler'
import {superTrim} from '@cm/lib/methods/common'
import {Days} from '@cm/class/Days/Days'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import {toastByResult} from '@cm/lib/ui/notifications'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import {Card} from '@cm/shadcn/ui/card'

export default function EtcConnectForm({EtcConnectFormMD, tbmVehicleId}) {
  const [groupList, setgroupList] = useState<any[]>([])

  const {firstDayOfMonth} = Days.month.getMonthDatum(new Date())
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: new Fields([
      {
        id: `tbmVehicleId`,
        label: `車両`,
        form: {defaultValue: tbmVehicleId ?? null},
        forSelect: {config: getVehicleForSelectConfig({})},
      },
      {
        id: `month`,
        label: `月`,
        form: {defaultValue: firstDayOfMonth},
        type: `month`,
      },
      {
        id: `url`,
        label: `url`,
        type: 'textarea',
        form: {
          defaultValue: `https://docs.google.com/spreadsheets/d/1Xlbx_2LpgEMGHOp6jSIU56IW7AV5Ms7gr0vs1kYb8PM/edit?gid=1281425023#gid=1281425023`,
        },
      },
    ]).transposeColumns(),
  })

  const doConnect = async () => {
    if (!confirm(`すでに当月データがある場合、上書きされます。よろしいですか？`)) return
    const {tbmVehicleId, url, month} = latestFormData ?? {}
    const res = await doTransaction({
      transactionQueryList: groupList.map((obj: any, i) => {
        const unique_tbmVehicleId_groupIndex_month = {
          tbmVehicleId,
          groupIndex: i + 1,
          month,
        }

        const sum = obj.data.reduce((acc, data) => acc + data.toll, 0)

        return {
          model: `tbmEtcMeisai`,
          method: `upsert`,
          queryObject: {
            where: {unique_tbmVehicleId_groupIndex_month},
            ...createUpdate({
              ...unique_tbmVehicleId_groupIndex_month,
              info: obj.data.map(data => JSON.stringify(data)),
              sum,
            }),
          },
        }
      }),
    })

    toastByResult(res)
    EtcConnectFormMD.handleClose()
  }

  const TableMemo = useMemo(() => {
    // データがなければnullを返す

    return CsvTable({
      virtualized: {enabled: false},
      records: groupList.map((row: any, i) => {
        const {data} = row ?? {}
        if (!data || data.length === 0) return {csvTableRow: []}

        const firstMeisai = data[0]
        const lastMeisai = data[data.length - 1]
        const sum = data.reduce((acc, item) => acc + item.toll, 0)

        return {
          csvTableRow: [
            {label: `連番`, cellValue: i + 1},
            {label: '出発', cellValue: firstMeisai.fromDatetime},
            {label: '到着', cellValue: lastMeisai.toDatetime},
            {label: '出発IC', cellValue: firstMeisai.fromIc},
            {label: '到着IC', cellValue: lastMeisai.toIc},
            {label: '請求額', cellValue: sum},
          ],
        }
      }),
    }).WithWrapper({className: `max-h-[240px]`})
  }, [groupList])

  return (
    <C_Stack className={` items-center p-4 gap-10 `}>
      <Card className={`w-full`}>
        <strong>① スプレッドシートの設定</strong>
        <BasicForm
          {...{
            latestFormData,
            onSubmit: async data => {
              const {tbmVehicleId, url, month} = data
              const {result: tbmVehicle} = await doStandardPrisma(`tbmVehicle`, `findUnique`, {where: {id: tbmVehicleId}})

              const {frameNo, vehicleNumber, type, shape} = tbmVehicle

              const {values} = await GoogleSheet_Read({
                spreadsheetId: url,
                range: `${frameNo}!A5:N`,
              })

              const grouped = {}
              values?.forEach(value => {
                const [a, b, c, fromDate, fromTime, toDate, toTime, fromIc, toIc, originalToll, discount, toll, sum, grouping] =
                  value

                if (!b) return

                const fromDatetime = `${fromDate} ${fromTime}`
                const toDatetime = `${toDate} ${toTime}`

                obj__initializeProperty(grouped, b, {data: []})

                const record = {
                  fromDatetime,
                  toDatetime,
                  fromIc,
                  toIc,
                  originalToll,
                  discount: NumHandler.round(Number(superTrim(discount)), 0),
                  toll: NumHandler.round(Number(superTrim(toll)), 0),
                  sum: NumHandler.round(Number(superTrim(sum)), 0),
                }

                grouped[b].data.push(record)
              })

              const groupedList = Object.values(grouped)

              setgroupList(groupedList)
            },
          }}
        >
          <C_Stack className={` items-center`}>
            <Button>スプレッドシートを読み込む</Button>
          </C_Stack>
        </BasicForm>
      </Card>

      <Card className={`w-full`}>
        <strong>② 読み込み結果の確認</strong>
        {TableMemo}
      </Card>
      <Card className={`w-full`}>
        <strong>③ 連携実施</strong>
        {groupList.length > 0 && (
          <C_Stack className={` items-center`}>
            <Button color="blue" onClick={doConnect}>
              データをアプリに反映する
            </Button>
          </C_Stack>
        )}
      </Card>
    </C_Stack>
  )
}
