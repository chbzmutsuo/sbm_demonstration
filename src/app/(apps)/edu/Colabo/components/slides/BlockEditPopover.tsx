'use client'

import { useState, useEffect, useRef } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import ShadPopover from '@cm/shadcn/ui/Organisms/ShadPopover'
import type { SlideBlock } from '../../types/game-types'
import { FileHandler } from '@cm/class/FileHandler'
import { toast } from 'react-toastify'
import { Upload, Link as LinkIcon } from 'lucide-react'

interface BlockEditPopoverProps {
  block: SlideBlock
  onSave: (blockId: string, updates: Partial<SlideBlock>) => void
  trigger: any
}

export default function BlockEditPopover({ block, onSave, trigger }: BlockEditPopoverProps) {
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
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    // 即時反映: 変更時にすぐに保存
    // if (block.id) {
    //   onSave(block.id, updatedData)
    // }
  }

  const handleOnBlur = (field: keyof SlideBlock, value: any) => {
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    // 即時反映: 変更時にすぐに保存
    if (block.id) {
      onSave(block.id, updatedData)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 画像ファイルの検証
    if (!file.type.startsWith('image/')) {
      toast.error('画像ファイルを選択してください')
      return
    }

    setIsUploading(true)

    try {
      const uploadResult = await FileHandler.sendFileToS3({
        file,
        formDataObj: {
          bucketKey: `colabo/slides/${block.id}`,
          deleteImageUrl: formData.imageUrl || undefined,
          optimize: true,
        },
      })

      if (uploadResult.success && uploadResult.result?.url) {
        const updatedData = { ...formData, imageUrl: uploadResult.result.url }
        setFormData(updatedData)
        if (block.id) {
          onSave(block.id, updatedData)
        }
        toast.success('画像をアップロードしました')
      } else {
        toast.error(uploadResult.message || '画像のアップロードに失敗しました')
      }
    } catch (error) {
      console.error('画像アップロードエラー:', error)
      toast.error('画像のアップロードに失敗しました')
    } finally {
      setIsUploading(false)
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const isS3Url = (url: string) => {
    if (!url) return false
    return url.includes('.s3.') || url.includes('amazonaws.com') || url.startsWith('/') || (typeof window !== 'undefined' && url.startsWith(window.location.origin))
  }

  return (
    <div>
      <ShadPopover
        {...{
          open: open,
          setopen: setOpen,
          Trigger: trigger,
          mode: 'click',
          popoverId: 'blockItemEditorPopover',
          maxOpen: 1,
        }}
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
                onBlur={e => handleOnBlur('alignment', e.target.value)}

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
                    onBlur={e => handleOnBlur('textColor', e.target.value)}

                    className="w-16 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={formData.textColor || '#000000'}
                    onChange={e => handleChange('textColor', e.target.value)}
                    onBlur={e => handleOnBlur('textColor', e.target.value)}

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
                    onBlur={e => handleOnBlur('backgroundColor', e.target.value)}

                    className="w-16 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={formData.backgroundColor || '#ffffff'}
                    onChange={e => handleChange('backgroundColor', e.target.value)}
                    onBlur={e => handleOnBlur('backgroundColor', e.target.value)}

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
                    onBlur={e => handleOnBlur('fontSize', e.target.value)}
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
                      onBlur={e => handleOnBlur('fontWeight', e.target.value)}

                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="normal">通常</option>
                      <option value="bold">太字</option>
                    </select>
                    <select
                      value={formData.textDecoration || 'none'}
                      onChange={e => handleChange('textDecoration', e.target.value)}
                      onBlur={e => handleOnBlur('textDecoration', e.target.value)}

                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="none">なし</option>
                      <option value="underline">下線</option>
                    </select>
                  </R_Stack>
                </div>
              </C_Stack>
            )}

            {/* 画像設定 */}
            {block.blockType === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">画像設定</label>

                {/* タブ切り替え */}
                <div className="flex gap-2 mb-3 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      imageTab === 'upload'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <R_Stack className="items-center gap-1">
                      <Upload className="w-4 h-4" />
                      <span>ファイルアップロード</span>
                    </R_Stack>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      imageTab === 'url'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <R_Stack className="items-center gap-1">
                      <LinkIcon className="w-4 h-4" />
                      <span>外部リンク</span>
                    </R_Stack>
                  </button>
                </div>

                {/* ファイルアップロード */}
                {imageTab === 'upload' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isUploading ? 'アップロード中...' : '画像ファイルを選択'}
                    </button>
                    {formData.imageUrl && isS3Url(formData.imageUrl) && (
                      <div className="mt-2 text-xs text-gray-500">
                        ✓ S3にアップロード済み
                      </div>
                    )}
                  </div>
                )}

                {/* 外部リンク */}
                {imageTab === 'url' && (
                  <div>
                    <input
                      type="url"
                      value={formData.imageUrl || ''}
                      onChange={e => handleChange('imageUrl', e.target.value)}
                      onBlur={e => handleOnBlur('imageUrl', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      外部リンクの画像は自動的にプロキシ経由で表示されます（CORS問題を回避）
                    </p>
                  </div>
                )}

                {/* プレビュー */}
                {formData.imageUrl && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">プレビュー</label>
                    <div className="border border-gray-300 rounded p-2 bg-gray-50">
                      <img
                        src={formData.imageUrl}
                        alt="プレビュー"
                        className="max-w-full h-auto max-h-32 object-contain mx-auto"
                        onError={e => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
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
