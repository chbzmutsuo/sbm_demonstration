'use client'

import {useState, useEffect, useCallback} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {Plus} from 'lucide-react'
import EditableSlideRow from './EditableSlideRow'
import {normalizeSlideContentData} from '../../lib/slide-migration'
import type {SlideRow, SlideBlock} from '../../types/game-types'
import {DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent} from '@dnd-kit/core'
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'

interface EditableNormalSlideProps {
  slide: any
  index: number
  onUpdateSlide: (slideId: number, updates: any) => void
  onSelect: () => void
}

function SortableRowItem({
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
}: {
  row: SlideRow
  rowIndex: number
  totalRows: number
  onUpdateRow: (rowId: string, updates: Partial<SlideRow>) => void
  onDeleteRow: (rowId: string) => void
  onAddRow: (afterRowId: string) => void
  onMoveBlock: (blockId: string, direction: 'up' | 'down' | 'left' | 'right') => void
  onUpdateBlock: (blockId: string, updates: Partial<SlideBlock>) => void
  onDeleteBlock: (blockId: string) => void
  onAddBlock: (rowId: string, blockType: 'text' | 'image' | 'link') => void
}) {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: row.id})

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <EditableSlideRow
        row={row}
        rowIndex={rowIndex}
        totalRows={totalRows}
        onUpdateRow={onUpdateRow}
        onDeleteRow={onDeleteRow}
        onAddRow={onAddRow}
        onMoveBlock={onMoveBlock}
        onUpdateBlock={onUpdateBlock}
        onDeleteBlock={onDeleteBlock}
        onAddBlock={onAddBlock}
        isEditing={true}
      />
    </div>
  )
}

export default function EditableNormalSlide({slide, index, onUpdateSlide, onSelect}: EditableNormalSlideProps) {
  // スライドコンテンツデータを正規化
  const normalizedContentData = normalizeSlideContentData(slide.contentData || {})
  const [rows, setRows] = useState<SlideRow[]>(normalizedContentData.rows || [])

  // スライドのcontentDataが変更されたらrowsを更新
  useEffect(() => {
    const normalized = normalizeSlideContentData(slide.contentData || {})
    setRows(normalized.rows || [])
  }, [slide.contentData])

  // スライドを更新する関数
  const updateSlideContent = useCallback(
    (newRows: SlideRow[]) => {
      setRows(newRows)
      onUpdateSlide(slide.id, {
        contentData: {
          ...slide.contentData,
          rows: newRows,
        },
      })
    },
    [slide.id, slide.contentData, onUpdateSlide]
  )

  // 行を更新
  const handleUpdateRow = useCallback(
    (rowId: string, updates: Partial<SlideRow>) => {
      const newRows = rows.map(row => (row.id === rowId ? {...row, ...updates} : row))
      updateSlideContent(newRows)
    },
    [rows, updateSlideContent]
  )

  // 行を削除
  const handleDeleteRow = useCallback(
    (rowId: string) => {
      if (rows.length <= 1) {
        alert('最低1行は必要です')
        return
      }
      const newRows = rows.filter(row => row.id !== rowId)
      updateSlideContent(newRows)
    },
    [rows, updateSlideContent]
  )

  // 行を追加
  const handleAddRow = useCallback(
    (afterRowId: string) => {
      const afterIndex = rows.findIndex(row => row.id === afterRowId)
      const newRow: SlideRow = {
        id: `row_${Date.now()}`,
        columns: 1,
        blocks: [],
      }
      const newRows = [...rows]
      newRows.splice(afterIndex + 1, 0, newRow)
      updateSlideContent(newRows)
    },
    [rows, updateSlideContent]
  )

  // ブロックを移動（行間移動を含む）
  const handleMoveBlock = useCallback(
    (blockId: string, direction: 'up' | 'down' | 'left' | 'right') => {
      // ブロックがどの行にあるか見つける
      let sourceRowIndex = -1
      let sourceBlockIndex = -1

      for (let i = 0; i < rows.length; i++) {
        const blockIndex = rows[i].blocks.findIndex(b => b.id === blockId)
        if (blockIndex !== -1) {
          sourceRowIndex = i
          sourceBlockIndex = blockIndex
          break
        }
      }

      if (sourceRowIndex === -1) return

      const newRows = [...rows]
      const sourceRow = {...newRows[sourceRowIndex]}
      const block = {...sourceRow.blocks[sourceBlockIndex]}

      if (direction === 'up') {
        // 上の行に移動
        if (sourceRowIndex > 0) {
          const targetRow = {...newRows[sourceRowIndex - 1]}
          sourceRow.blocks.splice(sourceBlockIndex, 1)
          targetRow.blocks.push(block)
          newRows[sourceRowIndex] = sourceRow
          newRows[sourceRowIndex - 1] = targetRow
        }
      } else if (direction === 'down') {
        // 下の行に移動
        if (sourceRowIndex < rows.length - 1) {
          const targetRow = {...newRows[sourceRowIndex + 1]}
          sourceRow.blocks.splice(sourceBlockIndex, 1)
          targetRow.blocks.push(block)
          newRows[sourceRowIndex] = sourceRow
          newRows[sourceRowIndex + 1] = targetRow
        }
      } else if (direction === 'left') {
        // 同じ行内で左に移動
        if (sourceBlockIndex > 0) {
          sourceRow.blocks = arrayMove(sourceRow.blocks, sourceBlockIndex, sourceBlockIndex - 1)
          newRows[sourceRowIndex] = sourceRow
        }
      } else if (direction === 'right') {
        // 同じ行内で右に移動
        if (sourceBlockIndex < sourceRow.blocks.length - 1) {
          sourceRow.blocks = arrayMove(sourceRow.blocks, sourceBlockIndex, sourceBlockIndex + 1)
          newRows[sourceRowIndex] = sourceRow
        }
      }

      // sortOrderを更新
      newRows.forEach(row => {
        row.blocks.forEach((block, index) => {
          block.sortOrder = index
        })
      })

      updateSlideContent(newRows)
    },
    [rows, updateSlideContent]
  )

  // ブロックを更新
  const handleUpdateBlock = useCallback(
    (blockId: string, updates: Partial<SlideBlock>) => {
      const newRows = rows.map(row => ({
        ...row,
        blocks: row.blocks.map(block => (block.id === blockId ? {...block, ...updates} : block)),
      }))
      updateSlideContent(newRows)
    },
    [rows, updateSlideContent]
  )

  // ブロックを削除
  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      const newRows = rows.map(row => ({
        ...row,
        blocks: row.blocks.filter(block => block.id !== blockId),
      }))
      updateSlideContent(newRows)
    },
    [rows, updateSlideContent]
  )

  // ブロックを追加
  const handleAddBlock = useCallback(
    (rowId: string, blockType: 'text' | 'image' | 'link') => {
      const newRows = rows.map(row => {
        if (row.id === rowId) {
          const newBlock: SlideBlock = {
            id: `block_${Date.now()}`,
            blockType,
            content: blockType === 'text' ? 'テキストを入力' : blockType === 'link' ? 'リンクテキスト' : '',
            sortOrder: row.blocks.length,
          }
          return {
            ...row,
            blocks: [...row.blocks, newBlock],
          }
        }
        return row
      })
      updateSlideContent(newRows)
    },
    [rows, updateSlideContent]
  )

  // 行の並び替え（ドラッグ&ドロップ）
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleRowDragEnd = (event: DragEndEvent) => {
    const {active, over} = event
    if (!over || active.id === over.id) return

    const oldIndex = rows.findIndex(row => row.id === active.id)
    const newIndex = rows.findIndex(row => row.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const newRows = arrayMove(rows, oldIndex, newIndex)
      updateSlideContent(newRows)
    }
  }

  return (
    <div className="bg-white border-2 border-blue-500 rounded-lg shadow-lg">
      {/* ヘッダー */}
      <div className="border-b border-gray-200 bg-blue-50 p-4 rounded-t-lg" onClick={onSelect}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">スライド #{index + 1} - ノーマル</h2>
            {slide.contentData?.title && <p className="text-sm text-gray-600 mt-1">{slide.contentData.title}</p>}
          </div>
        </div>
      </div>

      {/* スライド内容 */}
      <div className="p-8 min-h-[400px] bg-white aspect-video" onClick={e => e.stopPropagation()}>
        {rows.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleRowDragEnd}>
            <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {rows.map((row, rowIndex) => (
                  <SortableRowItem
                    key={row.id}
                    row={row}
                    rowIndex={rowIndex}
                    totalRows={rows.length}
                    onUpdateRow={handleUpdateRow}
                    onDeleteRow={handleDeleteRow}
                    onAddRow={handleAddRow}
                    onMoveBlock={handleMoveBlock}
                    onUpdateBlock={handleUpdateBlock}
                    onDeleteBlock={handleDeleteBlock}
                    onAddBlock={handleAddBlock}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <p>コンテンツがありません</p>
            <Button
              onClick={e => {
                e.stopPropagation()
                const newRow: SlideRow = {
                  id: `row_${Date.now()}`,
                  columns: 1,
                  blocks: [],
                }
                updateSlideContent([newRow])
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              最初の行を追加
            </Button>
          </div>
        )}

        {/* 行追加ボタン（行が存在する場合） */}
        {rows.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={e => {
                e.stopPropagation()
                const newRow: SlideRow = {
                  id: `row_${Date.now()}`,
                  columns: 1,
                  blocks: [],
                }
                updateSlideContent([...rows, newRow])
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              行を追加
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

