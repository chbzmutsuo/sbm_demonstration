'use client'

import {useState, useEffect} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import type {SlideBlock} from '../../types/game-types'

interface BlockEditModalProps {
  block: SlideBlock | null
  onSave: (blockId: string, updates: Partial<SlideBlock>) => void
  onClose: () => void
}

export default function BlockEditModal({block, onSave, onClose}: BlockEditModalProps) {
  const [formData, setFormData] = useState<Partial<SlideBlock>>({
    content: '',
    imageUrl: '',
    linkUrl: '',
    alignment: 'left',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    fontWeight: 'normal',
    textDecoration: 'none',
    fontSize: undefined,
  })

  useEffect(() => {
    if (block) {
      setFormData({
        content: block.content || '',
        imageUrl: block.imageUrl || '',
        linkUrl: block.linkUrl || '',
        alignment: block.alignment || 'left',
        textColor: block.textColor || '#000000',
        backgroundColor: block.backgroundColor || '#ffffff',
        fontWeight: block.fontWeight || 'normal',
        textDecoration: block.textDecoration || 'none',
        fontSize: block.fontSize || undefined,
      })
    }
  }, [block])

  if (!block) return null

  const handleChange = (field: keyof SlideBlock, value: any) => {
    setFormData(prev => ({...prev, [field]: value}))
  }

  const handleSave = () => {
    if (block.id) {
      onSave(block.id, formData)
      onClose()
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">ブロックを編集</h2>

      <C_Stack className="gap-4">
        {/* テキスト入力 */}
        {['text', 'quiz_question', 'choice_option'].includes(block.blockType) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">テキスト</label>
            <textarea
              value={formData.content || ''}
              onChange={e => handleChange('content', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              rows={4}
              placeholder="テキストを入力 (Markdown対応)"
            />
          </div>
        )}

        {/* 画像URL */}
        {block.blockType === 'image' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">画像URL</label>
            <input
              type="url"
              value={formData.imageUrl || ''}
              onChange={e => handleChange('imageUrl', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        )}

        {/* リンクURL */}
        {block.blockType === 'link' && (
          <C_Stack className="gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">リンクURL</label>
              <input
                type="url"
                value={formData.linkUrl || ''}
                onChange={e => handleChange('linkUrl', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">表示テキスト</label>
              <input
                type="text"
                value={formData.content || ''}
                onChange={e => handleChange('content', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="リンクテキスト"
              />
            </div>
          </C_Stack>
        )}

        {/* 配置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">配置</label>
          <select
            value={formData.alignment || 'left'}
            onChange={e => handleChange('alignment', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="left">左寄せ</option>
            <option value="center">中央</option>
            <option value="right">右寄せ</option>
          </select>
        </div>

        {/* 色設定 */}
        <R_Stack className="gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">テキスト色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.textColor || '#000000'}
                onChange={e => handleChange('textColor', e.target.value)}
                className="w-16 h-10 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={formData.textColor || '#000000'}
                onChange={e => handleChange('textColor', e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">背景色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.backgroundColor || '#ffffff'}
                onChange={e => handleChange('backgroundColor', e.target.value)}
                className="w-16 h-10 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={formData.backgroundColor || '#ffffff'}
                onChange={e => handleChange('backgroundColor', e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm"
              />
            </div>
          </div>
        </R_Stack>

        {/* フォント設定 */}
        {(block.blockType === 'text' || block.blockType === 'link') && (
          <C_Stack className="gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">フォントサイズ (px)</label>
              <input
                type="number"
                min={8}
                max={100}
                value={formData.fontSize || ''}
                onChange={e => handleChange('fontSize', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="例: 16"
              />
              <p className="text-xs text-gray-500 mt-1">8〜100pxの範囲で設定できます</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">フォントスタイル</label>
              <R_Stack className="gap-2">
                <select
                  value={formData.fontWeight || 'normal'}
                  onChange={e => handleChange('fontWeight', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="normal">通常</option>
                  <option value="bold">太字</option>
                </select>
                <select
                  value={formData.textDecoration || 'none'}
                  onChange={e => handleChange('textDecoration', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="none">なし</option>
                  <option value="underline">下線</option>
                </select>
              </R_Stack>
            </div>
          </C_Stack>
        )}

        {/* ボタン */}
        <R_Stack className="justify-end gap-2 pt-4 border-t">
          <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600">
            キャンセル
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            保存
          </Button>
        </R_Stack>
      </C_Stack>
    </div>
  )
}
