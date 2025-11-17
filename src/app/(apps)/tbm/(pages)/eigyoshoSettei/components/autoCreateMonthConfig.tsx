import {Days} from '@cm/class/Days/Days'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {createUpdate} from '@cm/lib/methods/createUpdate'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {TbmMonthlyConfigForRouteGroup} from '@prisma/client'
import {toast} from 'react-toastify'
export const autoCreateMonthConfig = async ({
  toggleLoad,
  currentMonth,
  tbmBaseId,
}: {
  toggleLoad: any
  currentMonth: Date
  tbmBaseId: any
}) => {
  toggleLoad(async () => {
    const {lastDayOfMonth} = Days.month.getMonthDatum(currentMonth)
    const prevMonth = Days.month.subtract(currentMonth, 1)
    const {result: tbmRouteGroupList} = await doStandardPrisma(`tbmRouteGroup`, `findMany`, {
      where: {tbmBaseId},
      include: {
        TbmMonthlyConfigForRouteGroup: {
          where: {
            yearMonth: {lte: lastDayOfMonth},
          },
          take: 2,
          orderBy: {yearMonth: `desc`},
        },
      },
    })

    const targetRouteList: {
      routeId: number
      id: number
      currentMonthConfig: TbmMonthlyConfigForRouteGroup
      prevMonthConfig?: TbmMonthlyConfigForRouteGroup
    }[] = tbmRouteGroupList?.map(route => {
      const configHistory: TbmMonthlyConfigForRouteGroup[] = route.TbmMonthlyConfigForRouteGroup

      const currentMonthConfig = configHistory.find(config => {
        return Days.validate.isSameDate(config.yearMonth, currentMonth)
      })
      const prevMonthConfig = configHistory.find(config => {
        return Days.validate.isSameDate(config.yearMonth, prevMonth)
      })

      return {
        routeId: route.id,
        configHistory,
        currentMonthConfig,
        prevMonthConfig,
      }
    })

    const targetRouteListWithPreviousData = targetRouteList.filter(route => route.prevMonthConfig)

    const confirmMsg = [
      `📊 便総数: ${tbmRouteGroupList.length}件`,
      `📋 上記のうち、過去月の便設定が存在するデータ: ${targetRouteListWithPreviousData.length}件`,
      '',
      `🔄 ${targetRouteListWithPreviousData.length}件の便について、過去の月のデータを引き継ぎます。よろしいですか？`,
      ``,
      `📅 引き継ぎ元: ${prevMonth.getFullYear()}年${(prevMonth.getMonth() + 1).toString().padStart(2, '0')}月`,
      `📅 引き継ぎ先: ${currentMonth.getFullYear()}年${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}月`,
      ``,
      `⚠️ 現在の月の設定は上書きされますので、ご注意ください。`,
    ].join('\n')
    if (!confirm(confirmMsg)) return

    if (targetRouteListWithPreviousData.length === 0) {
      return alert('引き継げるデータがありません。')
    }

    const transactionQueryList: transactionQuery<any, any>[] = targetRouteListWithPreviousData?.map(route => {
      const previousMonthConfig = route.prevMonthConfig

      const payload = {
        where: {
          unique_yearMonth_tbmRouteGroupId: {
            yearMonth: currentMonth,
            tbmRouteGroupId: route.routeId,
          },
        },
        ...createUpdate({...previousMonthConfig, yearMonth: currentMonth, id: undefined}),
      }

      return {
        model: `tbmMonthlyConfigForRouteGroup`,
        method: `upsert`,
        queryObject: payload,
      }
    })

    if (transactionQueryList.length > 0) {
      await doTransaction({transactionQueryList})
      toast.success('引き継ぎが完了しました。')
    }
  })
}
