'use client'

import {useEffect, useRef} from 'react'
import SlidePreviewCard from './SlidePreviewCard'

interface CenterPreviewProps {
  slides: any[]
  selectedSlideId: number | null
  onSelectSlide: (slideId: number) => void
  handleDeleteSlide: (slideId: number) => void
}

export default function CenterPreview({slides, selectedSlideId, onSelectSlide, handleDeleteSlide}: CenterPreviewProps) {
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

  return (
    <div ref={containerRef} className="flex-1 bg-gray-100 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {slides.length > 0 ? (
          <div className="space-y-8">
            {slides.map((slide, index) => (
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
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg">スライドがありません</p>
              <p className="text-sm mt-2">右側のパネルからスライドを追加してください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
