'use server'

import { MEIAI_SUM_ORIGIN } from '@app/(apps)/tbm/(lib)/calculation'
import { fetchUnkoMeisaiData, tbmTableKeyValue } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { unkoMeisaiKey } from '@app/(apps)/tbm/(class)/TbmReportCl/cols/createUnkoMeisaiRow'
import { TbmRouteGroup } from '@prisma/client'
import prisma from 'src/lib/prisma'

export type UnkoKaisuRecord = {
 routeGroup: TbmRouteGroup
 userCounts: Map<number, number> // userId -> count
 totalCount: number
 tollFee: number
 freightRevenue: number
 futaiFee: number
 tollFeeExclTax: number
 tollFeeInclTax: number
 tollFeeDifference: number
 keyValue: {
  CD: tbmTableKeyValue
  routeName: tbmTableKeyValue
  [userId: string]: tbmTableKeyValue // 動的なユーザー列
  total: tbmTableKeyValue
  tollFee: tbmTableKeyValue
  freightRevenue: tbmTableKeyValue
  futaiFee: tbmTableKeyValue
  tollFeeExclTax: tbmTableKeyValue
  tollFeeInclTax: tbmTableKeyValue
  tollFeeDifference: tbmTableKeyValue
 }
}

export const fetchUnkoKaisuData = async ({ whereQuery, tbmBaseId }) => {
 const { monthlyTbmDriveList } = await fetchUnkoMeisaiData({
  whereQuery,
  tbmBaseId,
  userId: undefined,
 })

 // 営業所の全ユーザーを社員コード順に取得
 const userList = await prisma.user.findMany({
  where: { tbmBaseId },
  orderBy: { code: 'asc' },
 })

 // 便名ごとにグループ化
 const routeGroupMap = new Map<number, typeof monthlyTbmDriveList>()

 monthlyTbmDriveList.forEach(row => {
  const { schedule } = row
  const routeGroupId = schedule.TbmRouteGroup?.id

  if (routeGroupId) {
   if (!routeGroupMap.has(routeGroupId)) {
    routeGroupMap.set(routeGroupId, [])
   }
   routeGroupMap.get(routeGroupId)!.push(row)
  }
 })

 // 便名別に集計
 const UnkoKaisuRecords: UnkoKaisuRecord[] = Array.from(routeGroupMap.entries()).map(([routeGroupId, schedules]) => {
  const routeGroup = schedules[0]?.schedule.TbmRouteGroup ?? null

  // 各ドライバーの運行回数を集計
  const userCounts = new Map<number, number>()
  schedules.forEach(row => {
   const userId = row.schedule.User?.id
   if (userId) {
    userCounts.set(userId, (userCounts.get(userId) ?? 0) + 1)
   }
  })

  const MEIAI_SUM = (dataKey: unkoMeisaiKey) => MEIAI_SUM_ORIGIN(schedules, dataKey)

  const postalFee = MEIAI_SUM(`L_postalFee`)
  const generalFee = MEIAI_SUM(`N_generalFee`)
  const tollFee = postalFee + generalFee
  const freightRevenue = MEIAI_SUM(`Q_driverFee`)
  const futaiFee = MEIAI_SUM(`Q_futaiFee`)

  // 税抜・税込の計算（消費税率10%と仮定）
  const taxRate = 0.1
  const tollFeeExclTax = Math.round(tollFee / (1 + taxRate))
  const tollFeeInclTax = tollFee
  const tollFeeDifference = tollFeeInclTax - tollFeeExclTax

  const totalCount = schedules.length

  const width40 = 40
  const widthBase = 120
  const widthRouteName = 200

  // 動的なキー値オブジェクトを作成
  const keyValue: UnkoKaisuRecord['keyValue'] = {
   CD: {
    label: 'コード',
    cellValue: 0, // 後でインデックスを設定
    style: { minWidth: width40 },
   },
   routeName: {
    label: '路線名',
    cellValue: routeGroup.routeName,
    style: { minWidth: widthRouteName },
   },
   name: {
    label: '便名',
    cellValue: routeGroup.name,
    style: { minWidth: widthRouteName },
   },
   total: {
    label: '合計',
    cellValue: `${totalCount}回`,
    style: { minWidth: widthBase },
   },
   tollFee: {
    label: '通行料',
    cellValue: tollFee,
    style: { minWidth: widthBase },
   },
   freightRevenue: {
    label: '運賃',
    cellValue: freightRevenue,
    style: { minWidth: widthBase },
   },
   futaiFee: {
    label: '付帯料金',
    cellValue: futaiFee,
    style: { minWidth: widthBase },
   },
   tollFeeExclTax: {
    label: '通行料(税抜)',
    cellValue: tollFeeExclTax,
    style: { minWidth: widthBase },
   },
   tollFeeInclTax: {
    label: '通行料(税込)',
    cellValue: tollFeeInclTax,
    style: { minWidth: widthBase },
   },
   tollFeeDifference: {
    label: '通行料差額',
    cellValue: tollFeeDifference,
    style: { minWidth: widthBase },
   },
  }

  // 各ユーザーの列を追加
  userList.forEach(user => {
   const count = userCounts.get(user.id) ?? 0
   keyValue[`user_${user.id}`] = {
    label: user.name ?? '',
    cellValue: count,
    style: { minWidth: width40 },
   }
  })

  return {
   routeGroup,
   userCounts,
   totalCount,
   tollFee,
   freightRevenue,
   futaiFee,
   tollFeeExclTax,
   tollFeeInclTax,
   tollFeeDifference,
   keyValue,
  }
 })

 // 便名でソート
 UnkoKaisuRecords.sort((a, b) => {
  const nameA = a.routeGroup.name ?? ''
  const nameB = b.routeGroup.name ?? ''
  return nameA.localeCompare(nameB, 'ja')
 })

 // コードにインデックスを設定
 UnkoKaisuRecords.forEach((record, index) => {
  record.keyValue.CD.cellValue = index + 1
 })

 return {
  UnkoKaisuRecords,
  userList,
 }
}

