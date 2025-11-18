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

export default function OdometerProgressTable({odometerInputs, tableClassName}) {
  const expandedClassName = cn(tableClassName, 'max-h-none')

  const renderTable = className => {
    return (
      <div className={className}>
        {odometerInputs.length > 0 ? (
          CsvTable({
            records: odometerInputs.map(input => ({
              className: input.hasError ? 'bg-red-500' : '',
              csvTableRow: [
                {
                  label: `日付`,
                  cellValue: formatDate(input.date),
                },
                {
                  label: `車番・車両名・ドライバー`,
                  cellValue: (
                    <div>
                      <R_Stack>{input.TbmVehicle?.vehicleNumber ?? '-'}</R_Stack>
                      {input.TbmVehicle?.name && <R_Stack>{input.TbmVehicle.name}</R_Stack>}
                      {input.User?.name && <R_Stack>{input.User.name}</R_Stack>}
                    </div>
                  ),
                },
                {
                  label: `開始`,
                  cellValue: NumHandler.WithUnit(input.odometerStart, 'km', 1),
                  style: {textAlign: 'right' as const},
                },
                {
                  label: `終了`,
                  cellValue: NumHandler.WithUnit(input.odometerEnd, 'km', 1),
                  style: {textAlign: 'right' as const},
                },
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
          <h3 className={`text-base font-semibold`}>オドメーター入力数: {odometerInputs.length}件</h3>
          <small>*開始、または終了の入力がない、または開始が終了より小さい場合、赤色で表示されます。</small>
        </div>
        <ShadModal
          Trigger={
            <IconBtn color="gray" className="!text-xs p-1 cursor-pointer">
              <ZoomInIcon />
            </IconBtn>
          }
          title="オドメーター入力履歴"
        >
          {renderTable(expandedClassName)}
        </ShadModal>
      </div>
      {renderTable(tableClassName)}
    </div>
  )
}
