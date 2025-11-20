'use client'

import {useEffect, useRef} from 'react'
import SlidePreviewCard from './SlidePreviewCard'
import EditableNormalSlide from './EditableNormalSlide'

interface CenterPreviewProps {
  slides: any[]
  selectedSlideId: number | null
  onSelectSlide: (slideId: number) => void
  handleDeleteSlide: (slideId: number) => void
  handleUpdateSlide?: (slideId: number, updates: any) => void
}

export default function CenterPreview({
  slides,
  selectedSlideId,
  onSelectSlide,
  handleDeleteSlide,
  handleUpdateSlide,
}: CenterPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // 選択されたスライドへスクロール
  useEffect(() => {
    if (selectedSlideId && slideRefs.current.has(selectedSlideId)) {
      const slideElement = slideRefs.current.get(selectedSlideId)
      if (slideElement && containerRef.current) {
        slideElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }, [selectedSlideId])

  // const selectedSlide = slides.find(s => s.id === selectedSlideId) || null

  return (
    <div ref={containerRef} className="bg-white overflow-y-auto">
      <div className="w-4xl mx-auto py-8 px-4">
        {slides.length > 0 ? (
          <div className="space-y-8">
            {slides.map((slide, index) => {
              // ノーマルスライドで選択中の場合、編集可能な表示を使用
              if (slide.id === selectedSlideId && slide.templateType === 'normal' && handleUpdateSlide) {
                return (
                  <div
                    key={slide.id}
                    ref={el => {
                      if (el) {
                        slideRefs.current.set(slide.id, el)
                      }
                    }}
                  >
                    <EditableNormalSlide
                      slide={slide}
                      index={index}
                      onUpdateSlide={handleUpdateSlide}
                      onSelect={() => onSelectSlide(slide.id)}
                    />
                  </div>
                )
              }

              // その他のスライドは通常のプレビューカードを使用
              return (
                <div
                  key={slide.id}
                  ref={el => {
                    if (el) {
                      slideRefs.current.set(slide.id, el)
                    }
                  }}
                >
                  <SlidePreviewCard
                    slide={slide}
                    index={index}
                    isSelected={slide.id === selectedSlideId}
                    onSelect={() => onSelectSlide(slide.id)}
                    handleDeleteSlide={handleDeleteSlide}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg">スライドがありません</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
