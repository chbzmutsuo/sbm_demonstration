import {fetchTestProgressData} from '@app/(apps)/tbm/(server-actions)/fetchTestProgressData'
import {C_Stack, FitMargin, R_Stack} from '@cm/components/styles/common-components/common-components'
import prisma from 'src/lib/prisma'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import {dateSwitcherTemplate} from '@cm/lib/methods/redirect-method'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {Card} from '@cm/shadcn/ui/card'

import {initServerComopnent} from 'src/non-common/serverSideFunction'
import HaishaProgressTable from './HaishaProgressTable'
import RefuelProgressTable from './RefuelProgressTable'
import OdometerProgressTable from '@app/(apps)/tbm/(pages)/testProgress/OdometerProgressTable'
import ProgressSummary from './ProgressSummary'
import {cn} from '@cm/shadcn/lib/utils'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'

export default async function Page(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  const {redirectPath, whereQuery} = await dateSwitcherTemplate({query})
  if (redirectPath) return <Redirector {...{redirectPath}} />

  const yearMonth = whereQuery.gte ?? getMidnight()

  // すべての営業所を取得
  const allTbmBases = await prisma.tbmBase.findMany({
    orderBy: {code: 'asc'},
    where: {name: {not: 'テスト営業所'}},
  })

  // 各営業所ごとにテスト進捗データを取得
  const testProgressDataByBase = await Promise.all(
    allTbmBases.map(async tbmBase => {
      const progressData = await fetchTestProgressData({tbmBaseId: tbmBase.id, whereQuery})
      return {
        tbmBase,
        ...progressData,
      }
    })
  )

  const tableClassName = cn(
    //
    ' [&_th]:!text-[11px]',
    ' [&_td]:!text-[11px]',
    ' [&_td]:!p-0',
    ' [&_td]:!px-0.5 ',
    ' [&_th]:!p-0',
    ' [&_th]:!px-0.5 ',
    ' !w-[500px] ',
    ' max-h-[400px] ',
    ' min-h-[400px]'
  )

  return (
    <FitMargin className={`p-4 `}>
      <C_Stack>
        <div>
          <NewDateSwitcher {...{monthOnly: true}} />
          <div className="mb-2 text-xs text-gray-600">
            <ul className="list-disc pl-4">
              <li>
                <b>配車設定状況：</b>配車設定、運行入力・締め（ドライバ）、承認（管理者）の進捗
              </li>
              <li>
                <b>給油履歴：</b>ドライバ記録の給油量・オドメーター
              </li>
              <li>
                <b>オドメータ履歴：</b>開始・終了時の入力記録
              </li>
            </ul>
          </div>
        </div>

        <AutoGridContainer className={`border p-2 w-full items-start  overflow-x-auto max-w-[95vw] mx-auto  h-[85vh] divide-x-2`}>
          {testProgressDataByBase.map(({tbmBase, routeGroupStats, routeGroupTotals, refuelHistories, odometerInputs}) => (
            <div key={tbmBase.id} className={`  px-4`}>
              <h2 className={`mb-4 text-lg font-bold bg-primary-main text-white text-center `}>{tbmBase.name}</h2>
              {tbmBase.code && <p className={`mb-4 text-sm text-gray-500`}>コード: {tbmBase.code}</p>}

              <ProgressSummary
                {...{
                  routeGroupTotals,
                  refuelHistories,
                  odometerInputs,
                }}
              />

              <R_Stack className={`w-full items-start gap-6`}>
                {/* 配車設定状況 */}
                <Card>
                  <HaishaProgressTable
                    {...{
                      routeGroupStats,
                      routeGroupTotals,
                      tableClassName,
                    }}
                  />
                </Card>

                {/* 給油データ登録数とその明細 */}
                <Card>
                  <RefuelProgressTable {...{refuelHistories, tableClassName}} />
                </Card>

                {/* オドメーター入力数とその明細 */}
                <Card>
                  <OdometerProgressTable {...{odometerInputs, tableClassName}} />
                </Card>
              </R_Stack>
            </div>
          ))}
        </AutoGridContainer>
      </C_Stack>
    </FitMargin>
  )
}
