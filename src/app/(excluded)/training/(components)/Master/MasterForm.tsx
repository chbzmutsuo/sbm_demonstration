'use client'

import React, {useState, useEffect} from 'react'
import {ExerciseMaster} from '../../types/training'
import {createExerciseMaster, updateExerciseMaster} from '../../server-actions/exercise-master'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {PART_OPTIONS} from '@app/(excluded)/training/(constants)/PART_OPTIONS'

interface MasterFormProps {
  master: ExerciseMaster | null
  onSave: () => void
  onCancel: () => void
}

export function MasterForm({master, onSave, onCancel}: MasterFormProps) {
  const {session} = useGlobal()
  const userId = session?.id || 1

  // フォームデータ
  const [formData, setFormData] = useState<any>({
    part: '',
    name: '',
    unit: 'kg',
  })

  // ローディング状態
  const [isLoading, setIsLoading] = useState(false)

  // エラー状態
  const [error, setError] = useState<string | null>(null)

  // 編集時は初期値を設定
  useEffect(() => {
    if (master) {
      setFormData({
        part: master.part,
        name: master.name,
        unit: master.unit,
      })
    }
  }, [master])

  // フォーム入力の変更処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target
    setFormData(prev => ({...prev, [name]: value}))
  }

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formData.part.trim()) {
      setError('部位を入力してください')
      return
    }
    if (!formData.name.trim()) {
      setError('種目名を入力してください')
      return
    }
    if (!formData.unit.trim()) {
      setError('単位を入力してください')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (master) {
        // 更新処理
        await updateExerciseMaster(userId, master.id, formData)
      } else {
        // 新規作成処理
        await createExerciseMaster(userId, formData)
      }
      onSave()
    } catch (err) {
      setError(master ? '種目の更新に失敗しました' : '種目の作成に失敗しました')
      console.error('種目保存エラー:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 部位の選択肢

  // 単位の選択肢
  const unitOptions = ['kg', 'lb', 'min', '回', 'km', 'm']

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-center">{master ? '種目を編集' : '新規種目を追加'}</h3>

      {/* エラー表示 */}
      {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 部位選択 */}
        <div>
          <label htmlFor="part" className="block text-sm font-medium text-slate-700 mb-1">
            部位 <span className="text-red-500">*</span>
          </label>
          <select
            id="part"
            name="part"
            value={formData.part}
            onChange={handleChange}
            required
            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">部位を選択してください</option>
            {PART_OPTIONS.map(part => (
              <option key={part.label} value={part.label}>
                {part.label}
              </option>
            ))}
          </select>
        </div>

        {/* 種目名入力 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            種目名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="例: ベンチプレス"
            required
            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 単位選択 */}
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-slate-700 mb-1">
            単位 <span className="text-red-500">*</span>
          </label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            required
            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {unitOptions.map(unit => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        {/* カスタム単位入力 */}
        <div>
          <label htmlFor="customUnit" className="block text-sm font-medium text-slate-700 mb-1">
            カスタム単位
          </label>
          <input
            type="text"
            id="customUnit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="その他の単位を入力"
            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">上記の選択肢にない単位がある場合は、こちらに入力してください</p>
        </div>

        {/* ボタン */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full bg-slate-200 text-slate-800 font-bold py-3 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? '処理中...' : master ? '更新' : '作成'}
          </button>
        </div>
      </form>
    </div>
  )
}
