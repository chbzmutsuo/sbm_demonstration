'use client'

import {useState, useEffect, useMemo} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {SlideBlock} from '@app/(apps)/edu/Colabo/(components)/SlideBlock'
import {Plus, Settings, Pencil} from 'lucide-react'
import type {SlideRow, SlideBlock as SlideBlockType} from '../../types/game-types'
import BlockEditPopover from './BlockEditPopover'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragCancelEvent,
} from '@dnd-kit/core'
import {arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy} from '@dnd-kit/sortable'
import {useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

interface EditableSlideRowProps {
  row: SlideRow
  rowIndex: number
  totalRows: number
  onUpdateRow: (rowId: string, updates: Partial<SlideRow>) => void
  onDeleteRow: (rowId: string) => void
  onAddRow: (afterRowId: string) => void
  onMoveBlock: (blockId: string, direction: 'up' | 'down' | 'left' | 'right') => void
  onUpdateBlock: (blockId: string, updates: Partial<SlideBlockType>) => void
  onDeleteBlock: (blockId: string) => void
  onAddBlock: (rowId: string, blockType: 'text' | 'image' | 'link') => void
  isEditing: boolean
  dragHandleProps?: any
}

function SortableBlockItem({
  block,
  blockIndex,
  totalBlocks,
  row,
  onMoveBlock,
  onUpdateBlock,
  onDeleteBlock,
  isEditing,
  onBlockEditingChange,
}: {
  block: SlideBlockType
  blockIndex: number
  totalBlocks: number
  row: SlideRow
  onMoveBlock: (blockId: string, direction: 'up' | 'down' | 'left' | 'right') => void
  onUpdateBlock: (blockId: string, updates: Partial<SlideBlockType>) => void
  onDeleteBlock: (blockId: string) => void
  isEditing: boolean
  onBlockEditingChange: (blockId: string, isEditing: boolean) => void
}) {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: block.id})

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleContentChange = (newContent: string) => {
    onUpdateBlock(block.id, {content: newContent})
  }

  const handleEditingChange = (isEditing: boolean) => {
    onBlockEditingChange(block.id, isEditing)
  }

  return (
    <div className="relative">
      {isEditing && (
        <div className="absolute -top-2 left-2 flex gap-1 z-5">
          {/* プロパティ編集ボタン（Popover） */}
          <R_Stack>
            <BlockEditPopover
              block={block}
              onSave={(blockId, updates) => {
                onUpdateBlock(blockId, updates)
              }}
              trigger={
                <button
                  onClick={e => e.stopPropagation()}
                  className="bg-blue-500 text-white rounded p-1 hover:bg-blue-600 text-xs"
                  title="スタイル編集"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              }
            />
            {/* 削除ボタン */}
            <button
              onClick={e => {
                e.stopPropagation()
                if (confirm('このブロックを削除しますか？')) {
                  onDeleteBlock(block.id)
                }
              }}
              className="bg-red-500 text-white rounded p-1 hover:bg-red-600 text-xs"
              title="削除"
            >
              ×
            </button>
          </R_Stack>
        </div>
      )}

      {/* ドラッグハンドル */}
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <SlideBlock
          block={block}
          isPreview={!isEditing}
          onContentChange={handleContentChange}
          onEditingChange={handleEditingChange}
        />
      </div>
    </div>
  )
}

export default function EditableSlideRow({
  row,
  rowIndex,
  totalRows,
  onUpdateRow,
  onDeleteRow,
  onAddRow,
  onMoveBlock,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  isEditing,
  dragHandleProps,
}: EditableSlideRowProps) {
  const [isColumnSettingOpen, setIsColumnSettingOpen] = useState(false)
  const [isBlockTypeMenuOpen, setIsBlockTypeMenuOpen] = useState(false)
  const [editingBlockIds, setEditingBlockIds] = useState<Set<string>>(new Set())

  const handleBlockEditingChange = (blockId: string, isEditing: boolean) => {
    setEditingBlockIds(prev => {
      const next = new Set(prev)
      if (isEditing) {
        next.add(blockId)
      } else {
        next.delete(blockId)
      }
      return next
    })
  }

  // 編集中のブロックがある場合はキーボード操作を無効化
  // useSensorsの配列サイズを一定に保つため、常に両方のセンサーを含める
  // 編集中の場合はcoordinateGetterを変更して実質的に無効化
  const coordinateGetter = useMemo(() => {
    if (editingBlockIds.size > 0) {
      // 編集中の場合は常にundefinedを返してキーボード操作を無効化
      return () => undefined
    }
    return sortableKeyboardCoordinates
  }, [editingBlockIds.size])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動したらドラッグ開始（クリックとの区別）
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    // 編集中のブロックがある場合はドラッグをキャンセル
    if (editingBlockIds.size > 0 && event.active.id) {
      // 編集中のブロックのIDをチェック
      const blockId = String(event.active.id)
      if (editingBlockIds.has(blockId)) {
        // 編集中のブロックのドラッグは無効化
        // 実際には、ここでキャンセルすることはできないため、
        // handleDragEndでチェックして無効化する
      }
    }
  }

  const handleDragCancel = (event: DragCancelEvent) => {
    // 必要に応じてキャンセル時の処理を追加
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event

    // 編集中のブロックがある場合はドラッグを無効化
    if (editingBlockIds.size > 0) {
      return
    }

    if (!over || active.id === over.id) return

    const oldIndex = row.blocks.findIndex(b => b.id === active.id)
    const newIndex = row.blocks.findIndex(b => b.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const newBlocks = arrayMove(row.blocks, oldIndex, newIndex)
      newBlocks.forEach((block, index) => {
        block.sortOrder = index
      })
      onUpdateRow(row.id, {blocks: newBlocks})
    }
  }

  const handleColumnChange = (newColumns: number) => {
    // 列数が減る場合、ブロックを再配置
    const currentBlocks = [...row.blocks]
    const newBlocks = currentBlocks.slice(0, newColumns * 10) // 最大10行分のブロックを保持

    onUpdateRow(row.id, {
      columns: newColumns,
      blocks: newBlocks,
    })
    setIsColumnSettingOpen(false)
  }

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // メニュー内のクリックは無視
      if (target.closest('[data-menu="column-setting"]') || target.closest('[data-menu="block-type"]')) {
        return
      }
      if (isColumnSettingOpen) {
        setIsColumnSettingOpen(false)
      }
      if (isBlockTypeMenuOpen) {
        setIsBlockTypeMenuOpen(false)
      }
    }
    if (isColumnSettingOpen || isBlockTypeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isColumnSettingOpen, isBlockTypeMenuOpen])

  return (
    <div className="border border-gray-200 rounded p-2" onClick={e => e.stopPropagation()}>
      {/* 行ヘッダー */}
      {isEditing && (
        <div className="flex items-center justify-between  mb-4">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-medium text-gray-700"
              {...(dragHandleProps || {})}
              style={{cursor: dragHandleProps ? 'grab' : 'default'}}
            >
              行 {rowIndex + 1}
            </span>
            {/* 列数設定 */}
            <div className="relative">
              <button
                onClick={e => {
                  e.stopPropagation()
                  setIsColumnSettingOpen(!isColumnSettingOpen)
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                data-menu="column-setting"
              >
                <Settings className="w-3 h-3" />
                <span className="text-[10px]">{row.columns}列</span>
              </button>
              {isColumnSettingOpen && (
                <div
                  className="absolute w-[300px] top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50"
                  data-menu="column-setting"
                >
                  <div className="p-2">
                    <div className="text-xs text-gray-600">列数を選択</div>
                    <div className="grid grid-cols-3 gap-1">
                      {[1, 2, 3, 4, 5, 6].map(cols => (
                        <button
                          key={cols}
                          onClick={e => {
                            e.stopPropagation()
                            handleColumnChange(cols)
                          }}
                          className={`px-2 py-1 text-xs rounded ${
                            row.columns === cols ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {cols}列
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                size="sm"
                onClick={e => {
                  e.stopPropagation()
                  setIsBlockTypeMenuOpen(!isBlockTypeMenuOpen)
                }}
                className="text-xs"
                data-menu="block-type"
              >
                <Plus className="w-3 h-3 inline mr-1" />
                ブロック追加
              </Button>
              {isBlockTypeMenuOpen && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[150px]"
                  data-menu="block-type"
                >
                  <div className="p-2">
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        onAddBlock(row.id, 'text')
                        setIsBlockTypeMenuOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                    >
                      📝 テキスト
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        onAddBlock(row.id, 'image')
                        setIsBlockTypeMenuOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                    >
                      🖼️ 画像
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        onAddBlock(row.id, 'link')
                        setIsBlockTypeMenuOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                    >
                      🔗 リンク
                    </button>
                  </div>
                </div>
              )}
            </div>
            {totalRows > 1 && (
              <Button
                size="sm"
                onClick={e => {
                  e.stopPropagation()
                  onDeleteRow(row.id)
                }}
                className="bg-red-600 hover:bg-red-700 text-xs"
              >
                行を削除
              </Button>
            )}
          </div>
        </div>
      )}

      {/* グリッドレイアウト */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={row.blocks.map(b => b.id)} strategy={rectSortingStrategy}>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${row.columns}, minmax(0, 1fr))`,
            }}
          >
            {row.blocks.map((block, blockIndex) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                blockIndex={blockIndex}
                totalBlocks={row.blocks.length}
                row={row}
                onMoveBlock={onMoveBlock}
                onUpdateBlock={onUpdateBlock}
                onDeleteBlock={onDeleteBlock}
                isEditing={isEditing}
                onBlockEditingChange={handleBlockEditingChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
