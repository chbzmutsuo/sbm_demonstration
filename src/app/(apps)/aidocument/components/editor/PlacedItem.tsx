'use client'

import {X, GripVertical} from 'lucide-react'
import {useDraggable} from '@dnd-kit/core'
import {PlacedItem as PlacedItemType} from '../../types'
import {cn} from '@cm/shadcn/lib/utils'
import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

interface PlacedItemProps {
  item: PlacedItemType
  index: number
  x: number
  y: number
  value?: string
  isSelected?: boolean
  onMove: (x: number, y: number) => void
  onRemove: () => void
  onSelect?: () => void
}

export default function PlacedItemComponent({
  item,
  index,
  x,
  y,
  value,
  isSelected = false,
  onMove,
  onRemove,
  onSelect,
}: PlacedItemProps) {
  // 一意のIDを生成（indexベースだが、アイテムの順序が変わらない限り問題ない）
  const itemId = `placed-item-${index}`

  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id: itemId,
    data: {item, index, initialX: x, initialY: y},
  })

  // フォントサイズ（ポイント単位、デフォルト: 10.5）
  const fontSize = item.fontSize || 10.5
  // ポイントからピクセルに変換（96dpi基準: 1ポイント = 1.333px）
  const fontSizePx = fontSize * 1.333

  // transformは相対的な移動量なので、left/topに加算する
  const style = {
    position: 'absolute' as const,
    left: transform ? `${x + transform.x}px` : `${x}px`,
    top: transform ? `${y + transform.y}px` : `${y}px`,
    zIndex: isDragging ? 1000 : isSelected ? 100 : 1,
  }
  let displayValue: string | number = String(value || `${item.componentId}には値がありません`)

  if (!isNaN(Number(displayValue))) {
    displayValue = Number(displayValue).toLocaleString()
  } else if (Days.validate.isDate(displayValue)) {
    displayValue = formatDate(displayValue)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        //
        'absolute hover:z-10 group ',
        isSelected && 'border-blue-600 border z-100',
        isDragging && 'opacity-50 z-20',
        value ? 'text-blue-500' : 'text-red-500 '
      )}
      onClick={e => {
        e.stopPropagation()
        onSelect?.()
      }}
    >
      {/* ドラッグハンドル（左上のみ） */}
      <div
        {...listeners}
        className="absolute -left-1 -top-1 w-4 h-4 bg-blue-500 rounded-sm cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-600 z-100"
        style={{touchAction: 'none'}}
        onClick={e => e.stopPropagation()}
      >
        <GripVertical className="w-3 h-3 text-white" />
      </div>

      <span className="bg-transparent bg-opacity-80 whitespace-nowrap block" style={{fontSize: `${fontSizePx}px`}}>
        {displayValue}
      </span>
      <button
        onClick={e => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-700 z-10"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}
