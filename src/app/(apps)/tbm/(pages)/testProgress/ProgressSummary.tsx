import {Card} from '@cm/shadcn/ui/card'
import LabelValue from '@cm/shadcn/ui/Organisms/LabelValue'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

export default function ProgressSummary({
  routeGroupTotals,
  refuelHistories,
  odometerInputs,
}: {
  routeGroupTotals: any
  refuelHistories: any[]
  odometerInputs: any[]
}) {
  const refuelErrorCount = refuelHistories.filter(h => h.hasError).length
  const odometerErrorCount = odometerInputs.filter(i => i.hasError).length

  const finishedRate = routeGroupTotals.count > 0 ? (routeGroupTotals.finishedCount / routeGroupTotals.count) * 100 : 0
  const confirmedRate =
    routeGroupTotals.finishedCount > 0 ? (routeGroupTotals.confirmedCount / routeGroupTotals.finishedCount) * 100 : 0
  const approvedRate =
    routeGroupTotals.confirmedCount > 0 ? (routeGroupTotals.approvedCount / routeGroupTotals.confirmedCount) * 100 : 0

  return (
    <Card className="mb-4 p-4">
      <h3 className="mb-3 text-base font-semibold">サマリー</h3>
      <R_Stack className="gap-4 flex-wrap">
        {/* 配車設定状況 */}
        <div className="min-w-[200px]">
          <h4 className="mb-2 text-sm font-medium text-gray-700">配車設定状況</h4>
          <R_Stack className="gap-2">
            <LabelValue label="設定数" value={routeGroupTotals.count} />
            <LabelValue
              label="運行完了数"
              value={
                <div>
                  {routeGroupTotals.finishedCount}
                  <span className="text-xs text-gray-500 ml-1">({finishedRate.toFixed(1)}%)</span>
                </div>
              }
            />
            <LabelValue
              label="締数"
              value={
                <div>
                  {routeGroupTotals.confirmedCount}
                  <span className="text-xs text-gray-500 ml-1">({confirmedRate.toFixed(1)}%)</span>
                </div>
              }
            />
            <LabelValue
              label="承認数"
              value={
                <div>
                  {routeGroupTotals.approvedCount}
                  <span className="text-xs text-gray-500 ml-1">({approvedRate.toFixed(1)}%)</span>
                </div>
              }
            />
          </R_Stack>
        </div>

        {/* 給油データ */}
        <div className="min-w-[200px]">
          <h4 className="mb-2 text-sm font-medium text-gray-700">給油データ</h4>
          <R_Stack className="gap-2">
            <LabelValue label="登録件数" value={refuelHistories.length} />
            <LabelValue
              label="エラー件数"
              value={<span className={refuelErrorCount > 0 ? 'text-red-600 font-bold' : ''}>{refuelErrorCount}</span>}
            />
          </R_Stack>
        </div>

        {/* オドメーター入力 */}
        <div className="min-w-[200px]">
          <h4 className="mb-2 text-sm font-medium text-gray-700">オドメーター入力</h4>
          <R_Stack className="gap-2">
            <LabelValue label="登録件数" value={odometerInputs.length} />
            <LabelValue
              label="エラー件数"
              value={<span className={odometerErrorCount > 0 ? 'text-red-600 font-bold' : ''}>{odometerErrorCount}</span>}
            />
          </R_Stack>
        </div>
      </R_Stack>
    </Card>
  )
}
