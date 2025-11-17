import ReservationClient from '@app/(excluded)/sbm/(pages)/reservations/ReservationClient'
import {dateSwitcherTemplate} from '@cm/lib/methods/redirect-method'
import Redirector from '@cm/components/utils/Redirector'
import React from 'react'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'

export default async function Page(props) {
  const query = await props.searchParams

  // 「今日」や「今月」などの日付フィルタの初期条件がある場合、最初に該当のqueryがセットされるようリダイレクトする
  const {redirectPath, whereQuery} = await dateSwitcherTemplate({
    query,
    defaultWhere: {
      startDate: getMidnight(),
      endDate: getMidnight(),
    },
  })

  // ここでqueryを頼り委にサーバーアクションにてフィルタや検索も含めた処理を実行し、propsで流す

  if (redirectPath) return <Redirector {...{redirectPath}} />
  return <ReservationClient />
}
