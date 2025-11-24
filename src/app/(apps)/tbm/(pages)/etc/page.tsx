'use client'
import React from 'react'
import { C_Stack, FitMargin, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Card } from '@cm/shadcn/ui/card'
import { Button } from '@cm/components/styles/common-components/Button'

// カスタムフック
import { useEtcData } from './hooks/useEtcData'
import { useEtcGrouping } from './hooks/useEtcGrouping'
import { useEtcSelection } from './hooks/useEtcSelection'

// コンポーネント

import { EtcDataTable } from './components/EtcDataTable'
import { Days } from '@cm/class/Days/Days'
import { Fields } from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import { getVehicleForSelectConfig } from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
import { EtcScheduleLinkModal } from './components/EtcScheduleLinkModal'
import { EtcImportForm } from '@app/(apps)/tbm/(pages)/etc/components/EtcImportForm'
import useModal from '@cm/components/utils/modal/useModal'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'


export default function EtcCsvImportPage() {


  const { query, addQuery } = useGlobal()
  const { firstDayOfMonth } = Days.month.getMonthDatum(new Date())
  const VehicleSelector = useBasicFormProps({
    columns: new Fields([
      {
        id: `tbmVehicleId`,
        label: `車両`,
        form: { style: { width: 350 }, defaultValue: query.tbmVehicleId ? parseInt(query.tbmVehicleId) : null, },
        forSelect: { config: getVehicleForSelectConfig({}) },
      },


    ]).transposeColumns(),

  })

  const MonthSelector = useBasicFormProps({
    columns: new Fields([
      {
        id: `month`,
        label: `月`,
        type: `month`,
        form: {
          defaultValue: query.month ? new Date(query.month) : firstDayOfMonth,
        },
      },
    ]).transposeColumns(),

  })


  const selectedTbmVehicleId = query.tbmVehicleId ? parseInt(query.tbmVehicleId) : 0

  const selectedMonth = query.month ? new Date(query.month) : firstDayOfMonth



  // ETCデータ管理
  const { etcRawData, isLoading: dataLoading, importCsvData, mutateEtcRawData, deleteMonthData
  } = useEtcData({
    selectedTbmVehicleId,
    selectedMonth,
  })




  // 行選択管理
  const { selectedRows, toggleRowSelection, selectedRecords, clearSelection } = useEtcSelection(etcRawData)

  // グループ化機能
  const {
    isLoading: groupingLoading,
    updateGrouping,
    ungroupRecords,
    getNextGroupIndex,
  } = useEtcGrouping(etcRawData, () => {
    // // グループ化/解除後のコールバック
    mutateEtcRawData()
    clearSelection()
  })

  // モーダル管理
  // const [modalData, setModalData] = useState<{etcMeisaiId: number; scheduleId: number | null} | null>(null)
  const EtcScheduleLinkModalReturn = useModal()

  const isLoading = dataLoading || groupingLoading

  // 紐付け処理
  const handleLinkSchedule = (etcMeisaiId: number, scheduleId: number | null, scheduleDate: Date) => {
    EtcScheduleLinkModalReturn.handleOpen({ etcMeisaiId, scheduleId, scheduleDate })
  }









  return (
    <FitMargin className={`p-2`}>



      <C_Stack>
        <Card >
          <div className={`w-fit mx-auto`}>
            <VehicleSelector.BasicForm
              onSubmit={(data) => {
                addQuery({
                  tbmVehicleId: data?.tbmVehicleId,
                  month: formatDate(data.month, 'YYYY-MM-DD'),
                })
              }}

              latestFormData={VehicleSelector.latestFormData} alignMode="row" >
              <Button>検索</Button>
            </VehicleSelector.BasicForm>
          </div>
        </Card>




        {query.tbmVehicleId ? <Card>

          <BasicTabs
            id="etc-import-tabs"
            TabComponentArray={[
              {
                label: "データインポート",
                component: <EtcImportForm {...{
                  isLoading,
                  importCsvData,
                  selectedTbmVehicleId,
                  selectedMonth,
                }} />
              },
              {
                label: "データ確認とグルーピング",
                component: <div>
                  <MonthSelector.BasicForm
                    latestFormData={MonthSelector.latestFormData}
                    alignMode="row"
                    onSubmit={(data) => {
                      addQuery({
                        month: formatDate(data.month, 'YYYY-MM-DD'),
                      })
                    }}
                  >
                    <Button>検索</Button>
                  </MonthSelector.BasicForm>

                  {etcRawData.length > 0 ? (
                    <>
                      <div className="mb-4">
                        <R_Stack className=" justify-between">
                          <Button
                            onClick={() => updateGrouping(selectedRecords, getNextGroupIndex())}
                            disabled={isLoading || selectedRecords.length === 0}
                            className="mt-2"
                          >
                            選択したレコードをグループ化
                          </Button>

                          <Button
                            onClick={() => deleteMonthData(selectedTbmVehicleId, selectedMonth)}
                            disabled={isLoading}
                            className="mt-2 bg-red-500 hover:bg-red-600"
                          >
                            選択中の月のデータを一括削除
                          </Button>
                        </R_Stack>
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
                    <p>表示するデータがありません。</p>
                  )}
                </div>
              }
            ]}
          />

        </Card> : <p>車両を選択してください。</p>}

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
            if (selectedTbmVehicleId && selectedMonth) {
              mutateEtcRawData()
            }
          }}
        />
      </EtcScheduleLinkModalReturn.Modal>
    </FitMargin>
  )
}
