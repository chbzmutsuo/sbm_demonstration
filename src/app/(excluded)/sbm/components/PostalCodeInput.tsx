'use client'

import React, {useState} from 'react'
import {MapPin, Loader2} from 'lucide-react'

// 住所データ型
export type AddressData = {
  postalCode: string
  prefecture: string
  city: string
  street: string
  building?: string
}

// ZipCloudAPIレスポンス型
type ZipCloudResponse = {
  message: string | null
  results: Array<{
    zipcode: string
    prefcode: string
    address1: string // 都道府県
    address2: string // 市区町村
    address3: string // 町名
    kana1: string
    kana2: string
    kana3: string
  }> | null
  status: number
}

type PostalCodeInputProps = {
  postalCode: string
  prefecture: string
  city: string
  street: string
  building?: string
  onAddressChange: (address: Partial<AddressData>) => void
  disabled?: boolean
}

/**
 * 郵便番号入力・住所自動取得コンポーネント
 * 郵便番号を入力してボタンを押すと住所を自動取得する
 */
const PostalCodeInput: React.FC<PostalCodeInputProps> = ({
  postalCode,
  prefecture,
  city,
  street,
  building = '',
  onAddressChange,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 郵便番号から住所を取得
  const handlePostalCodeLookup = async () => {
    if (!postalCode || postalCode.length < 7) {
      setError('郵便番号を正しく入力してください（7桁）')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // ハイフンを除去
      const cleanedPostalCode = postalCode.replace(/-/g, '')

      // ZipCloud API (無料)を使用
      const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanedPostalCode}`)
      const data: ZipCloudResponse = await response.json()

      if (data.status === 200 && data.results && data.results.length > 0) {
        const result = data.results[0]
        onAddressChange({
          postalCode,
          prefecture: result.address1,
          city: result.address2,
          street: result.address3,
        })
        setError(null)
      } else {
        setError('該当する住所が見つかりませんでした')
      }
    } catch (err) {
      console.error('住所取得エラー:', err)
      setError('住所の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 郵便番号入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">郵便番号 *</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={postalCode || ''}
            onChange={e => onAddressChange({postalCode: e.target.value})}
            placeholder="123-4567"
            maxLength={8}
            disabled={disabled}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="button"
            onClick={handlePostalCodeLookup}
            disabled={disabled || isLoading || !postalCode}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <MapPin size={16} className="mr-1" />
                住所取得
              </>
            )}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>

      {/* 住所入力フィールド */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">都道府県 *</label>
          <input
            type="text"
            value={prefecture || ''}
            onChange={e => onAddressChange({prefecture: e.target.value})}
            placeholder="東京都"
            disabled={disabled}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">市区町村 *</label>
          <input
            type="text"
            value={city || ''}
            onChange={e => onAddressChange({city: e.target.value})}
            placeholder="渋谷区"
            disabled={disabled}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">町名番地 *</label>
        <input
          type="text"
          value={street || ''}
          onChange={e => onAddressChange({street: e.target.value})}
          placeholder="道玄坂1-2-3"
          disabled={disabled}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">その他（建物名等）</label>
        <input
          type="text"
          value={building || ''}
          onChange={e => onAddressChange({building: e.target.value})}
          placeholder="○○ビル4F"
          disabled={disabled}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>
    </div>
  )
}

export default PostalCodeInput
