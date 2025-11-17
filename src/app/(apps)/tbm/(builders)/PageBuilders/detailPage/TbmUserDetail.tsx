'use client'

import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'
import {DetailPagePropType} from '@cm/types/types'

import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'

export default function TbmUserDetail(props: DetailPagePropType) {
  const {useGlobalProps} = props
  const {query} = useGlobalProps

  const userId = props.formData?.id
  const {data: calendar = []} = useDoStandardPrisma(`userWorkStatus`, `findMany`, {where: {userId}, orderBy: {date: 'asc'}})

  const theMonth = toUtc(query.month ?? query.from ?? new Date())
  const theYear = theMonth.getFullYear()

  const {firstDateOfYear, lastDateOfYear, getAllMonthsInYear} = Days.year.getYearDatum(theYear)
  const months = getAllMonthsInYear()

  const days = Days.day.getDaysBetweenDates(firstDateOfYear, lastDateOfYear)
  const defaultSelectedDays = calendar.filter(c => c.holidayType === '稼働').map(c => c.date)

  return (
    <BasicTabs
      {...{
        id: `tbmVechicleDetailPage`,
        showAll: false,
        TabComponentArray: [
          {label: `基本情報`, component: <MyForm {...props}></MyForm>},
          // {
          //   label: `稼働予定`,
          //   component: (
          //     <div>
          //       <BulkCalendarSetter
          //         {...{
          //           months,
          //           days: days,
          //           defaultSelectedDays: defaultSelectedDays,
          //           onConfirm: async ({selectedDays}) => {
          //             if (!confirm('変更を反映しますか？')) return

          //             const res = await doTransaction({
          //               transactionQueryList: days.map(day => {
          //                 const isSelected = selectedDays.some(d => Days.validate.isSameDate(d, day))
          //                 const unique_userId_date = {
          //                   userId,
          //                   date: day,
          //                 }

          //                 return {
          //                   model: 'userWorkStatus',
          //                   method: 'upsert',
          //                   queryObject: {
          //                     where: {unique_userId_date},
          //                     ...createUpdate({...unique_userId_date, workStatus: isSelected ? '稼働' : null}),
          //                   },
          //                 }
          //               }),
          //             })
          //             toastByResult(res)
          //           },
          //         }}
          //       />
          //     </div>
          //   ),
          // },
        ],
      }}
    />
  )
  // return (
  //   <R_Stack className={` items-start gap-20 p-8`}>
  //     <div>
  //       <TextBlue className={` text-2xl font-bold `}>便基本設定</TextBlue>
  //       <MyForm {...props}></MyForm>
  //     </div>
  //     {!!props?.formData?.id && (
  //       <div>
  //         <TextBlue className={` text-2xl font-bold `}>稼働予定</TextBlue>
  //         <BulkCalendarSetter
  //           {...{
  //             months,
  //             days: days,
  //             defaultSelectedDays: defaultSelectedDays,
  //             onConfirm: async ({selectedDays}) => {
  //               if (!confirm('変更を反映しますか？')) return

  //               const res = await doTransaction({
  //                 transactionQueryList: days.map(day => {
  //                   const isSelected = selectedDays.some(d => Days.validate.isSameDate(d, day))

  //                   const unique_userId_date = {
  //                     userId,
  //                     date: day,
  //                   }

  //                   return {
  //                     model: 'userWorkStatus',
  //                     method: 'upsert',
  //                     queryObject: {
  //                       where: {unique_userId_date},
  //                       ...createUpdate({...unique_userId_date, workStatus: isSelected ? '稼働' : null}),
  //                     },
  //                   }
  //                 }),
  //               })
  //               toastByResult(res)
  //             },
  //           }}
  //         />
  //       </div>
  //     )}
  //   </R_Stack>
  // )
}
