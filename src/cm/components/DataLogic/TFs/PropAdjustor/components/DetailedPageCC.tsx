'use client'

import {cl} from 'src/cm/lib/methods/common'
import {useEffect, useState, useMemo} from 'react'
import MyForm from 'src/cm/components/DataLogic/TFs/MyForm/MyForm'
import {ClientPropsType2} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

// 型定義を追加
interface DetailedPageCCProps {
  modelData: any
  ClientProps2: ClientPropsType2
}

const DetailedPageCC = ({modelData, ClientProps2}: DetailedPageCCProps) => {
  const {myForm, EditForm, dataModelName} = ClientProps2
  // 早期リターン
  if (!modelData) return <div>このページは存在しません</div>

  const [formData, setformData] = useState(modelData)

  useEffect(() => {
    if (modelData) setformData(modelData)
  }, [modelData])

  // ✅ オブジェクト作成なのでメモ化有効
  const enhancedClientProps2 = useMemo(
    () => ({
      ...ClientProps2,
      formData: modelData,
      setformData: setformData,
    }),
    [ClientProps2, modelData, setformData]
  )

  const formId = `${dataModelName}-formMemo-${EditForm ? 'Custom' : 'Normal'}`

  return (
    <div className={cl('mx-auto w-fit p-1.5')}>
      {/* //paperはつけない */}
      <div className="p-0.5" id={formId}>
        <EditForm {...enhancedClientProps2} /> : <MyForm {...enhancedClientProps2} />
      </div>
    </div>
  )
}

DetailedPageCC.displayName = 'DetailedPageCC'

export default DetailedPageCC
