'use client'

import {MonthlyTbmDriveData} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import UnkomeisaiDetailModal from '@app/(apps)/tbm/(pages)/unkomeisai/[id]/UnkomeisaiDetailModal'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import {HREF} from '@cm/lib/methods/urls'

export default function UnkoMeisaiCC({monthlyTbmDriveList}: {monthlyTbmDriveList: MonthlyTbmDriveData[]}) {
  const {toastIfFailed, router, query} = useGlobal()

  const UnkoMeisaiModalReturn = useModal<{id: number}>()

  return (
    <>
      <UnkoMeisaiModalReturn.Modal>
        <UnkomeisaiDetailModal {...{id: UnkoMeisaiModalReturn.open?.id}} />
      </UnkoMeisaiModalReturn.Modal>
      <div className={` relative`}>
        {monthlyTbmDriveList.length === 0 && <PlaceHolder>表示するデータがありません</PlaceHolder>}
        {CsvTable({
          records: monthlyTbmDriveList.map((row, rowIdx) => {
            const {keyValue, schedule} = row

            const cols = Object.entries(keyValue).filter(([dataKey, item]) => !String(item.label).includes(`CD`))

            const routeGroupColIndex = cols.findIndex(([dataKey, item]) => String(item.label ?? '').includes(`便名`))

            const convertedCols: any[][] = [...cols]
            convertedCols[routeGroupColIndex] = [
              String(routeGroupColIndex),
              {
                label: `便名`,
                cellValue: schedule.TbmRouteGroup.name,
                onClick: () => {
                  const href = HREF(
                    `/tbm/eigyoshoSettei`,
                    {
                      search: `TBMROUTEGROUP[contains:name=${schedule.TbmRouteGroup.name}]`,
                    },
                    query
                  )
                  window.open(href, '_blank')
                },
                style: {minWidth: 160},
              },
            ]

            return {
              csvTableRow: [
                ...convertedCols.map((props: any, colIdx) => {
                  const [dataKey, item] = props

                  let value
                  if (item.type === `date`) {
                    value = formatDate(item.cellValue, 'short')
                  } else {
                    value = item.cellValue
                  }

                  const baseWidth = 80
                  const width = item?.style?.minWidth ?? baseWidth

                  const style = {
                    fontSize: 13,
                    color: typeof value === 'number' && value < 0 ? 'red' : undefined,
                    ...item.style,
                    minWidth: width,
                  }

                  return {
                    ...item,
                    label: <div className="text-xs">{item.label}</div>,
                    style,
                    cellValue: value,
                  }
                }),
              ],
            }
          }),
        }).WithWrapper({
          className: `w-[calc(95vw)] `,
        })}
      </div>
    </>
  )
}
