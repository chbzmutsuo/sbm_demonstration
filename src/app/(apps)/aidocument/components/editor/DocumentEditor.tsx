'use client'

import {useState, useEffect, forwardRef} from 'react'
import {DndContext, DragEndEvent, DragStartEvent} from '@dnd-kit/core'
import {DocumentWithRelations, PlacedItem} from '../../types'
import ComponentSidebar from './ComponentSidebar'
import PdfViewer from './PdfViewer'

interface DocumentEditorProps {
  document: DocumentWithRelations
  items: PlacedItem[]
  onItemsChange: (items: PlacedItem[]) => void
  onPdfUpload?: (file: File) => void
  isUploading?: boolean
}

const DocumentEditor = forwardRef<HTMLDivElement, DocumentEditorProps>(
  ({document, items, onItemsChange, onPdfUpload, isUploading = false}, ref) => {
    const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null)
    const [mousePosition, setMousePosition] = useState<{x: number; y: number} | null>(null)

    // グローバルなマウス位置を追跡
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({x: e.clientX, y: e.clientY})
      }

      window.addEventListener('mousemove', handleMouseMove)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }, [])

    const handleDragStart = (event: DragStartEvent) => {
      const componentId = event.active.id as string
      setDraggedComponentId(componentId)
    }

    // 固定サイズ（PdfViewerと同じ値）
    const FIXED_WIDTH = 800
    const FIXED_HEIGHT = (FIXED_WIDTH / 210) * 297
    const MAX_HEIGHT = (FIXED_WIDTH / 297) * 210
    const ACTUAL_HEIGHT = Math.max(FIXED_HEIGHT, MAX_HEIGHT)

    const handleDragEnd = (event: DragEndEvent) => {
      const {active, over, delta} = event
      setDraggedComponentId(null)

      if (!over || !ref || typeof ref === 'function' || !ref.current) return

      const pdfRect = ref.current.getBoundingClientRect()

      // 固定サイズを使用（実際のDOMサイズではなく）
      const pdfWidth = FIXED_WIDTH
      const pdfHeight = ACTUAL_HEIGHT

      // 既存のアイテムを移動する場合
      if (active.id.toString().startsWith('placed-item-')) {
        const activeData = active.data.current as {item: PlacedItem; index: number; initialX: number; initialY: number}
        if (activeData && activeData.index !== undefined && over.id === 'pdf-drop-zone') {
          const currentItem = items[activeData.index]
          if (currentItem) {
            // マウス座標を取得（グローバルなマウス位置を優先）
            let mouseX = 0
            let mouseY = 0

            if (mousePosition) {
              // グローバルなマウス位置を使用（最も正確）
              mouseX = mousePosition.x
              mouseY = mousePosition.y
            } else {
              // フォールバック: deltaを使った相対移動
              // 固定サイズを使用
              const currentPxX = (currentItem.x / 210) * pdfWidth
              const currentPxY = (currentItem.y / 297) * pdfHeight
              mouseX = pdfRect.left + currentPxX + delta.x
              mouseY = pdfRect.top + currentPxY + delta.y
            }

            const x = mouseX - pdfRect.left
            const y = mouseY - pdfRect.top

            // PDF座標系に変換（mm単位、A4サイズ: 210mm × 297mm）
            // 固定サイズを使用
            const mmX = (x / pdfWidth) * 210
            const mmY = (y / pdfHeight) * 297

            onItemMove(activeData.index, mmX, mmY)
          }
        }
        return
      }

      // 新しいアイテムを追加する場合
      if (over.id === 'pdf-drop-zone') {
        const componentId = active.id as string

        // マウス座標を取得（グローバルなマウス位置を優先）
        let mouseX = 0
        let mouseY = 0

        if (mousePosition) {
          // グローバルなマウス位置を使用（最も正確）
          mouseX = mousePosition.x
          mouseY = mousePosition.y
        } else if (event.activatorEvent && 'clientX' in event.activatorEvent) {
          // フォールバック: activatorEventから取得（ドラッグ開始時の位置）
          const startX = (event.activatorEvent as MouseEvent).clientX
          const startY = (event.activatorEvent as MouseEvent).clientY
          // deltaを加算して終了位置を計算
          mouseX = startX + delta.x
          mouseY = startY + delta.y
        } else {
          // それでも取得できない場合は、over.rectの中心にdeltaを加算
          const overRect = event.over?.rect
          if (overRect) {
            mouseX = overRect.left + overRect.width / 2 + delta.x
            mouseY = overRect.top + overRect.height / 2 + delta.y
          } else {
            console.warn('Could not get mouse coordinates from drag event')
            return
          }
        }

        const x = mouseX - pdfRect.left
        const y = mouseY - pdfRect.top

        // PDF座標系に変換（mm単位、A4サイズ: 210mm × 297mm）
        // 固定サイズを使用
        const mmX = (x / pdfWidth) * 210
        const mmY = (y / pdfHeight) * 297

        const newItem: PlacedItem = {
          componentId: componentId as string,
          x: mmX,
          y: mmY,
        }

        onItemsChange([...items, newItem])
      }
    }

    const onItemMove = (index: number, mmX: number, mmY: number) => {
      // PdfViewerからmm単位で渡されるのでそのまま使用
      const newItems = [...items]
      newItems[index] = {...newItems[index], x: mmX - 13, y: mmY - 2}
      onItemsChange(newItems)
    }

    const handleItemRemove = (index: number) => {
      onItemsChange(items.filter((_, i) => i !== index))
    }

    return (
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-grow flex min-h-0">
          {/* Left Sidebar */}
          <ComponentSidebar site={document.Site} />

          {/* Center Canvas */}
          <div className="flex-grow bg-gray-200 p-4 overflow-auto">
            <div className="max-w-4xl mx-auto print-target" ref={ref}>
              <PdfViewer
                ref={ref}
                pdfUrl={document.pdfTemplateUrl}
                items={items}
                onItemMove={onItemMove}
                onItemRemove={handleItemRemove}
                onPdfUpload={onPdfUpload}
                isUploading={isUploading}
                site={document.Site}
              />
            </div>
          </div>
        </div>
      </DndContext>
    )
  }
)
export default DocumentEditor
