'use client'

import {toast} from 'react-toastify'
import {createSlide, deleteSlide, updateSlide, updateSlideOrder} from '../../../colabo-server-actions'
import {arrayMove} from '@dnd-kit/sortable'
import {createRowsFromTemplate} from '@app/(apps)/edu/Colabo/constants/grid-templates'

export default function useSlideHandlers({
  game,
  slides,
  selectedSlideId,
  setSlides,
  setSelectedSlideId,
  router,
}: {
  game: any
  slides: any[]
  selectedSlideId: number | null
  setSlides: (slides: any[]) => void
  setSelectedSlideId: (selectedSlideId: number | null) => void
  router: any
}) {
  // スライド追加
  const selectedSlide = slides.find((s: any) => s.id === selectedSlideId) || null
  const handleAddSlide = async (templateType: string, gridTemplateId?: string) => {
    try {
      const sortOrder = selectedSlide ? selectedSlide.sortOrder + 1 : slides.length

      // グリッドテンプレートが指定されている場合はそれを使用、そうでなければデフォルト
      const rows =
        templateType === 'normal' && gridTemplateId
          ? createRowsFromTemplate(gridTemplateId)
          : templateType === 'normal'
            ? [
                {
                  id: `row_${Date.now()}`,
                  columns: 1,
                  blocks: [],
                },
              ]
            : undefined

      // デバッグ: 生成されたrowsを確認
      if (rows && gridTemplateId) {
        console.log('[handleAddSlide] グリッドテンプレート適用:', gridTemplateId)
        console.log('[handleAddSlide] 生成されたrows:', JSON.stringify(rows, null, 2))
      }

      const result = await createSlide({
        gameId: game.id,
        templateType,
        contentData: {
          title: '',
          ...(rows ? {rows} : {blocks: []}),
        },
        sortOrder,
      })

      // デバッグ: サーバーから返されたスライドデータを確認
      if (result.success && result.slide) {
        console.log('[handleAddSlide] サーバーから返されたslide.contentData:', JSON.stringify(result.slide.contentData, null, 2))
      }

      if (result.success && result.slide) {
        toast.success('スライドを追加しました')

        // 新しいスライドを配列に挿入
        const newSlides = [...slides]
        newSlides.splice(sortOrder, 0, result.slide)

        // sortOrderを再計算
        newSlides.forEach((slide: any, index) => {
          slide.sortOrder = index
        })

        setSlides(newSlides)
        setSelectedSlideId(result.slide.id)
        // router.refresh()
      } else {
        toast.error(result.error || 'スライド追加に失敗しました')
      }
    } catch (error) {
      console.error('スライド追加エラー:', error)
      toast.error('予期しないエラーが発生しました')
    }
  }

  // スライド更新
  const handleUpdateSlide = async (slideId: number, updates: any) => {
    try {
      const result = await updateSlide(slideId, updates)

      if (result.success && result.slide) {
        // ローカル状態を更新
        setSlides(slides.map((s: any) => (s.id === slideId ? {...s, ...result.slide} : s)))
      } else {
        toast.error(result.error || 'スライド更新に失敗しました')
      }
    } catch (error) {
      console.error('スライド更新エラー:', error)
      toast.error('予期しないエラーが発生しました')
    }
  }

  // スライド削除
  const handleDeleteSlide = async (slideId: number) => {
    try {
      const result = await deleteSlide(slideId)

      if (result.success) {
        toast.success('スライドを削除しました')
        const newSlides = slides.filter((s: any) => s.id !== slideId)
        setSlides(newSlides)

        const currentSlideIndex = slides.findIndex((s: any) => s.id === slideId)
        const previousSlideId = newSlides[currentSlideIndex - 1]?.id
        setSelectedSlideId(previousSlideId)
      } else {
        toast.error(result.error || 'スライド削除に失敗しました')
      }
    } catch (error) {
      console.error('スライド削除エラー:', error)
      toast.error('予期しないエラーが発生しました')
    }
  }

  // スライド並び替え
  const handleReorderSlides = async (oldIndex: number, newIndex: number) => {
    const newSlides = arrayMove(slides, oldIndex, newIndex)

    // sortOrderを更新
    newSlides.forEach((slide: any, index) => {
      slide.sortOrder = index
    })

    setSlides(newSlides)

    try {
      const result = await updateSlideOrder(newSlides.map((s: any) => s.id))
      if (result.success) {
        toast.success('スライドの順序を更新しました')
      } else {
        toast.error('順序の更新に失敗しました')
        setSlides(slides) // 元に戻す
      }
    } catch (error) {
      console.error('順序更新エラー:', error)
      toast.error('予期しないエラーが発生しました')
      setSlides(slides) // 元に戻す
    }
  }
  return {
    handleAddSlide,
    handleUpdateSlide,
    handleDeleteSlide,
    handleReorderSlides,
  }
}
