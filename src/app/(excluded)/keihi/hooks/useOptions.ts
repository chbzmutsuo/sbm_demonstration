'use client'

import {useState, useEffect} from 'react'
import {getOptionsByCategory, type OptionMaster} from '../actions/master-actions'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import useSWR from 'swr'

export function useOptions(category: string) {
  const [options, setOptions] = useState<OptionMaster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getOptionsByCategory(category)
        if (result.success && result.data) {
          setOptions(result.data)
        } else {
          setError(result.error || '選択肢の取得に失敗しました')
        }
      } catch (err) {
        setError('選択肢の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOptions()
  }, [category])

  // 再取得関数
  const refetch = async () => {
    const result = await getOptionsByCategory(category)
    if (result.success && result.data) {
      setOptions(result.data)
    }
  }

  return {
    options,
    isLoading,
    error,
    refetch,
  }
}

// 複数カテゴリを一度に取得するフック
export function useAllOptions() {
  const {data, isLoading, error} = useSWR('allOptions', async () => {
    const {result} = await doStandardPrisma('keihiOptionMaster', 'findMany', {
      where: {},
    })

    return {
      subjects: result?.filter(option => option.category === 'subjects') || [],
      industries: result?.filter(option => option.category === 'industries') || [],
      purposes: result?.filter(option => option.category === 'purposes') || [],
    }
  })

  return {
    allOptions: data || {subjects: [], industries: [], purposes: []},
    isLoading,
    error,
  }
}
