'use client'

import { Circle, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Button } from '@cm/components/styles/common-components/Button'
import { cn } from '@cm/shadcn/lib/utils'
import { Card } from '@cm/shadcn/ui/card'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useState } from 'react'

interface BlockItemProps {
  block: any
  index: number
  totalBlocks: number
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  handleUpdateBlock: (blockId: string, updates: any) => void
  onMove: (blockId: string, direction: 'up' | 'down') => void
}

export default function BlockItem({
  block,
  index,
  totalBlocks,
  isEditing,
  onEdit,
  onDelete,
  handleUpdateBlock,
  onMove,
}: BlockItemProps) {
  const getBlockLabel = (type: string) => {
    switch (type) {
      case 'text':
        return '📝 テキスト'
      case 'image':
        return '🖼️ 画像'
      case 'link':
        return '🔗 リンク'
      case 'quiz_question':
        return '❓ クイズ問題'
      case 'choice_option':
        return '☑️ 選択肢'
      default:
        return type
    }
  }

  const [isDirty, setisDirty] = useState(false)
  const [formData, setFormData] = useState({
    content: block.content || '',
    imageUrl: block.imageUrl || '',
    linkUrl: block.linkUrl || '',
    alignment: block.alignment || 'left',
    textColor: block.textColor || '#000000',
    backgroundColor: block.backgroundColor || '#ffffff',
    fontWeight: block.fontWeight || 'normal',
    textDecoration: block.textDecoration || 'none',
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setisDirty(true)
  }

  const handleSave = () => {
    handleUpdateBlock(block.id, formData)
    setisDirty(false)
  }

  return (
    <Card className={cn('!p-0 ', isDirty ? 'border-yellow-500 border  bg-yellow-50' : 'border-gray-200 bg-white  ')}>
      <R_Stack className={` justify-between bg-gray-300 p-1 rounded-t-md`}>
        <Circle color="gray" width={20} height={20} className={`text-sm`}>
          {index + 1}
        </Circle>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onMove(block.id, 'up')}
            disabled={index === 0}
            className="text-xs text-gray-800 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed px-1"
          >
            <ArrowUp />
          </button>
          <button
            onClick={() => onMove(block.id, 'down')}
            disabled={index === totalBlocks - 1}
            className="text-xs text-gray-800 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed px-1"
          >
            <ArrowDown />
          </button>
        </div>
      </R_Stack>

      <div className={cn('p-1 rounded')}>
        {/* テキスト入力 */}
        {['text', 'quiz_question', 'choice_option'].includes(block.blockType) && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">テキスト</label>
            <textarea
              value={formData.content}
              onChange={e => handleChange('content', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              rows={3}
              placeholder="テキストを入力 (Markdown対応)"
            />
          </div>
        )}

        {/* 画像URL */}
        {block.blockType === 'image' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">画像URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={e => handleChange('imageUrl', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        )}

        {/* リンクURL */}
        {block.blockType === 'link' && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">リンクURL</label>
              <input
                type="url"
                value={formData.linkUrl}
                onChange={e => handleChange('linkUrl', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">表示テキスト</label>
              <input
                type="text"
                value={formData.content}
                onChange={e => handleChange('content', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="リンクテキスト"
              />
            </div>
          </div>
        )}

        {/* 配置 */}
        <R_Stack className={` items-end justify-between`}>
          <R_Stack>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">配置</label>
              <select
                value={formData.alignment}
                onChange={e => handleChange('alignment', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="left">左寄せ</option>
                <option value="center">中央</option>
                <option value="right">右寄せ</option>
              </select>
            </div>

            {/* 色設定 */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">テキスト色</label>
                <input
                  type="color"
                  value={formData.textColor}
                  onChange={e => handleChange('textColor', e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">背景色</label>
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={e => handleChange('backgroundColor', e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              </div>
            </div>
          </R_Stack>
          {/* ボタン */}
          <div>
            <Button size="sm" onClick={handleSave} disabled={!isDirty} className=" bg-blue-600">
              保存
            </Button>
            {/* <Button size="sm" onClick={onCancel} className="bg-gray-500">
          キャンセル
        </Button> */}
          </div>
        </R_Stack>
      </div>
    </Card>
  )
}
