import {useState, useMemo} from 'react'
import {ExerciseMaster} from '../types/training'
import {
  getExerciseMasters,
  createExerciseMaster,
  updateExerciseMaster,
  deleteExerciseMaster,
} from '../server-actions/exercise-master'
import {PART_OPTIONS} from '@app/(excluded)/training/(constants)/PART_OPTIONS'

interface UseExerciseMastersProps {
  userId: number
}

export function useExerciseMasters({userId}: UseExerciseMastersProps) {
  // 種目マスタ一覧
  const [masters, setMasters] = useState<ExerciseMaster[]>([])

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

  // 種目マスタを作成
  const addMaster = async (data: any) => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await createExerciseMaster(userId, data)
      if (result.result) {
        setMasters(prev => [...prev, result.result])
      }
      return result.result
    } catch (err) {
      setError('種目の作成に失敗しました')
      console.error('種目作成エラー:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // 種目マスタを更新
  const editMaster = async (id: number, data: any) => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await updateExerciseMaster(userId, id, data)
      if (result.result) {
        setMasters(prev => prev.map(master => (master.id === id ? result.result : master)))
      }
      return result.result
    } catch (err) {
      setError('種目の更新に失敗しました')
      console.error('種目更新エラー:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // 種目マスタを削除
  const removeMaster = async (id: number) => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      await deleteExerciseMaster(userId, id)
      setMasters(prev => prev.filter(master => master.id !== id))
    } catch (err) {
      setError('種目の削除に失敗しました')
      console.error('種目削除エラー:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // 部位別にグループ化された種目マスタ
  const groupedMasters = useMemo(() => {
    return masters.reduce(
      (acc, master) => {
        const part = master.part
        if (!acc[part]) acc[part] = []
        acc[part].push(master)
        return acc
      },
      {} as Record<string, ExerciseMaster[]>
    )
  }, [masters])

  // 部位の表示順序
  const partOrder = PART_OPTIONS.map(part => part.label)
  const sortedParts = useMemo(() => {
    return Object.keys(groupedMasters).sort((a, b) => partOrder.indexOf(a) - partOrder.indexOf(b))
  }, [groupedMasters])

  // 種目名で検索
  const searchMasters = (searchTerm: string, part?: string) => {
    let results = masters

    if (part) {
      results = results.filter(master => master.part === part)
    }

    if (searchTerm) {
      results = results.filter(master => master.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    return results
  }

  // 特定の部位の種目を取得
  const getMastersByPart = (part: string) => {
    return masters.filter(master => master.part === part)
  }

  // 種目名の重複チェック
  const isNameDuplicate = (name: string, excludeId?: number) => {
    return masters.some(master => master.name.toLowerCase() === name.toLowerCase() && master.id !== excludeId)
  }

  return {
    // 状態
    masters,
    groupedMasters,
    sortedParts,
    isLoading,
    error,

    // アクション
    fetchMasters,
    addMaster,
    editMaster,
    removeMaster,

    // ユーティリティ
    searchMasters,
    getMastersByPart,
    isNameDuplicate,
  }
}
