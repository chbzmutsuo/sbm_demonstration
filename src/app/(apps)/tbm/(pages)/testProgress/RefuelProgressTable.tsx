'use client'

import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import EmptyPlaceholder from '@cm/components/utils/loader/EmptyPlaceHolder'
import {NumHandler} from '@cm/class/NumHandler'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import {cn} from '@cm/shadcn/lib/utils'
import {ZoomInIcon} from 'lucide-react'

export default function RefuelProgressTable({refuelHistories, tableClassName}) {
  const expandedClassName = cn(tableClassName, 'max-h-none')

  const renderTable = className => {
    return (
      <div className={className}>
        {refuelHistories.length > 0 ? (
          CsvTable({
            records: refuelHistories.map(history => ({
              className: history.hasError ? 'bg-red-500' : '',
              csvTableRow: [
                {
                  label: `日付`,
                  cellValue: formatDate(history.date),
                },
                {
                  label: `車番・車両名・ドライバ`,
                  cellValue: (
                    <div>
                      <R_Stack>{history.TbmVehicle?.vehicleNumber ?? '-'}</R_Stack>
                      {history.TbmVehicle?.name && <R_Stack>{history.TbmVehicle.name}</R_Stack>}
                      {history.User?.name && <R_Stack>{history.User.name}</R_Stack>}
                    </div>
                  ),
                },
                {
                  label: `給油`,
                  cellValue: NumHandler.WithUnit(history.amount, 'L', 1),
                  style: {
                    width: 60,
                    textAlign: 'right' as const,
                  },
                },
                {
                  label: `オドメーター`,
                  cellValue: NumHandler.WithUnit(history.odometer, 'km', 1),
                  style: {
                    width: 60,
                    textAlign: 'right' as const,
                  },
                },
                // {
                //   label: `直前オドメーター`,
                //   cellValue: history.previousOdometer > 0 ? NumHandler.WithUnit(history.previousOdometer, 'km', 1) : '-',
                //   style: {textAlign: 'right' as const},
                // },
                // {
                //   label: ``,
                //   cellValue: history.hasError ? (
                //     <IconBtn color="red" className="!text-[10px] p-0 px-1">
                //       エラー
                //     </IconBtn>
                //   ) : (
                //     <IconBtn color="gray" className="!text-[10px] p-0 px-1">
                //       OK
                //     </IconBtn>
                //   ),
                // },
              ],
            })),
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
        <div>
          <h3 className={`text-base font-semibold`}>給油データ登録数: {refuelHistories.length}件</h3>
        </div>

        <ShadModal
          Trigger={
            <IconBtn color="gray" className="!text-xs p-1 cursor-pointer">
              <ZoomInIcon />
            </IconBtn>
          }
          title="給油データ入力履歴"
        >
          {renderTable(expandedClassName)}
        </ShadModal>
      </div>
      {renderTable(tableClassName)}
    </div>
  )
}
