'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@cm/components/styles/common-components/Button'
import { Plus, Eye, Edit } from 'lucide-react'
import EditableSlideRow from './EditableSlideRow'
import { SlideBlock } from '@app/(apps)/edu/Colabo/(components)/SlideBlock'
import { normalizeSlideContentData } from '../../lib/slide-migration'
import type { SlideRow, SlideBlock as SlideBlockType } from '../../types/game-types'
import { arrayMove } from '@dnd-kit/sortable'

interface EditableNormalSlideProps {
  slide: any
  index: number
  onUpdateSlide: (slideId: number, updates: any) => void
  onSelect: () => void
}

function RowItem({
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
  isPreviewMode,
  lastMovedBlockId,
}: {
  row: SlideRow
  rowIndex: number
  totalRows: number
  onUpdateRow: (rowId: string, updates: Partial<SlideRow>) => void
  onDeleteRow: (rowId: string) => void
  onAddRow: (afterRowId: string) => void
  onMoveBlock: (blockId: string, direction: 'up' | 'down' | 'left' | 'right' | 'up-merge' | 'up-new' | 'down-merge' | 'down-new') => void
  onUpdateBlock: (blockId: string, updates: Partial<SlideBlockType>) => void
  onDeleteBlock: (blockId: string) => void
  onAddBlock: (rowId: string, blockType: 'text' | 'image' | 'link') => void
  isPreviewMode: boolean
  lastMovedBlockId?: string | null
}) {
  // プレビューモード時は編集UIを非表示にして、SlidePreviewCardと同じ表示にする
  if (isPreviewMode) {
    return (
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${row.columns || 1}, minmax(0, 1fr))`,
        }}
      >
        {row.blocks?.map((block: any, blockIndex: number) => (
          <SlideBlock key={block.id || blockIndex} block={block} isPreview={true} />
        ))}
      </div>
    )
  }

  // 編集モード時
  return (
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
      lastMovedBlockId={lastMovedBlockId}
    />
  )
}

export default function EditableNormalSlide({ slide, index, onUpdateSlide, onSelect }: EditableNormalSlideProps) {
  // スライドコンテンツデータを正規化
  const normalizedContentData = normalizeSlideContentData(slide.contentData || {})
  const [rows, setRows] = useState<SlideRow[]>(normalizedContentData.rows || [])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [lastMovedBlockId, setLastMovedBlockId] = useState<string | null>(null)

  // 自分が更新したかどうかを追跡するref
  const isInternalUpdateRef = useRef(false)

  // スライドのcontentDataが変更されたらrowsを更新（外部からの変更のみ）
  useEffect(() => {
    // 自分が更新した場合はスキップ
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false
      return
    }

    const normalized = normalizeSlideContentData(slide.contentData || {})
    const newRows = normalized.rows || []
    setRows(newRows)
  }, [slide.contentData])

  // スライドを更新する関数
  const updateSlideContent = useCallback(
    (newRows: SlideRow[]) => {
      // データ整合性チェック
      const validatedRows = newRows.map(row => ({
        ...row,
        columns: Math.max(1, row.columns || 1), // 最低1列は確保
        blocks: row.blocks.map((block, index) => ({
          ...block,
          sortOrder: index, // sortOrderを正規化
        })),
      }))

      // 自分が更新することをマーク
      isInternalUpdateRef.current = true
      setRows(validatedRows)
      onUpdateSlide(slide.id, {
        contentData: {
          ...slide.contentData,
          rows: validatedRows,
        },
      })
    },
    [slide.id, slide.contentData, onUpdateSlide]
  )

  // 行を更新
  const handleUpdateRow = useCallback(
    (rowId: string, updates: Partial<SlideRow>) => {
      const newRows = rows.map(row => (row.id === rowId ? { ...row, ...updates } : row))
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
      const initialBlock: SlideBlockType = {
        id: `block_${Date.now()}`,
        blockType: 'text',
        content: 'テキストを入力',
        sortOrder: 0,
      }
      const newRow: SlideRow = {
        id: `row_${Date.now()}`,
        columns: 1,
        blocks: [initialBlock],
      }
      const newRows = [...rows]
      newRows.splice(afterIndex + 1, 0, newRow)
      updateSlideContent(newRows)
    },
    [rows, updateSlideContent]
  )

  // ブロックを移動（行間移動を含む）
  const handleMoveBlock = useCallback(
    (blockId: string, direction: 'up' | 'down' | 'left' | 'right' | 'up-merge' | 'up-new' | 'down-merge' | 'down-new') => {
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
      const sourceRow = { ...newRows[sourceRowIndex] }
      const block = { ...sourceRow.blocks[sourceBlockIndex] }

      if (direction === 'left') {
        // 左：左のブロックと入れ替え
        if (sourceBlockIndex > 0) {
          sourceRow.blocks = arrayMove(sourceRow.blocks, sourceBlockIndex, sourceBlockIndex - 1)
          newRows[sourceRowIndex] = sourceRow
        }
      } else if (direction === 'right') {
        // 右：右のブロックと入れ替え
        if (sourceBlockIndex < sourceRow.blocks.length - 1) {
          sourceRow.blocks = arrayMove(sourceRow.blocks, sourceBlockIndex, sourceBlockIndex + 1)
          newRows[sourceRowIndex] = sourceRow
        }
      } else if (direction === 'down-merge') {
        // 下にマージ
        if (sourceRowIndex < rows.length - 1) {
          const targetRow = { ...newRows[sourceRowIndex + 1] }
          targetRow.blocks.push(block)
          // 下の行の列数を自動調整
          if (targetRow.blocks.length > targetRow.columns) {
            targetRow.columns = targetRow.blocks.length
          }

          // 元の行を削除して、下の行を更新
          newRows.splice(sourceRowIndex, 1)
          newRows[sourceRowIndex] = targetRow
        } else {
          // 下の行が存在しない場合：新規行を作成
          const newRow: SlideRow = {
            id: `row_${Date.now()}`,
            columns: 1,
            blocks: [block],
          }

          // 元の行を削除して、新規行を追加
          newRows.splice(sourceRowIndex, 1)
          newRows.push(newRow)
        }
      } else if (direction === 'down-new') {
        // 下に新規行を作成
        sourceRow.blocks.splice(sourceBlockIndex, 1)

        // 元の行の列数を1減らす（最低1列は確保）
        sourceRow.columns = Math.max(1, sourceRow.columns - 1)

        const newRow: SlideRow = {
          id: `row_${Date.now()}`,
          columns: 1,
          blocks: [block],
        }

        newRows[sourceRowIndex] = sourceRow
        newRows.splice(sourceRowIndex + 1, 0, newRow)
      } else if (direction === 'up-merge') {
        // 上にマージ
        if (sourceRowIndex > 0) {
          const targetRow = { ...newRows[sourceRowIndex - 1] }
          targetRow.blocks.push(block)
          // 上の行の列数を自動調整
          if (targetRow.blocks.length > targetRow.columns) {
            targetRow.columns = targetRow.blocks.length
          }

          // 元の行を削除
          newRows.splice(sourceRowIndex, 1)
          newRows[sourceRowIndex - 1] = targetRow
        } else {
          // 上の行が存在しない場合：新規行を作成
          const newRow: SlideRow = {
            id: `row_${Date.now()}`,
            columns: 1,
            blocks: [block],
          }

          newRows.splice(sourceRowIndex, 1)
          newRows.splice(0, 0, newRow)
        }
      } else if (direction === 'up-new') {
        // 上に新規行を作成
        sourceRow.blocks.splice(sourceBlockIndex, 1)

        // 元の行の列数を1減らす（最低1列は確保）
        sourceRow.columns = Math.max(1, sourceRow.columns - 1)

        const newRow: SlideRow = {
          id: `row_${Date.now()}`,
          columns: 1,
          blocks: [block],
        }

        newRows[sourceRowIndex] = sourceRow
        newRows.splice(sourceRowIndex, 0, newRow)
      }

      // sortOrderを更新
      newRows.forEach(row => {
        row.blocks.forEach((block, index) => {
          block.sortOrder = index
        })
      })

      // 空になった行を自動削除（ただし、最低1行は残す）
      const filteredRows = newRows.filter(row => row.blocks.length > 0 || newRows.length === 1)
      updateSlideContent(filteredRows)

      // 最後に移動したブロックIDを設定し、3秒後にクリア
      setLastMovedBlockId(blockId)
      setTimeout(() => {
        setLastMovedBlockId(null)
      }, 3000)
    },
    [rows, updateSlideContent]
  )

  // ブロックを更新
  const handleUpdateBlock = useCallback(
    (blockId: string, updates: Partial<SlideBlockType>) => {
      const newRows = rows.map(row => ({
        ...row,
        blocks: row.blocks.map(block => (block.id === blockId ? { ...block, ...updates } : block)),
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

      // 空になった行を自動削除（ただし、最低1行は残す）
      const filteredRows = newRows.filter(row => row.blocks.length > 0 || newRows.length === 1)
      updateSlideContent(filteredRows)
    },
    [rows, updateSlideContent]
  )

  // ブロックを追加
  const handleAddBlock = useCallback(
    (rowId: string, blockType: 'text' | 'image' | 'link') => {
      const newRows = rows.map(row => {
        if (row.id === rowId) {
          const newBlock: SlideBlockType = {
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


  return (
    <div className="bg-white border-2 border-blue-500 rounded-lg shadow-lg">
      {/* ヘッダー */}
      <div className="border-b border-gray-200 bg-blue-50 p-4 rounded-t-lg" onClick={onSelect}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">スライド #{index + 1} - ノーマル</h2>
            {slide.contentData?.title && <p className="text-sm text-gray-600 mt-1">{slide.contentData.title}</p>}
          </div>
          <Button
            onClick={e => {
              e.stopPropagation()
              setIsPreviewMode(!isPreviewMode)
            }}
            className={`flex items-center gap-2 ${isPreviewMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isPreviewMode ? (
              <>
                <Edit className="w-4 h-4" />
                編集モード
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                プレビューモード
              </>
            )}
          </Button>
        </div>
      </div>

      {/* スライド内容 */}
      <div className="p-8 min-h-[400px] bg-white aspect-video" onClick={e => e.stopPropagation()}>
        {rows.length > 0 ? (
          <div className="space-y-6">
            {rows.map((row, rowIndex) => (
              <RowItem
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
                isPreviewMode={isPreviewMode}
                lastMovedBlockId={lastMovedBlockId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <p>コンテンツがありません</p>
            {!isPreviewMode && (
              <Button
                onClick={e => {
                  e.stopPropagation()
                  const initialBlock: SlideBlockType = {
                    id: `block_${Date.now()}`,
                    blockType: 'text',
                    content: 'テキストを入力',
                    sortOrder: 0,
                  }
                  const newRow: SlideRow = {
                    id: `row_${Date.now()}`,
                    columns: 1,
                    blocks: [initialBlock],
                  }
                  updateSlideContent([newRow])
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                最初の行を追加
              </Button>
            )}
          </div>
        )}

        {/* 行追加ボタン（行が存在する場合、編集モード時のみ） */}
        {rows.length > 0 && !isPreviewMode && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={e => {
                e.stopPropagation()
                const initialBlock: SlideBlockType = {
                  id: `block_${Date.now()}`,
                  blockType: 'text',
                  content: 'テキストを入力',
                  sortOrder: 0,
                }
                const newRow: SlideRow = {
                  id: `row_${Date.now()}`,
                  columns: 1,
                  blocks: [initialBlock],
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
