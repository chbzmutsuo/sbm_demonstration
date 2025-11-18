'use client'

import React, {useRef} from 'react'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {C_Stack, R_Stack, FitMargin, Padding} from '@cm/components/styles/common-components/common-components'
import {Head1} from '@cm/components/styles/common-components/heading'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {Fields} from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {Button} from '@cm/components/styles/common-components/Button'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import {useReactToPrint} from 'react-to-print'

interface SimpleDriveHistoryCCProps {
  tbmBase: any
  driveHistory: any[]
  query: any
  whereQuery: any
}

export default function SimpleDriveHistoryCC({tbmBase, driveHistory, query, whereQuery}: SimpleDriveHistoryCCProps) {
  const useGlobalProps = useGlobal()
  const {addQuery} = useGlobalProps

  // フィルター用のフォーム
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: new Fields([
      {
        id: 'month',
        label: '月',
        type: 'month',
        form: {
          ...defaultRegister,
          defaultValue: query.month ? new Date(query.month) : new Date(),
        },
      },
      {
        id: 'driverId',
        label: 'ドライバ',
        forSelect: {
          optionsOrOptionFetcher:
            tbmBase?.User?.map(user => ({
              id: user.id,
              name: user.name,
            })) || [],
        },
        form: {
          // ...defaultRegister,
          defaultValue: query.driverId ? parseInt(query.driverId) : null,
        },
      },
    ]).transposeColumns(),
  })

  // 検索実行
  const handleSearch = () => {
    const {month, driverId} = latestFormData

    addQuery({
      month: formatDate(month, 'YYYY-MM-DD'),
      driverId,
    })
  }

  const selectedDriver = latestFormData.driverId ? tbmBase?.User?.find(user => user.id === latestFormData.driverId)?.name : null
  const selectedMonth = query.month

  const componentRef = useRef(null)
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    pageStyle: `
      @page {
        size: portrait;
        margin: 0;
      }
    `,
  })

  return (
    <Padding>
      <FitMargin>
        <C_Stack className="gap-6">
          <Head1>走行記録一覧</Head1>

          {/* フィルター */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <C_Stack className="gap-4">
              <BasicForm alignMode="row" latestFormData={latestFormData}>
                <Button onClick={handleSearch} size="sm">
                  検索
                </Button>
              </BasicForm>
            </C_Stack>
          </div>

          {/* データ表示エリア */}
          {selectedMonth && selectedDriver && (
            <>
              <div className="flex justify-end mb-4 max-w-fit">
                <Button onClick={handlePrint} size="sm">
                  PDF出力
                </Button>
              </div>
              <div ref={componentRef} className="print-target">
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <R_Stack className="gap-4">
                    <span>
                      対象月: <strong>{formatDate(selectedMonth, 'YYYY年MM月')}</strong>
                    </span>
                    <span>
                      ドライバ: <strong>{selectedDriver}</strong>
                    </span>
                    <span>
                      件数: <strong>{driveHistory.length}件</strong>
                    </span>
                  </R_Stack>
                </div>

                {driveHistory.length > 0 ? (
                  CsvTable({
                    records: driveHistory.map(data => {
                      const approved = data.approved
                      return {
                        csvTableRow: [
                          {label: '日付', cellValue: formatDate(data.date, 'YYYY/MM/DD(ddd)')},
                          {label: '担当ドライバ', cellValue: data.User?.name},
                          {label: '便名', cellValue: data.TbmRouteGroup?.name},
                          {label: '車両番号', cellValue: data.TbmVehicle?.vehicleNumber},
                          {
                            label: '承認',
                            cellValue: approved ? '承認' : '未承認',
                            style: {color: approved ? 'green' : 'red'},
                            thStyle: {color: ''},
                          },
                        ],
                      }
                    }),
                  }).WithWrapper({})
                ) : (
                  <div className="text-center py-8 text-gray-500">選択した条件に該当するデータがありません</div>
                )}
              </div>
            </>
          )}

          {(!selectedMonth || !query.driverId) && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg p-8">月とドライバを選択して検索してください</div>
          )}
        </C_Stack>
      </FitMargin>
    </Padding>
  )
}
