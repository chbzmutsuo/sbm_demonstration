import React, { useMemo } from 'react'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { NumHandler } from '@cm/class/NumHandler'
import { cn } from '@cm/shadcn/lib/utils'
import { R_Stack } from '@cm/components/styles/common-components/common-components'

interface EtcDataTableProps {
  etcRawData: EtcRecord[]
  selectedRows: { [key: number]: boolean }
  toggleRowSelection: (id: number) => void
  ungroupRecords: (meisaiId: number) => Promise<void>
  handleLinkSchedule: (etcMeisaiId: number, scheduleId: number | null, scheduleDate: Date) => void
}

export const EtcDataTable: React.FC<EtcDataTableProps> = ({
  etcRawData,
  selectedRows,
  toggleRowSelection,
  ungroupRecords,
  handleLinkSchedule,
}) => {
  const tableData = useMemo(() => {
    if (etcRawData.length === 0) return []

    // グループ済みのレコードを取得
    const groupedRecords: { [key: number]: EtcRecord[] } = {}
    etcRawData.forEach(record => {
      if (record.isGrouped && record.tbmEtcMeisaiId) {
        if (!groupedRecords[record.tbmEtcMeisaiId]) {
          groupedRecords[record.tbmEtcMeisaiId] = []
        }
        groupedRecords[record.tbmEtcMeisaiId].push(record)
      }
    })

    // グループ化されたデータを表示
    const groupedRows: TableRecord[] = []
    Object.keys(groupedRecords).forEach((meisaiId, index) => {
      const records = groupedRecords[parseInt(meisaiId)]
      // 日付順にソート
      records.sort((a, b) => {
        const dateA = new Date(`${a.fromDate.toISOString().split('T')[0]} ${a.fromTime}`)
        const dateB = new Date(`${b.fromDate.toISOString().split('T')[0]} ${b.fromTime}`)
        return dateA.getTime() - dateB.getTime()
      })

      const firstRecord = records[0]
      const lastRecord = records[records.length - 1]

      // グループヘッダーを追加
      // TbmEtcMeisaiの情報を取得
      const tbmEtcMeisai = firstRecord.TbmEtcMeisai || {}

      groupedRows.push({
        isGroupHeader: true,
        meisaiId: parseInt(meisaiId),
        fromDate: firstRecord.fromDate,
        fromTime: firstRecord.fromTime,
        toDate: lastRecord.toDate,
        toTime: lastRecord.toTime,
        fromIc: firstRecord.fromIc,
        toIc: lastRecord.toIc,
        fee: firstRecord.fee,
        records,
        groupIndex: index, // グループインデックスを追加
        tbmDriveScheduleId: tbmEtcMeisai.tbmDriveScheduleId,
        TbmDriveSchedule: tbmEtcMeisai.TbmDriveSchedule,
      })

      // グループの内訳を追加（最初の1件はヘッダーなので含めない）
      records.forEach((record, recordIndex) => {
        if (recordIndex > 0) {
          // 最初の1件はヘッダーと同じなので表示しない
          const detailRecord = { ...record, isGroupDetail: true, groupIndex: index }
          groupedRows.push(detailRecord)
        }
      })
    })

    // 未グループのレコード
    const ungroupedRecords = etcRawData.filter(record => !record.isGrouped)

    // すべてのレコードを日付順にソート（グループ内訳はソートに含めない）
    const sortableRecords = [...groupedRows.filter(r => !('isGroupDetail' in r)), ...ungroupedRecords] as TableRecord[]
    sortableRecords.sort((a, b) => {
      const dateA = new Date(`${a.fromDate.toISOString().split('T')[0]} ${a.fromTime}`)
      const dateB = new Date(`${b.fromDate.toISOString().split('T')[0]} ${b.fromTime}`)
      return dateA.getTime() - dateB.getTime()
    })

    // ソート後のレコードを展開（グループヘッダーの後にグループ内訳を挿入）
    const allRecords: TableRecord[] = []
    sortableRecords.forEach(record => {
      allRecords.push(record)
      if ('isGroupHeader' in record && record.isGroupHeader) {
        // このグループヘッダーに対応するグループ内訳を追加
        const details = groupedRows.filter(r => 'isGroupDetail' in r && r.isGroupDetail && r.groupIndex === record.groupIndex)
        allRecords.push(...details)
      }
    })

    return allRecords
  }, [etcRawData])

  if (etcRawData.length === 0) return null

  const tableHeaders = [
    { label: '連番', isCheckbox: true },
    { label: 'グループ', isGroupHeader: true },
    { label: '利用年月日（自）' },
    { label: '時分（自）' },
    { label: '利用年月日（至）' },
    { label: '時分（至）' },
    { label: '利用IC（自）' },
    { label: '利用IC（至）' },
    { label: '通行料金' },
    { label: 'グループ料金' },
    { label: '紐付け運行' },
  ]

  return (
    <div>

      <div className="max-h-[500px] max-w-[1300px] overflow-auto">
        <table
          className={cn(
            //
            'min-w-full divide-y divide-gray-200',
            '[&_td]:p-2',
            '[&_td]:whitespace-nowrap'
          )}
        >
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {tableHeaders.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((record, i) => {
              if ('isGroupHeader' in record && record.isGroupHeader) {
                const groupHeader = record as GroupHeader

                const groupFee = groupHeader.records.reduce((acc, record) => acc + record.fee, 0)
                // グループヘッダー行
                const bgColor = Number(groupHeader.groupIndex) % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'
                return (
                  <tr key={`group-${groupHeader.meisaiId}`} className={bgColor}>
                    <td>{i + 1}</td>
                    <td>
                      <R_Stack className={` flex-nowrap gap-0.5`}>
                        <button
                          onClick={() => ungroupRecords(groupHeader.meisaiId)}
                          className="text-xs px-2 py-1 bg-red-200 border-red-400 border hover:bg-red-300 rounded"
                          title="グループ解除"
                        >
                          {groupHeader.groupIndex + 1}
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            handleLinkSchedule(groupHeader.meisaiId, groupHeader.tbmDriveScheduleId || 0, groupHeader.fromDate)
                          }}
                          className="text-xs px-2 py-1 bg-blue-100 border-blue-300 border hover:bg-blue-200 rounded ml-1"
                          title="運行データと紐付け"
                        >
                          {groupHeader.tbmDriveScheduleId ? '紐付け済' : '紐付け'}
                        </button>
                      </R_Stack>
                    </td>
                    <td>{formatDate(groupHeader.fromDate)}</td>
                    <td>{groupHeader.fromTime}</td>
                    <td>{formatDate(groupHeader.toDate)}</td>
                    <td>{groupHeader.toTime}</td>
                    <td>{groupHeader.fromIc}</td>
                    <td>{groupHeader.toIc}</td>
                    <td className="font-bold">¥{NumHandler.WithUnit(groupHeader.fee, '円')}</td>
                    <td className="font-bold">¥{NumHandler.WithUnit(groupFee, '円')}</td>
                    <td>
                      <R_Stack className="gap-2 items-center">
                        {groupHeader.tbmDriveScheduleId && groupHeader.TbmDriveSchedule ? (
                          <div className="text-xs">
                            <div className="bg-yellow-100 px-2 py-1 rounded mb-1">
                              {formatDate(groupHeader.TbmDriveSchedule.date)}{' '}
                              {groupHeader.TbmDriveSchedule.TbmRouteGroup?.name || ''}
                            </div>
                            <div className="text-gray-600">
                              担当: {groupHeader.TbmDriveSchedule.User?.name || '(ドライバー名なし)'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-red-500">未紐付け</span>
                        )}
                      </R_Stack>
                    </td>
                  </tr>
                )
              } else if ('isGroupDetail' in record && record.isGroupDetail) {
                // グループ内訳行
                const etcRecord = record as EtcRecord
                const bgColor = Number(etcRecord.groupIndex) % 2 === 0 ? 'bg-blue-50' : 'bg-green-50'
                return (
                  <tr key={`detail-${etcRecord.id}`} className={bgColor}>
                    <td>{i + 1}</td>
                    <td className="pl-4">└</td>
                    <td>{formatDate(etcRecord.fromDate)}</td>
                    <td>{etcRecord.fromTime}</td>
                    <td>{formatDate(etcRecord.toDate)}</td>
                    <td>{etcRecord.toTime}</td>
                    <td>{etcRecord.fromIc}</td>
                    <td>{etcRecord.toIc}</td>
                    <td>¥{NumHandler.WithUnit(etcRecord.fee, '円')}</td>
                    <td>-</td>
                    <td></td>
                  </tr>
                )
              } else {
                // 通常の行（未グループ）
                const etcRecord = record as EtcRecord
                const isSelected = !!selectedRows[etcRecord.id]

                return (
                  <tr
                    key={`record-${etcRecord.id}`}
                    className={isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}
                    onClick={() => toggleRowSelection(etcRecord.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{i + 1}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => {
                          // イベントの伝播を止めて、trのクリックイベントと重複しないようにする
                          // e.stopPropagation()
                          // toggleRowSelection(etcRecord.id)
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </td>
                    <td>{formatDate(etcRecord.fromDate)}</td>
                    <td>{etcRecord.fromTime}</td>
                    <td>{formatDate(etcRecord.toDate)}</td>
                    <td>{etcRecord.toTime}</td>
                    <td>{etcRecord.fromIc}</td>
                    <td>{etcRecord.toIc}</td>
                    <td>¥{NumHandler.WithUnit(etcRecord.fee, '円')}</td>
                    <td>-</td>
                    <td></td>
                  </tr>
                )
              }
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
