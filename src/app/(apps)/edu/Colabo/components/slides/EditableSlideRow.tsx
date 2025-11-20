'use client'

import { useState, useEffect } from 'react'
import { SlideBlock } from '@app/(apps)/edu/Colabo/(components)/SlideBlock'
import { Plus, Pencil, TrashIcon, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, FileText, Image, Link as LinkIcon } from 'lucide-react'
import type { SlideRow, SlideBlock as SlideBlockType } from '../../types/game-types'
import BlockEditPopover from './BlockEditPopover'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Card } from '@cm/shadcn/ui/card'
import ShadPopover from '@cm/shadcn/ui/Organisms/ShadPopover'

interface EditableSlideRowProps {
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
  isEditing: boolean
  lastMovedBlockId?: string | null
}

function BlockItem({
  block,
  blockIndex,
  totalBlocks,
  row,
  rowIndex,
  totalRows,
  onMoveBlock,
  onUpdateBlock,
  onDeleteBlock,
  isEditing,
  onBlockEditingChange,
  lastMovedBlockId,
}: {
  block: SlideBlockType
  blockIndex: number
  totalBlocks: number
  row: SlideRow
  rowIndex: number
  totalRows: number
  onMoveBlock: (blockId: string, direction: 'up' | 'down' | 'left' | 'right' | 'up-merge' | 'up-new' | 'down-merge' | 'down-new') => void
  onUpdateBlock: (blockId: string, updates: Partial<SlideBlockType>) => void
  onDeleteBlock: (blockId: string) => void
  isEditing: boolean
  onBlockEditingChange: (blockId: string, isEditing: boolean) => void
  lastMovedBlockId?: string | null
}) {
  const [typeMenuOpen, setTypeMenuOpen] = useState(false)

  const handleContentChange = (newContent: string) => {
    onUpdateBlock(block.id, { content: newContent })
  }

  const handleEditingChange = (isEditing: boolean) => {
    onBlockEditingChange(block.id, isEditing)
  }

  const handleTypeChange = (newType: 'text' | 'image' | 'link') => {
    onUpdateBlock(block.id, { blockType: newType })
    setTypeMenuOpen(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className={buttonIconClass} />
      case 'image':
        return <Image className={buttonIconClass} />
      case 'link':
        return <LinkIcon className={buttonIconClass} />
      default:
        return <FileText className={buttonIconClass} />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text':
        return 'テキスト'
      case 'image':
        return '画像'
      case 'link':
        return 'リンク'
      default:
        return type
    }
  }

  const canMoveLeft = blockIndex > 0
  const canMoveRight = blockIndex < totalBlocks - 1
  const hasRowAbove = true
  const hasRowBelow = true
  const isSingleItem = totalBlocks === 1 // 単独アイテムかどうか
  const isLastMoved = lastMovedBlockId === block.id // 最後に移動したブロックかどうか

  const isSingleInRow = totalBlocks === 1

  const buttonClass = `text-xs flex-nowrap w-[60px]`
  const buttonIconClass = `w-3 h-3`

  return (
    <div className={`relative border group ${isLastMoved ? 'animate-pulse ring-4 ring-yellow-400 ring-offset-2' : ''}`}>
      {isEditing && (
        <>
          {/* 編集ボタン */}
          <div className="absolute  center-y right-6 flex gap-1 z-5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Card className={`p-0.5 px-2 `}>
              <R_Stack>
                {/* タイプ切り替えメニュー */}
                <ShadPopover
                  {...{
                    open: typeMenuOpen,
                    setopen: setTypeMenuOpen,
                    Trigger: (
                      <button className="cursor-pointer" title="タイプ切り替え">
                        {getTypeIcon(block.blockType)}
                      </button>
                    ),
                    mode: 'click',

                  }}
                >
                  <div className="p-2 min-w-[120px]">
                    <div className="text-xs font-semibold text-gray-700 mb-2">タイプを選択</div>
                    <C_Stack className="gap-1">
                      {(['text', 'image', 'link'] as const).map(type => (
                        <button
                          key={type}
                          onClick={e => {
                            e.stopPropagation()
                            handleTypeChange(type)
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors ${block.blockType === type
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                          {getTypeIcon(type)}
                          <span>{getTypeLabel(type)}</span>
                        </button>
                      ))}
                    </C_Stack>
                  </div>
                </ShadPopover>
                <BlockEditPopover
                  block={block}
                  onSave={(blockId, updates) => {
                    onUpdateBlock(blockId, updates)
                  }}
                  trigger={
                    <button className="cursor-pointer" title="スタイル編集">
                      <Pencil className="w-3 h-3 text-blue-500" />
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
                  title="削除"
                >
                  <TrashIcon className="w-3 h-3 text-red-500" />
                </button>
              </R_Stack>
            </Card>
          </div>

          {/* 移動矢印ボタン */}
          <div className="absolute inset-0 pointer-events-none">
            {/* 左矢印 */}
            {canMoveLeft && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  onMoveBlock(block.id, 'left')
                }}
                className="absolute z-50 left-6 top-1/2 -translate-y-1/2 -translate-x-full bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-lg pointer-events-auto opacity-0 group-hover:opacity-30 hover:opacity-100  transition-opacity"
                title="左に移動"
              >
                <ArrowLeft className={buttonIconClass} />
              </button>
            )}

            {/* 右矢印 */}
            {canMoveRight && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  onMoveBlock(block.id, 'right')
                }}


                className="absolute z-50 right-6 top-1/2 -translate-y-1/2 translate-x-full bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-lg pointer-events-auto opacity-0 group-hover:opacity-30 hover:opacity-100  transition-opacity"
                title="右に移動"
              >
                <ArrowRight className={buttonIconClass} />
              </button>
            )}

            {/* 上矢印 - 2種類（マージと新規行作成） */}
            {hasRowAbove && (
              <div className="absolute z-50 top-4 left-1/2 -translate-x-1/2 -translate-y-full flex gap-1 opacity-0 group-hover:opacity-30 hover:opacity-100  transition-opacity">
                {/* マージ用ボタン */}
                {rowIndex !== 0 && <button
                  onClick={e => {
                    e.stopPropagation()
                    onMoveBlock(block.id, 'up-merge')
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-lg pointer-events-auto z-10"
                  title="上にマージ"
                >
                  <R_Stack className={buttonClass}>
                    <ArrowUp className={buttonIconClass} />
                    合流
                  </R_Stack>
                </button>}


                {/* 新規行作成用ボタン */}
                {!isSingleInRow && <button
                  onClick={e => {
                    e.stopPropagation()
                    onMoveBlock(block.id, 'up-new')
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full p-1 shadow-lg pointer-events-auto z-10"
                  title="上に新規行を作成"
                >
                  <R_Stack className={buttonClass} >
                    <ArrowUp className={buttonIconClass} />
                    分離
                  </R_Stack>
                </button>}
              </div>
            )}

            {/* 下矢印 - 2種類（マージと新規行作成） */}
            {hasRowBelow && (
              <div className="absolute z-50 bottom-4 left-1/2 -translate-x-1/2 translate-y-full flex gap-1 opacity-0 group-hover:opacity-30 hover:opacity-100  transition-opacity">
                {/* マージ用ボタン */}
                {rowIndex !== totalRows - 1 && <button
                  onClick={e => {
                    e.stopPropagation()
                    onMoveBlock(block.id, 'down-merge')
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-lg pointer-events-auto z-10"
                  title="下にマージ"
                >
                  <R_Stack className={buttonClass}>
                    <ArrowDown className={buttonIconClass} />
                    合流
                  </R_Stack>
                </button>}

                {/* 新規行作成用ボタン */}
                {!isSingleInRow && <button
                  onClick={e => {
                    e.stopPropagation()
                    onMoveBlock(block.id, 'down-new')
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full p-1 shadow-lg pointer-events-auto z-10"
                  title="下に新規行を作成"
                >
                  <R_Stack className={buttonClass} >
                    <ArrowDown className={buttonIconClass} />
                    分離
                  </R_Stack>
                </button>}
              </div>
            )}
          </div>
        </>
      )}

      <SlideBlock
        block={block}
        isPreview={!isEditing}
        onContentChange={handleContentChange}
        onEditingChange={handleEditingChange}
      />
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
  lastMovedBlockId,
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

  const handleColumnChange = (newColumns: number) => {
    const currentBlocks = [...row.blocks]
    const newBlocks = currentBlocks.slice(0, newColumns * 10)

    onUpdateRow(row.id, {
      columns: newColumns,
      blocks: newBlocks,
    })
    setIsColumnSettingOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
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
    <div className={`relative `}>
      <div className="" onClick={e => e.stopPropagation()}>
        {/* 行ヘッダー */}
        {isEditing && (
          <div className="flex items-center justify-between">
            {/* 列数設定 */}
            {/* <div className="flex items-center gap-2">
              <div className="">
                <Card className={`absolute right-2 -top-4 p-0.5 px-2 z-10`}>
                  <R_Stack className={`relative`}>
                    <span className="text-[10px] font-medium text-gray-700">
                      行 {rowIndex + 1}
                    </span>

                    <div className={``}>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setIsColumnSettingOpen(!isColumnSettingOpen)
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                        data-menu="column-setting"
                      >
                        <Settings className={buttonIconClass} />
                        <span className="text-[10px]">{row.columns}列</span>
                      </button>
                    </div>

                    {isColumnSettingOpen && (
                      <>
                        <div
                          className="absolute w-[300px] top-full right-0 mt-1 p-2 z-50 bg-white border border-gray-300 rounded shadow-lg"
                          data-menu="column-setting"
                        >
                          <C_Stack>
                            <Card>
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
                                      className={`px-2 py-1 text-xs rounded ${row.columns === cols ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                    >
                                      {cols}列
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </Card>
                            <Card>{RowEditConfig}</Card>
                          </C_Stack>
                        </div>
                      </>
                    )}
                  </R_Stack>
                </Card>
              </div>
            </div> */}
          </div>
        )}

        {/* グリッドレイアウト */}
        <div className="relative ">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${row.columns}, minmax(0, 1fr))`,
            }}
          >
            {row.blocks.map((block, blockIndex) => (
              <BlockItem
                key={block.id}
                block={block}
                blockIndex={blockIndex}
                totalBlocks={row.blocks.length}
                row={row}
                rowIndex={rowIndex}
                totalRows={totalRows}
                onMoveBlock={onMoveBlock}
                onUpdateBlock={onUpdateBlock}
                onDeleteBlock={onDeleteBlock}
                isEditing={isEditing}
                onBlockEditingChange={handleBlockEditingChange}
                lastMovedBlockId={lastMovedBlockId}
              />
            ))}

            {/* 空の行の場合のメッセージ */}
            {row.blocks.length === 0 && (
              <div className="col-span-full flex items-center justify-center h-16 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <span className="text-gray-500 text-sm">ブロックを追加してください</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
