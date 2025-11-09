'use client'
import React, {useEffect} from 'react'
import {C_Stack, FitMargin, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Card} from '@cm/shadcn/ui/card'
import {Button} from '@cm/components/styles/common-components/Button'

// カスタムフック
import {useEtcData} from './hooks/useEtcData'
import {useEtcGrouping} from './hooks/useEtcGrouping'
import {useEtcSelection} from './hooks/useEtcSelection'

// コンポーネント

import {EtcDataTable} from './components/EtcDataTable'
import {Days} from '@cm/class/Days/Days'
import {Fields} from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {isDev} from '@cm/lib/methods/common'
import {getVehicleForSelectConfig} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
import {EtcScheduleLinkModal} from './components/EtcScheduleLinkModal'
import {EtcImportForm} from '@app/(apps)/tbm/(pages)/etc/components/EtcImportForm'
import useModal from '@cm/components/utils/modal/useModal'

export default function EtcCsvImportPage() {
  const {firstDayOfMonth} = Days.month.getMonthDatum(new Date())

  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: new Fields([
      {
        id: `tbmVehicleId`,
        label: `車両`,
        form: {
          style: {width: 350},
          defaultValue: isDev ? 5 : null,
        },
        forSelect: {config: getVehicleForSelectConfig({})},
      },
      {
        id: `month`,
        label: `月`,
        form: {defaultValue: isDev ? '2025-08-01T00:00:00+09:00' : firstDayOfMonth, style: {width: 350}},
        type: `month`,
      },
      {
        id: `csvData`,
        label: `CSVデータ`,
        form: {
          defaultValue: '',
          style: {
            maxWidth: 175,
            maxHeight: 120,
            lineHeight: 1.2,
          },
        },
        type: 'textarea',
      },
    ]).transposeColumns(),
  })

  // フォームデータが変更されたときに呼び出される
  useEffect(() => {
    if (latestFormData?.tbmVehicleId && latestFormData?.month) {
      loadEtcRawData(latestFormData.tbmVehicleId, latestFormData.month)
    }
  }, [latestFormData?.tbmVehicleId, latestFormData?.month])

  // ETCデータ管理
  const {etcRawData, isLoading: dataLoading, importCsvData, loadEtcRawData} = useEtcData()

  // 行選択管理
  const {selectedRows, toggleRowSelection, selectedRecords, clearSelection} = useEtcSelection(etcRawData)

  // グループ化機能
  const {
    isLoading: groupingLoading,
    updateGrouping,
    ungroupRecords,
    getNextGroupIndex,
  } = useEtcGrouping(etcRawData, () => {
    // グループ化/解除後のコールバック
    if (latestFormData?.tbmVehicleId && latestFormData?.month) {
      loadEtcRawData(latestFormData.tbmVehicleId, latestFormData.month)
    }
    clearSelection()
  })

  // モーダル管理
  // const [modalData, setModalData] = useState<{etcMeisaiId: number; scheduleId: number | null} | null>(null)
  const EtcScheduleLinkModalReturn = useModal()

  const isLoading = dataLoading || groupingLoading

  // 紐付け処理
  const handleLinkSchedule = (etcMeisaiId: number, scheduleId: number | null, scheduleDate: Date) => {
    EtcScheduleLinkModalReturn.handleOpen({etcMeisaiId, scheduleId, scheduleDate})
  }

  return (
    <FitMargin className={`p-2`}>
      <C_Stack>
        <R_Stack className={` items-start`}>
          {/* インポートフォーム */}
          <Card>
            <EtcImportForm isLoading={isLoading} importCsvData={importCsvData} onFormChange={loadEtcRawData} />
          </Card>

          {/* データ表示エリア */}
          <Card>
            <h2 className="text-xl font-bold mb-2">②データ確認とグルーピング</h2>
            {etcRawData.length > 0 ? (
              <>
                <div className="mb-4">
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => updateGrouping(selectedRecords, getNextGroupIndex())}
                      disabled={isLoading || selectedRecords.length === 0}
                      className="mt-2"
                    >
                      選択したレコードをグループ化
                    </Button>

                    {selectedRecords.some(record => record.isGrouped) && (
                      <p className="text-red-500 text-sm">
                        ※既にグループ化されているレコードが含まれています。未グループのレコードのみ選択してください。
                      </p>
                    )}
                  </div>
                </div>
                <EtcDataTable
                  etcRawData={etcRawData}
                  selectedRows={selectedRows}
                  toggleRowSelection={toggleRowSelection}
                  ungroupRecords={ungroupRecords}
                  handleLinkSchedule={handleLinkSchedule}
                />
              </>
            ) : (
              <p>表示するデータがありません。車両と月を選択するか、CSVデータをインポートしてください。</p>
            )}
          </Card>
        </R_Stack>
      </C_Stack>

      {/* 運行データ紐付けモーダル */}
      <EtcScheduleLinkModalReturn.Modal>
        <EtcScheduleLinkModal
          etcMeisaiId={EtcScheduleLinkModalReturn?.open?.etcMeisaiId}
          scheduleId={EtcScheduleLinkModalReturn?.open?.scheduleId}
          scheduleDate={EtcScheduleLinkModalReturn?.open?.scheduleDate}
          onClose={() => EtcScheduleLinkModalReturn.handleClose()}
          onUpdate={() => {
            // データを再読み込み
            if (latestFormData?.tbmVehicleId && latestFormData?.month) {
              loadEtcRawData(latestFormData.tbmVehicleId, latestFormData.month)
            }
          }}
        />
      </EtcScheduleLinkModalReturn.Modal>
    </FitMargin>
  )
}
