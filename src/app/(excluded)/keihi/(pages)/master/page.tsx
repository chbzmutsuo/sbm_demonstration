'use client'

import {useState, useEffect} from 'react'
import {toast} from 'react-toastify'
import Link from 'next/link'
import {
  getAllOptions,
  createOption,
  updateOption,
  deleteOption,
  updateOptionOrder,
  seedDefaultOptions,
  seedFullAccountMaster,
  seedFullOptionMaster,
  type OptionMaster,
  type CreateOptionData,
  type UpdateOptionData,
} from '../../actions/master-actions'

const CATEGORY_LABELS = {
  subjects: '科目',
  industries: '業種',
  purposes: '目的',
}

export default function MasterPage() {
  const [options, setOptions] = useState<OptionMaster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('subjects')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOption, setEditingOption] = useState<OptionMaster | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isFullSeeding, setIsFullSeeding] = useState(false)

  const [formData, setFormData] = useState<CreateOptionData>({
    category: 'subjects',
    value: '',
    label: '',
    description: '',
    sortOrder: 0,
    color: '',
  })

  // 全オプションを取得
  const fetchOptions = async () => {
    setIsLoading(true)
    try {
      const result = await getAllOptions()
      if (result.success && result.data) {
        setOptions(result.data)
      } else {
        toast.error(result.error || '選択肢の取得に失敗しました')
      }
    } catch (error) {
      toast.error('選択肢の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOptions()
  }, [])

  // 選択されたカテゴリの選択肢のみをフィルタ
  const filteredOptions = options.filter(option => option.category === selectedCategory)

  // 新規作成モーダルを開く
  const openCreateModal = () => {
    setEditingOption(null)
    setFormData({
      category: selectedCategory,
      value: '',
      label: '',
      description: '',
      sortOrder: Math.max(...filteredOptions.map(o => o.sortOrder), 0) + 1,
      color: '',
    })
    setIsModalOpen(true)
  }

  // 編集モーダルを開く
  const openEditModal = (option: OptionMaster) => {
    setEditingOption(option)
    setFormData({
      category: option.category,
      value: option.value,
      label: option.label,
      description: option.description || '',
      sortOrder: option.sortOrder,
      color: option.color || '',
    })
    setIsModalOpen(true)
  }

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.value.trim() || !formData.label.trim()) {
      toast.error('値と表示名は必須です')
      return
    }

    try {
      let result
      if (editingOption) {
        // 更新
        const updateData: UpdateOptionData = {
          value: formData.value,
          label: formData.label,
          description: formData.description || undefined,
          sortOrder: formData.sortOrder,
          color: formData.color || undefined,
        }
        result = await updateOption(editingOption.id, updateData)
      } else {
        // 新規作成
        result = await createOption(formData)
      }

      if (result.success) {
        toast.success(editingOption ? '選択肢を更新しました' : '選択肢を作成しました')
        setIsModalOpen(false)
        fetchOptions()
      } else {
        toast.error(result.error || '操作に失敗しました')
      }
    } catch (error) {
      toast.error('操作に失敗しました')
    }
  }

  // 削除
  const handleDelete = async (option: OptionMaster) => {
    if (!confirm(`「${option.label}」を削除しますか？`)) return

    try {
      const result = await deleteOption(option.id)
      if (result.success) {
        toast.success('選択肢を削除しました')
        fetchOptions()
      } else {
        toast.error(result.error || '削除に失敗しました')
      }
    } catch (error) {
      toast.error('削除に失敗しました')
    }
  }

  // 並び順変更
  const moveOption = async (option: OptionMaster, direction: 'up' | 'down') => {
    const sortedOptions = [...filteredOptions].sort((a, b) => a.sortOrder - b.sortOrder)
    const currentIndex = sortedOptions.findIndex(o => o.id === option.id)

    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === sortedOptions.length - 1) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const targetOption = sortedOptions[targetIndex]

    try {
      const updates = [
        {id: option.id, sortOrder: targetOption.sortOrder},
        {id: targetOption.id, sortOrder: option.sortOrder},
      ]

      const result = await updateOptionOrder(updates)
      if (result.success) {
        fetchOptions()
      } else {
        toast.error(result.error || '並び順の更新に失敗しました')
      }
    } catch (error) {
      toast.error('並び順の更新に失敗しました')
    }
  }

  // 初期データ投入
  const handleSeedData = async () => {
    if (!confirm('初期データを投入しますか？既存のデータがある場合は重複しません。')) return

    setIsSeeding(true)
    try {
      const result = await seedDefaultOptions()
      if (result.success) {
        toast.success('初期データを投入しました')
        fetchOptions()
      } else {
        toast.error(result.error || '初期データの投入に失敗しました')
      }
    } catch (error) {
      toast.error('初期データの投入に失敗しました')
    } finally {
      setIsSeeding(false)
    }
  }

  // 完全版データ投入
  const handleFullSeedData = async () => {
    if (
      !confirm(
        '完全版マスタデータを投入しますか？\n・勘定科目マスタ（137項目）\n・選択肢マスタ（科目・業種・目的）\n\n既存のデータがある場合は重複しません。'
      )
    )
      return

    setIsFullSeeding(true)
    try {
      // 勘定科目マスタを投入
      const accountResult = await seedFullAccountMaster()
      if (!accountResult.success) {
        toast.error(accountResult.error || '勘定科目マスタの投入に失敗しました')
        return
      }

      // 選択肢マスタを投入
      const optionResult = await seedFullOptionMaster()
      if (!optionResult.success) {
        toast.error(optionResult.error || '選択肢マスタの投入に失敗しました')
        return
      }

      toast.success('完全版マスタデータを投入しました')
      fetchOptions()
    } catch (error) {
      toast.error('完全版データの投入に失敗しました')
    } finally {
      setIsFullSeeding(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">🛠 マスタ管理</h1>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link href="/keihi" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-center">
                  経費一覧に戻る
                </Link>
                <button
                  onClick={handleSeedData}
                  disabled={isSeeding || isFullSeeding}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isSeeding ? '投入中...' : '基本データ投入'}
                </button>
                <button
                  onClick={handleFullSeedData}
                  disabled={isSeeding || isFullSeeding}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {isFullSeeding ? '投入中...' : '完全版データ投入'}
                </button>
                <button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  新規追加
                </button>
              </div>
            </div>
          </div>

          {/* カテゴリタブ */}
          <div className="px-3 sm:px-6 py-4">
            <div className="flex flex-wrap sm:flex-nowrap border-b border-gray-200 gap-2 sm:gap-0">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 sm:px-4 py-2 sm:mr-6 border-b-2 transition-colors text-sm sm:text-base whitespace-nowrap ${
                    selectedCategory === key
                      ? 'border-blue-500 text-blue-600 font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label} ({options.filter(o => o.category === key && o.isActive).length})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 選択肢一覧 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {CATEGORY_LABELS[selectedCategory as keyof typeof CATEGORY_LABELS]}の管理
            </h2>
          </div>

          <div className="p-3 sm:p-6">
            {filteredOptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">選択肢がありません。新規追加ボタンから追加してください。</div>
            ) : (
              <div className="space-y-2">
                {filteredOptions
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((option, index) => (
                    <div
                      key={option.id}
                      className={`p-3 sm:p-4 rounded-lg border ${
                        option.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300 opacity-60'
                      }`}
                    >
                      {/* モバイル用レイアウト */}
                      <div className="sm:hidden">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {option.color && (
                              <div className="w-4 h-4 rounded-full border" style={{backgroundColor: option.color}} />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{option.label}</span>
                                {!option.isActive && (
                                  <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">削除済み</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                値: {option.value} | 順序: {option.sortOrder}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveOption(option, 'up')}
                              disabled={index === 0}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveOption(option, 'down')}
                              disabled={index === filteredOptions.length - 1}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                        {option.description && <div className="text-sm text-gray-500 mb-3">{option.description}</div>}
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(option)}
                            className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            編集
                          </button>
                          {option.isActive && (
                            <button
                              onClick={() => handleDelete(option)}
                              className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              削除
                            </button>
                          )}
                        </div>
                      </div>

                      {/* デスクトップ用レイアウト */}
                      <div className="hidden sm:flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveOption(option, 'up')}
                              disabled={index === 0}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveOption(option, 'down')}
                              disabled={index === filteredOptions.length - 1}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ↓
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            {option.color && (
                              <div className="w-4 h-4 rounded-full border" style={{backgroundColor: option.color}} />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{option.label}</span>
                                {!option.isActive && (
                                  <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">削除済み</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                値: {option.value} | 順序: {option.sortOrder}
                              </div>
                              {option.description && <div className="text-sm text-gray-500 mt-1">{option.description}</div>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(option)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            編集
                          </button>
                          {option.isActive && (
                            <button
                              onClick={() => handleDelete(option)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              削除
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingOption ? '選択肢を編集' : '選択肢を追加'}</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({...prev, category: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!editingOption}
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  値 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={e => setFormData(prev => ({...prev, value: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: IT・ソフトウェア"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  表示名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={e => setFormData(prev => ({...prev, label: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: IT・ソフトウェア"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="選択肢の説明（任意）"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">並び順</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={e => setFormData(prev => ({...prev, sortOrder: parseInt(e.target.value) || 0}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">色</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => setFormData(prev => ({...prev, color: e.target.value}))}
                    className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingOption ? '更新' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
