// 'use client'
// import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
// import {Fields} from '@cm/class/Fields/Fields'
// import React, {useState} from 'react'
// import {getVehicleForSelectConfig} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
// import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
// import {Button} from '@cm/components/styles/common-components/Button'
// import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'

// import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
// import {createUpdate} from '@cm/lib/methods/createUpdate'
// import {NumHandler} from '@cm/class/NumHandler'
// import {superTrim} from '@cm/lib/methods/common'
// import {Days} from '@cm/class/Days/Days'
// import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'

// export default function page() {
//   const [list, setlist] = useState<any[]>([])

//   const {firstDayOfMonth} = Days.month.getMonthDatum(new Date())
//   const {BasicForm, latestFormData} = useBasicFormProps({
//     columns: new Fields([
//       //k
//       {
//         id: `tbmVehicleId`,
//         label: `車両`,
//         form: {
//           defaultValue: 1,
//         },
//         forSelect: {config: getVehicleForSelectConfig({})},
//       },
//       {
//         id: `month`,
//         label: `月`,
//         form: {defaultValue: firstDayOfMonth},
//         type: `month`,
//       },
//       {
//         id: `url`,
//         label: `url`,
//         form: {
//           defaultValue: `https://docs.google.com/spreadsheets/d/1Xlbx_2LpgEMGHOp6jSIU56IW7AV5Ms7gr0vs1kYb8PM/edit?gid=1281425023#gid=1281425023`,
//           style: {minWidth: 600},
//         },
//       },
//     ]).transposeColumns(),
//   })

//   return (
//     <BasicForm
//       {...{
//         alignMode: `row`,
//         latestFormData,
//         onSubmit: async data => {
//           const {tbmVehicleId, url, month} = data

//           const {result: tbmVehicle} = await doStandardPrisma(`tbmVehicle`, `findUnique`, {where: {id: tbmVehicleId}})

//           const {frameNo, vehicleNumber, type, shape} = tbmVehicle

//           const {values} = await GoogleSheet_Read({
//             spreadsheetId: url,
//             range: `${frameNo}!A5:N`,
//           })

//           const grouped = {}
//           values?.forEach(value => {
//             const [a, b, c, fromDate, fromTime, toDate, toTime, fromIc, toIc, originalToll, discount, toll, sum, grouping] = value

//             if (!b) return

//             const fromDatetime = `${fromDate} ${fromTime}`
//             const toDatetime = `${toDate} ${toTime}`

//             obj__initializeProperty(grouped, b, {
//               data: [],
//             })

//             grouped[b].data.push({
//               fromDatetime,
//               toDatetime,
//               fromIc,
//               toIc,
//               originalToll,
//               discount: NumHandler.round(Number(superTrim(discount)), 0),
//               toll: NumHandler.round(Number(superTrim(toll)), 0),
//               sum: NumHandler.round(Number(superTrim(sum)), 0),
//             })
//           })

//           const groupedList = Object.values(grouped)

//           const res = await doTransaction({
//             transactionQueryList: groupedList.map((obj: any, i) => {
//               const unique_tbmVehicleId_groupIndex_month = {
//                 tbmVehicleId,
//                 groupIndex: i + 1,
//                 month,
//               }

//               const sum = obj.data.reduce((acc, data) => acc + data.toll, 0)

//               return {
//                 model: `tbmEtcMeisai`,
//                 method: `upsert`,
//                 queryObject: {
//                   where: {unique_tbmVehicleId_groupIndex_month},
//                   ...createUpdate({
//                     ...unique_tbmVehicleId_groupIndex_month,

//                     info: obj.data.map(data => JSON.stringify(data)),
//                     sum,
//                   }),
//                 },
//               }
//             }),
//           })

//           //
//         },
//       }}
//     >
//       <Button>連携</Button>
//     </BasicForm>
//   )
//   return <div></div>
// }
