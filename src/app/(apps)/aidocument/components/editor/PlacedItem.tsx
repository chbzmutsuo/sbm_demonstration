'use client'

import {X, GripVertical} from 'lucide-react'
import {useDraggable} from '@dnd-kit/core'
import {PlacedItem as PlacedItemType} from '../../types'

interface PlacedItemProps {
  item: PlacedItemType
  index: number
  x: number
  y: number
  value?: string
  onMove: (x: number, y: number) => void
  onRemove: () => void
}

export default function PlacedItemComponent({item, index, x, y, value, onMove, onRemove}: PlacedItemProps) {
  // 一意のIDを生成（indexベースだが、アイテムの順序が変わらない限り問題ない）
  const itemId = `placed-item-${index}`

  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id: itemId,
    data: {item, index, initialX: x, initialY: y},
  })

  // transformは相対的な移動量なので、left/topに加算する
  const style = {
    position: 'absolute' as const,
    left: transform ? `${x + transform.x}px` : `${x}px`,
    top: transform ? `${y + transform.y}px` : `${y}px`,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`absolute p-0.5 border border-transparent hover:border-blue-500 hover:z-10 group ${
        isDragging ? 'opacity-50 z-20' : ''
      }`}
    >
      {/* ドラッグハンドル（左上のみ） */}
      <div
        {...listeners}
        className="absolute -left-1 -top-1 w-4 h-4 bg-blue-500 rounded-sm cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-600 z-10"
        style={{touchAction: 'none'}}
      >
        <GripVertical className="w-3 h-3 text-white" />
      </div>

      <span className="text-sm bg-white bg-opacity-80 px-1 py-0.5 whitespace-nowrap block">
        {value || item.value || item.componentId}
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
