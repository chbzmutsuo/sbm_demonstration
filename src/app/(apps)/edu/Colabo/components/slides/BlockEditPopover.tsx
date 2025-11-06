'use client'

import {useState, useEffect} from 'react'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import ShadPopover from '@cm/shadcn/ui/Organisms/ShadPopover'
import type {SlideBlock} from '../../types/game-types'

interface BlockEditPopoverProps {
  block: SlideBlock
  onSave: (blockId: string, updates: Partial<SlideBlock>) => void
  trigger: any
}

export default function BlockEditPopover({block, onSave, trigger}: BlockEditPopoverProps) {
  const [formData, setFormData] = useState<Partial<SlideBlock>>({
    alignment: 'left',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    fontWeight: 'normal',
    textDecoration: 'none',
    fontSize: undefined,
    imageUrl: '',
    linkUrl: '',
  })

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (block) {
      setFormData({
        alignment: block.alignment || 'left',
        textColor: block.textColor || '#000000',
        backgroundColor: block.backgroundColor || '#ffffff',
        fontWeight: block.fontWeight || 'normal',
        textDecoration: block.textDecoration || 'none',
        fontSize: block.fontSize || undefined,
        imageUrl: block.imageUrl || '',
        linkUrl: block.linkUrl || '',
      })
    }
  }, [block])

  const handleChange = (field: keyof SlideBlock, value: any) => {
    const updatedData = {...formData, [field]: value}
    setFormData(updatedData)
    // 即時反映: 変更時にすぐに保存
    if (block.id) {
      onSave(block.id, updatedData)
    }
  }

  return (
    <div>
      <ShadPopover
        open={open}
        setopen={setOpen}
        PopoverTrigger={trigger}
        mode="hover"
        closeOnHoverLeave={false}
        // confirmBeforeClose={true}
      >
        <div className="p-4 max-w-sm">
          <h3 className="text-lg font-bold mb-4">ブロックのスタイル</h3>

          <C_Stack className="gap-4">
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
            )}
          </C_Stack>
        </div>
      </ShadPopover>
    </div>
  )
}
