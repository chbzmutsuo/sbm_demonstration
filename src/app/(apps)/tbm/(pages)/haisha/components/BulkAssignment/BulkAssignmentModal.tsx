'use client'
import React, {useState} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Fields} from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {getVehicleForSelectConfig} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'

import {BulkAssignmentModalProps} from '../../types/haisha-page-types'
import {MonthCalendarSelector} from './MonthCalendarSelector'
import {useBulkAssignment} from '../../hooks/useBulkAssignment'

export const BulkAssignmentModal: React.FC<BulkAssignmentModalProps> = ({tbmRouteGroup, tbmBase, month, onClose, onComplete}) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [refreshCounter, setRefreshCounter] = useState(0)

  // 一括割り当てフォーム
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: new Fields([
      {
        id: `userId`,
        label: `ドライバー`,
        form: {
          defaultValue: null,
          style: {width: '100%'},
        },
        forSelect: {
          config: {
            where: {tbmBaseId: tbmBase?.id},
          },
        },
      },
      {
        id: `tbmVehicleId`,
        label: `車両`,
        form: {
          defaultValue: null,
          style: {width: '100%'},
        },
        forSelect: {config: getVehicleForSelectConfig({})},
      },
      {
        id: 'selectedDates',
        label: '選択日',
        form: {
          hidden: true,
        },
      },
    ]).transposeColumns(),
  })

  // 一括割り当て処理
  const {isLoading, handleBulkAssign, deleteSchedule} = useBulkAssignment({
    tbmBaseId: tbmBase?.id || 0,
    tbmRouteGroupId: tbmRouteGroup.id,
    onComplete: () => {
      // 完了時にカレンダー表示を更新するためのカウンターをインクリメント
      setRefreshCounter(prev => prev + 1)
      // 親コンポーネントのコールバックも呼び出す
      if (onComplete) onComplete()
    },
  })

  // 日付選択処理
  const handleDateSelect = (dates: Date[]) => {
    setSelectedDates(dates)
  }

  // フォーム送信処理
  const handleSubmit = async () => {
    await handleBulkAssign({
      ...latestFormData,
      selectedDates,
    })
  }

  return (
    <div className={`p-4`}>
      <C_Stack className="gap-6">
        {/* カレンダー選択部分 */}
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="text-lg font-bold mb-4">①日付を選択</h3>
          <MonthCalendarSelector
            month={month}
            selectedDates={selectedDates}
            onDateSelect={handleDateSelect}
            tbmRouteGroup={tbmRouteGroup}
            onDeleteSchedule={deleteSchedule}
            refreshTrigger={refreshCounter}
          />
          <div className="mt-2 text-sm text-gray-500">{selectedDates.length}日選択中</div>
        </div>

        {/* ドライバー・車両選択部分 */}
        <div className="border rounded-md p-4">
          <h3 className="text-lg font-bold mb-4">②ドライバーと車両を選択</h3>
          <BasicForm latestFormData={latestFormData}>
            <div className="text-sm text-gray-500 mt-2">※ドライバーと車両は片方のみの設定も可能です</div>
          </BasicForm>
        </div>

        {/* ボタン部分 */}
        <R_Stack className="justify-end gap-4">
          <Button color="gray" onClick={onClose} disabled={isLoading}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || selectedDates.length === 0}>
            {isLoading ? '処理中...' : '一括割り当て実行'}
          </Button>
        </R_Stack>
      </C_Stack>
    </div>
  )
}
