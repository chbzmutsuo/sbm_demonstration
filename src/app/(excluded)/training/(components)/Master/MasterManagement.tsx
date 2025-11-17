'use client'

import React, {useState, useEffect} from 'react'
import {ExerciseMaster} from '../../types/training'
import {MasterForm} from './MasterForm'
import {getExerciseMasters, deleteExerciseMaster} from '../../server-actions/exercise-master'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {PART_OPTIONS} from '@app/(excluded)/training/(constants)/PART_OPTIONS'

export function MasterManagement() {
  const {session} = useGlobal()
  const userId = session?.id || 1

  // 種目マスタ一覧
  const [masters, setMasters] = useState<ExerciseMaster[]>([])

  // フォーム表示状態
  const [isFormOpen, setIsFormOpen] = useState(false)

  // 編集中の種目
  const [editingMaster, setEditingMaster] = useState<ExerciseMaster | null>(null)

  // ローディング状態
  const [isLoading, setIsLoading] = useState(false)

  // エラー状態
  const [error, setError] = useState<string | null>(null)

  // 種目マスタ一覧を取得
  const fetchMasters = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await getExerciseMasters(userId)
      if (result.result) {
        setMasters(result.result)
      }
    } catch (err) {
      setError('種目マスタの取得に失敗しました')
      console.error('種目マスタ取得エラー:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 初回ロード時に種目マスタを取得
  useEffect(() => {
    fetchMasters()
  }, [userId])

  // 新規種目追加フォームを表示
  const handleAddNew = () => {
    setEditingMaster(null)
    setIsFormOpen(true)
  }

  // 種目編集フォームを表示
  const handleEdit = (master: ExerciseMaster) => {
    setEditingMaster(master)
    setIsFormOpen(true)
  }

  // 種目削除処理
  const handleDelete = async (masterId: number) => {
    if (!confirm('この種目を削除しますか？関連するログは残ります。')) return

    try {
      await deleteExerciseMaster(userId, masterId)
      // 削除後に一覧を再取得
      fetchMasters()
    } catch (err) {
      setError('種目の削除に失敗しました')
      console.error('種目削除エラー:', err)
    }
  }

  // フォームを閉じる
  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingMaster(null)
  }

  // 種目保存後の処理
  const handleSaveSuccess = () => {
    handleCloseForm()
    fetchMasters() // 一覧を再取得
  }

  // 部位別にグループ化
  const groupedMasters = masters.reduce(
    (acc, master) => {
      const part = master.part
      if (!acc[part]) acc[part] = []
      acc[part].push(master)
      return acc
    },
    {} as Record<string, ExerciseMaster[]>
  )

  // 部位の表示順序
  const partOrder = PART_OPTIONS.map(part => part.label)
  const sortedParts = Object.keys(groupedMasters).sort((a, b) => partOrder.indexOf(a) - partOrder.indexOf(b))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <h2 className="font-bold text-lg text-center">種目マスタ設定</h2>

      {/* エラー表示 */}
      {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      {!isFormOpen ? (
        <>
          {/* 種目一覧 */}
          {masters.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              登録されている種目がありません。
              <br />
              新しい種目を追加してください。
            </p>
          ) : (
            <div className="space-y-4">
              {sortedParts.map(part => (
                <div key={part}>
                  <h3 className="font-bold text-md text-slate-700 border-b-2 border-slate-200 pb-1 mb-2">{part}</h3>
                  <ul className="space-y-2">
                    {groupedMasters[part].map(master => (
                      <li key={master.id} className="p-3 bg-slate-50 rounded-lg flex items-center">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{master.name}</p>
                          <p className="text-sm text-slate-500">単位: {master.unit}</p>
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() => handleEdit(master)}
                            className="text-sm text-blue-600 hover:underline transition-colors"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(master.id)}
                            className="text-sm text-red-600 hover:underline transition-colors"
                          >
                            削除
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* 新規種目追加ボタン */}
          <button
            onClick={handleAddNew}
            className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            新規種目を追加
          </button>
        </>
      ) : (
        <MasterForm master={editingMaster} onSave={handleSaveSuccess} onCancel={handleCloseForm} />
      )}
    </div>
  )
}
