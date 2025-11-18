'use client'

import {useState} from 'react'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import EmptyPlaceholder from '@cm/components/utils/loader/EmptyPlaceHolder'
import {NumHandler} from '@cm/class/NumHandler'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {cn} from '@cm/shadcn/lib/utils'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {ZoomInIcon} from 'lucide-react'

export default function HaishaProgressTable({routeGroupStats, routeGroupTotals, tableClassName}) {
  const [selectedStat, setSelectedStat] = useState(null as (typeof routeGroupStats)[0] | null)
  const expandedClassName = cn(tableClassName, 'max-h-none')

  const renderTable = className => {
    return (
      <div className={className}>
        {routeGroupStats.length > 0 ? (
          CsvTable({
            records: [
              ...routeGroupStats
                .sort((a, b) => {
                  // 運行数が大きい順に並び替え
                  return b.finishedCount - a.finishedCount
                  // a.routeGroup.code.localeCompare(b.routeGroup.code)
                })
                .map(stat => {
                  // 各セルの背景色を決定（優先順位順）
                  let countBgColor = '#ffffff'
                  let finishedBgColor = '#ffffff'
                  let confirmedBgColor = '#ffffff'
                  let approvedBgColor = '#ffffff'

                  if (stat.count === 0) {
                    // 配車設定がない場合、設定数セルをグレー
                    countBgColor = '#9ca3af'
                  } else if (stat.finishedCount === 0) {
                    // 運行なしの場合、運行完了数セルを赤
                    finishedBgColor = '#ef4444'
                    // 運行入力ができていないものは分母に入れないため、締数・承認数の色付けはしない
                  } else if (stat.confirmedCount === 0) {
                    // 締忘れの場合、締数セルをオレンジ（運行完了数 > 0 の場合のみ）
                    confirmedBgColor = '#fb923c'
                  } else if (stat.approvedCount === 0) {
                    // 承認忘れの場合、承認数セルを黄色（締数 > 0 の場合のみ）
                    approvedBgColor = '#eab308'
                  }

                  return {
                    style: {cursor: 'pointer'},
                    className: 'hover:bg-gray-100 transition-colors',
                    csvTableRow: [
                      {
                        label: `便`,
                        cellValue: (
                          <div>
                            {stat.routeGroup.code && <R_Stack>{stat.routeGroup.code}</R_Stack>}
                            <R_Stack>{stat.routeGroup.name}</R_Stack>
                            {stat.routeGroup.routeName && <R_Stack>{stat.routeGroup.routeName}</R_Stack>}
                          </div>
                        ),
                      },
                      {
                        label: `設定数`,
                        cellValue: stat.count,
                        style: {textAlign: 'right' as const, backgroundColor: countBgColor},
                      },
                      {
                        label: `運行数`,
                        cellValue: (
                          <div>
                            <R_Stack>{stat.finishedCount}</R_Stack>
                          </div>
                        ),
                        style: {textAlign: 'right' as const, backgroundColor: finishedBgColor},
                      },
                      {
                        label: `締数`,
                        cellValue: (
                          <div>
                            <R_Stack>{stat.confirmedCount}</R_Stack>
                          </div>
                        ),
                        style: {textAlign: 'right' as const, backgroundColor: confirmedBgColor},
                      },
                      {
                        label: `承認数`,
                        cellValue: (
                          <div>
                            <R_Stack>{stat.approvedCount}</R_Stack>
                          </div>
                        ),
                        style: {textAlign: 'right' as const, backgroundColor: approvedBgColor},
                      },
                      {
                        label: `運賃単価`,
                        cellValue: NumHandler.WithUnit(stat.driverFee, '円', 0),
                        style: {textAlign: 'right' as const},
                      },
                      {
                        label: `付帯単価`,
                        cellValue: NumHandler.WithUnit(stat.futaiFee, '円', 0),
                        style: {textAlign: 'right' as const},
                      },
                      {
                        label: `明細`,
                        cellValue: <ZoomInIcon className="cursor-pointer h-4 w-4 text-center mx-auto" />,
                        onClick: () => setSelectedStat(stat),
                      },
                    ].map(item => ({
                      ...item,
                      thStyle: {
                        backgroundColor: '',
                        color: '',
                      },
                    })),
                  }
                }),
            ],
          }).WithWrapper({className: className})
        ) : (
          <EmptyPlaceholder>データがありません</EmptyPlaceholder>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-base font-semibold`}>配車設定状況（便別）</h3>
        <ShadModal
          Trigger={
            <IconBtn color="gray" className="!text-xs p-1">
              拡大
            </IconBtn>
          }
          title="配車設定状況（便別）"
        >
          {renderTable(expandedClassName)}
        </ShadModal>
      </div>
      <div className={`mb-2 text-xs text-gray-600`}>
        <R_Stack className="gap-2 flex-wrap">
          <span>
            <span className="inline-block w-4 h-4 bg-red-500 mr-1"></span>運行なし
          </span>
          <span>
            <span className="inline-block w-4 h-4 bg-orange-500 mr-1"></span>締忘れ
          </span>
          <span>
            <span className="inline-block w-4 h-4 bg-yellow-500 mr-1"></span>承認忘
          </span>
        </R_Stack>
      </div>
      {renderTable(tableClassName)}

      {/* 明細モーダル */}
      {selectedStat && (
        <ShadModal
          open={!!selectedStat}
          onOpenChange={open => {
            if (!open) setSelectedStat(null)
          }}
          title={`${selectedStat.routeGroup.name} - 明細`}
        >
          <div className="max-h-[70vh] overflow-auto">
            {CsvTable({
              records: [
                {
                  csvTableRow: [
                    {label: '日付', cellValue: '日付'},
                    {label: '運行完了', cellValue: '運行完了'},
                    {label: '締め', cellValue: '締め'},
                    {label: '承認', cellValue: '承認'},
                  ],
                },
                ...selectedStat.details.map(detail => ({
                  csvTableRow: [
                    {
                      label: '日付',
                      cellValue: formatDate(detail.date),
                    },
                    {
                      label: '運行完了',
                      cellValue: detail.finished ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-red-600">✗</span>
                      ),
                      style: {textAlign: 'center' as const},
                    },
                    {
                      label: '締め',
                      cellValue: detail.confirmed ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-orange-600">✗</span>
                      ),
                      style: {textAlign: 'center' as const},
                    },
                    {
                      label: '承認',
                      cellValue: detail.approved ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-yellow-600">✗</span>
                      ),
                      style: {textAlign: 'center' as const},
                    },
                  ],
                })),
              ],
            }).WithWrapper({className: 'w-full'})}
          </div>
        </ShadModal>
      )}
    </div>
  )
}
