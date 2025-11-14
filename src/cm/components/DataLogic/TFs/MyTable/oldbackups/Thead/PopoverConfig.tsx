import TableConfig from '@cm/components/DataLogic/TFs/MyTable/components/TableConfig'
import {IconBtn} from 'src/cm/components/styles/common-components/IconBtn'
import MyPopover from 'src/cm/components/utils/popover/MyPopover'
import {Settings} from 'lucide-react'
import React, {useMemo} from 'react'

// 型定義を追加
interface PopoverConfigProps {
  TableConfigProps: any
  ClientProps2: any
}

const PopoverConfig = React.memo<PopoverConfigProps>(({TableConfigProps, ClientProps2}) => {
  // ✅ JSX要素の作成なのでメモ化有効
  const buttonElement = useMemo(
    () => (
      <IconBtn className="mx-auto h-8 w-8 rounded-full">
        <Settings className="onHover text-center text-gray-500" />
      </IconBtn>
    ),
    []
  )

  // ✅ オブジェクト作成なのでメモ化有効
  const popoverProps = useMemo(
    () => ({
      mode: 'click' as const,
      offsets: {x: 5, y: 5},
      button: buttonElement,
    }),
    [buttonElement]
  )

  return (
    <MyPopover {...popoverProps}>
      <div className="rounded-lg bg-gray-200 p-4 shadow-md">
        <TableConfig TableConfigProps={TableConfigProps} ClientProps2={ClientProps2} />
      </div>
    </MyPopover>
  )
})

PopoverConfig.displayName = 'PopoverConfig'

export default PopoverConfig
