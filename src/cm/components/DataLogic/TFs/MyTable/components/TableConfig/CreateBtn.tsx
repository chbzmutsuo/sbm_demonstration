import {TableConfigPropsType} from '@cm/components/DataLogic/TFs/MyTable/components/TableConfig'
import React, {useCallback, useMemo} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'

// 型定義を追加
interface CreateBtnProps {
  TableConfigProps: TableConfigPropsType
}

// クリックハンドラーを分離
const createClickHandler = (myTable: any, setformData: (data: any) => void) => async () => {
  const allowNextProcess = myTable?.create?.onClick ? await myTable?.create?.onClick?.() : true

  if (allowNextProcess) {
    setformData({id: 0})
  }
}

const CreateBtn = React.memo<CreateBtnProps>(props => {
  const {setformData, myTable} = props.TableConfigProps

  // ✅ 非同期処理を含む関数なのでメモ化有効
  const handleClick = useCallback(createClickHandler(myTable, setformData), [myTable?.create?.onClick, setformData])

  // ✅ 条件分岐の判定をメモ化
  const hasCustomLabel = useMemo(() => !!myTable?.create?.label, [myTable?.create?.label])

  const shouldShowDefaultButton = useMemo(() => myTable?.['create'] !== false, [myTable?.['create']])

  // カスタムラベルがある場合
  if (hasCustomLabel) {
    return <div onClick={handleClick}>{myTable?.create?.label}</div>
  }

  // デフォルトボタン
  if (shouldShowDefaultButton) {
    return (
      <Button size="sm" type="button" onClick={handleClick}>
        新規
      </Button>
    )
  }

  return null
})

CreateBtn.displayName = 'CreateBtn'

export default CreateBtn
