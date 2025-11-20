'use client'

import { useState } from 'react'
import { Button } from '@cm/components/styles/common-components/Button'
import { BlockEditor } from './BlockEditor'

import { SlideBlock } from '@app/(apps)/edu/Colabo/(components)/SlideBlock'
import useModal from '@cm/components/utils/modal/useModal'

export const SlideEditor = ({ slide, onSave, onCancel }) => {
  const [title, setTitle] = useState(slide?.title || '')
  const [templateType, setTemplateType] = useState(slide?.templateType || 'normal')
  const [blocks, setBlocks] = useState(slide?.SlideBlock || [])
  // const [editingBlock, setEditingBlock] = useState<any | null>(null)

  const blockEditorModalReturn = useModal<{ block: any }>()
  const [isPreview, setIsPreview] = useState(false)

  const templateOptions = [
    { value: 'normal', label: 'ノーマル', description: '基本的なスライド' },
    { value: 'psychology', label: '心理アンケート', description: '生徒の心理状態を調査' },
    { value: 'choice_quiz', label: '選択クイズ', description: '選択肢から回答を選ぶクイズ' },
    { value: 'free_text_quiz', label: '自由記述クイズ', description: '自由にテキストで回答' },
    { value: 'summary_survey', label: 'まとめアンケート', description: '授業のまとめアンケート' },
  ]

  const addBlock = blockType => {
    const newBlock = {
      id: `temp_${Date.now()}`,
      blockType,
      content: '',
      alignment: 'left',
      sortOrder: blocks.length,
      isNew: true,
    }
    setBlocks([...blocks, newBlock])
    blockEditorModalReturn.handleOpen({ block: newBlock }) // 新しいブロックを編集モードにする
  }

  const updateBlock = (blockId, updates) => {
    setBlocks(blocks.map(block => (block.id === blockId ? { ...block, ...updates } : block)))
  }

  const deleteBlock = blockId => {
    setBlocks(blocks.filter(block => block.id !== blockId))
    blockEditorModalReturn.handleClose()
  }

  const moveBlock = (blockId, direction) => {
    const blockIndex = blocks.findIndex(b => b.id === blockId)
    if ((direction === 'up' && blockIndex > 0) || (direction === 'down' && blockIndex < blocks.length - 1)) {
      const newBlocks = [...blocks]
      const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1
        ;[newBlocks[blockIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[blockIndex]]

      // Update sort orders
      newBlocks.forEach((block, index) => {
        block.sortOrder = index
      })

      setBlocks(newBlocks)
    }
  }

  const handleSave = () => {
    const slideData = {
      title,
      templateType,
      blocks: blocks.map((block, index) => ({
        ...block,
        sortOrder: index,
      })),
    }
    onSave(slideData)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* ヘッダー */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">スライドエディター</h1>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setIsPreview(!isPreview)}>{isPreview ? '編集モード' : 'プレビュー'}</Button>
              <Button onClick={onCancel}>キャンセル</Button>
              <Button onClick={handleSave}>保存</Button>
            </div>
          </div>

          {/* スライド基本設定 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">スライドタイトル</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="スライドのタイトルを入力"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">テンプレート</label>
              <select
                value={templateType}
                onChange={e => setTemplateType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {templateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* サイドバー - ブロック追加 */}
          {!isPreview && (
            <div className="w-64 border-r p-4">
              <h3 className="font-medium text-gray-900 mb-3">ブロックを追加</h3>
              <div className="space-y-2">
                <Button size="sm" className="w-full justify-start" onClick={() => addBlock('text')}>
                  📝 テキスト
                </Button>
                <Button size="sm" className="w-full justify-start" onClick={() => addBlock('image')}>
                  🖼️ 画像
                </Button>
                <Button size="sm" className="w-full justify-start" onClick={() => addBlock('link')}>
                  🔗 リンク
                </Button>
                {templateType === 'choice_quiz' && (
                  <>
                    <Button size="sm" className="w-full justify-start" onClick={() => addBlock('quiz_question')}>
                      ❓ クイズ問題
                    </Button>
                    <Button size="sm" className="w-full justify-start" onClick={() => addBlock('choice_option')}>
                      ☑️ 選択肢
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* メインエディターエリア */}
          <div className="flex-1">
            {/* プレビューモード */}
            {isPreview ? (
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>
                  <div className="space-y-4">
                    {blocks
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map(block => (
                        <SlideBlock key={block.id} block={block} isPreview={true} />
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              /* 編集モード */
              <div className="p-6">
                <div className="space-y-4">
                  {blocks
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((block, index) => (
                      <div key={block.id} className="border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                          <span className="text-sm font-medium">
                            {block.blockType === 'text' && '📝 テキスト'}
                            {block.blockType === 'image' && '🖼️ 画像'}
                            {block.blockType === 'link' && '🔗 リンク'}
                            {block.blockType === 'quiz_question' && '❓ クイズ問題'}
                            {block.blockType === 'choice_option' && '☑️ 選択肢'}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Button size="sm" onClick={() => moveBlock(block.id, 'up')} disabled={index === 0}>
                              ↑
                            </Button>
                            <Button size="sm" onClick={() => moveBlock(block.id, 'down')} disabled={index === blocks.length - 1}>
                              ↓
                            </Button>
                            <Button size="sm" onClick={() => blockEditorModalReturn.handleOpen(block)}>
                              編集
                            </Button>
                            <Button size="sm" onClick={() => deleteBlock(block.id)}>
                              削除
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <SlideBlock block={block} isPreview={false} />
                        </div>
                      </div>
                    ))}

                  {blocks.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      左のサイドバーからブロックを追加してスライドを作成しましょう
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ブロック編集モーダル */}

      <blockEditorModalReturn.Modal>
        <BlockEditor
          block={blockEditorModalReturn.open?.block}
          onSave={updates => {
            updateBlock(blockEditorModalReturn.open?.block?.id, updates)
            blockEditorModalReturn.handleClose()
          }}
          onCancel={() => blockEditorModalReturn.handleClose()}
        />
      </blockEditorModalReturn.Modal>
    </div>
  )
}
