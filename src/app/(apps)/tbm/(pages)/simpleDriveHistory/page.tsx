import React from 'react'
import SimpleDriveHistoryCC from './SimpleDriveHistoryCC'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'
import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import Redirector from '@cm/components/utils/Redirector'
import {dateSwitcherTemplate} from '@cm/lib/methods/redirect-method'

export default async function SimpleDriveHistoryPage(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  const {tbmBaseId} = scopes.getTbmScopes()

  // デフォルトの月設定
  const {firstDayOfMonth} = Days.month.getMonthDatum(new Date())
  const {redirectPath, whereQuery} = await dateSwitcherTemplate({
    query,
    defaultWhere: {
      month: formatDate(firstDayOfMonth),
    },
  })

  if (redirectPath) return <Redirector {...{redirectPath}} />

  // TBMベース情報の取得
  const tbmBase = await prisma.tbmBase.findUnique({
    where: {id: tbmBaseId},
    include: {
      User: {
        orderBy: {name: 'asc'},
      },
    },
  })

  // 走行記録データの取得
  const driveHistory = await prisma.tbmDriveSchedule.findMany({
    where: {
      userId: query.driverId ? parseInt(query.driverId) : undefined,
      date: whereQuery,
      tbmBaseId: tbmBaseId,
      // approved: TbmReportCl.allowNonApprovedSchedule,
    },
    include: {
      TbmRouteGroup: true,
      TbmVehicle: true,
      User: true,
      TbmBase: true,
    },
    orderBy: [{date: 'asc'}, {createdAt: 'asc'}],
  })

  return (
    <div>
      <SimpleDriveHistoryCC tbmBase={tbmBase} driveHistory={driveHistory} query={query} whereQuery={whereQuery} />
    </div>
  )
}
