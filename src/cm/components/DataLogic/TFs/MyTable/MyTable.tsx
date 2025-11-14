'use client'
import React from 'react'
import {ClientPropsType2} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import {UseRecordsReturn} from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'

import {useMyTableLogic} from './hooks/useMyTableLogic'

import {MainTable} from './components/MainTable/MainTable'

// 型定義
export interface MyTableProps {
  ClientProps2: ClientPropsType2 & {
    UseRecordsReturn?: UseRecordsReturn
  }
}

const MyTable = React.memo<MyTableProps>(props => {
  // 🔧 ロジックを分離したカスタムフックを使用
  const useMyTableLogicReturn = useMyTableLogic(props)
  const {Components} = useMyTableLogicReturn

  const TABLE_CONTROL_POSITION = process.env.NEXT_PUBLIC_TABLE_CONTROL_POSITION || 'top'

  return (
    <div>
      <div>
        {TABLE_CONTROL_POSITION === 'top' && <Components.MyTableControlsCallback />}
        <MainTable {...props} />
        {TABLE_CONTROL_POSITION === 'bottom' && <Components.MyTableControlsCallback />}
      </div>
    </div>
  )
})

MyTable.displayName = 'MyTable'

export default MyTable
