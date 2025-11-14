'use client'

import {useRef, useState, useEffect} from 'react'
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
  selectedIndex?: number | null
  onSelectedIndexChange?: (index: number | null) => void
}

export default function DocumentEditor({
  document,
  items,
  onItemsChange,
  onPdfUpload,
  isUploading = false,
  selectedIndex: externalSelectedIndex,
  onSelectedIndexChange,
}: DocumentEditorProps) {
  const pdfRef = useRef<HTMLDivElement>(null)
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{x: number; y: number} | null>(null)
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // 外部から選択状態を制御できるようにする
  const selectedIndex = externalSelectedIndex !== undefined ? externalSelectedIndex : internalSelectedIndex
  const setSelectedIndex = onSelectedIndexChange || setInternalSelectedIndex

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

  // キーボードイベントで選択中のアイテムを微調整
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合は無視
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (selectedIndex === null || selectedIndex < 0 || selectedIndex >= items.length) {
        return
      }

      const step = e.shiftKey ? 1 : 0.5 // Shiftキーを押している場合は1mm、そうでなければ0.5mm
      const currentItem = items[selectedIndex]
      let newX = currentItem.x
      let newY = currentItem.y

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          newY = currentItem.y - step
          break
        case 'ArrowDown':
          e.preventDefault()
          newY = currentItem.y + step
          break
        case 'ArrowLeft':
          e.preventDefault()
          newX = currentItem.x - step
          break
        case 'ArrowRight':
          e.preventDefault()
          newX = currentItem.x + step
          break
        case '+':
        case '=':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            const currentFontSize = currentItem.fontSize || 10.5
            const newFontSize = Math.min(currentFontSize + 0.5, 72) // 最大72ポイント
            const newItems = [...items]
            newItems[selectedIndex] = {...currentItem, fontSize: newFontSize}
            onItemsChange(newItems)
          }
          return
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            const currentFontSize = currentItem.fontSize || 10.5
            const newFontSize = Math.max(currentFontSize - 0.5, 4) // 最小4ポイント
            const newItems = [...items]
            newItems[selectedIndex] = {...currentItem, fontSize: newFontSize}
            onItemsChange(newItems)
          }
          return
        default:
          return
      }

      // 位置を更新
      const newItems = [...items]
      newItems[selectedIndex] = {...currentItem, x: newX, y: newY}
      onItemsChange(newItems)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedIndex, items, onItemsChange])

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

    if (!over || !pdfRef.current) return

    const pdfRect = pdfRef.current.getBoundingClientRect()

    // 固定サイズを使用（実際のDOMサイズではなく）
    const pdfWidth = FIXED_WIDTH
    const pdfHeight = ACTUAL_HEIGHT

    // 既存のアイテムを移動する場合
    if (active.id.toString().startsWith('placed-item-')) {
      const activeData = active.data.current as {item: PlacedItem; index: number; initialX: number; initialY: number}
      if (activeData && activeData.index !== undefined && over.id.toString().startsWith('pdf-drop-zone-page-')) {
        // ページ番号を取得
        const pageIndex = parseInt(over.id.toString().replace('pdf-drop-zone-page-', '')) - 1
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

          onItemMove(activeData.index, mmX, mmY, pageIndex)
        }
      }
      return
    }

    // 新しいアイテムを追加する場合
    if (over.id.toString().startsWith('pdf-drop-zone-page-')) {
      const componentId = active.id as string
      // ページ番号を取得（pdf-drop-zone-page-1 → 0）
      const pageIndex = parseInt(over.id.toString().replace('pdf-drop-zone-page-', '')) - 1

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
        pageIndex: pageIndex,
      }

      onItemsChange([...items, newItem])
    }
  }

  const onItemMove = (index: number, mmX: number, mmY: number, pageIndex?: number) => {
    // PdfViewerからmm単位で渡されるのでそのまま使用
    const newItems = [...items]
    const updatedItem = {...newItems[index], x: mmX - 13, y: mmY}
    if (pageIndex !== undefined) {
      updatedItem.pageIndex = pageIndex
    }
    newItems[index] = updatedItem
    onItemsChange(newItems)
  }

  const handleItemRemove = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index))
    if (selectedIndex === index) {
      setSelectedIndex(null)
    } else if (selectedIndex !== null && selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  const handleItemSelect = (index: number) => {
    setSelectedIndex(index)
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    // PDFエリアをクリックした場合、選択を解除
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'pdf-drop-zone') {
      setSelectedIndex(null)
    }
  }

  const handleFontSizeChange = (newFontSize: number) => {
    if (selectedIndex === null || selectedIndex < 0 || selectedIndex >= items.length) {
      return
    }
    const newItems = [...items]
    newItems[selectedIndex] = {...newItems[selectedIndex], fontSize: newFontSize}
    onItemsChange(newItems)
  }

  const selectedItem = selectedIndex !== null && selectedIndex >= 0 && selectedIndex < items.length ? items[selectedIndex] : null

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex-grow flex min-h-0">
        {/* Left Sidebar */}
        <ComponentSidebar site={document.Site} />

        {/* Center Canvas */}
        <div className="flex-grow bg-gray-200 p-4 overflow-auto" onClick={handleCanvasClick}>
          <div className="max-w-4xl mx-auto">
            <PdfViewer
              ref={pdfRef}
              pdfUrl={document.pdfTemplateUrl}
              items={items}
              onItemMove={onItemMove}
              onItemRemove={handleItemRemove}
              onItemSelect={handleItemSelect}
              selectedIndex={selectedIndex}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onPdfUpload={onPdfUpload}
              isUploading={isUploading}
              site={document.Site}
            />
          </div>
        </div>

        {/* Right Sidebar - 選択中のアイテムのプロパティ編集 */}
        {selectedItem && (
          <aside className="w-64 bg-white border-l border-gray-300 flex flex-col">
            <div className="p-3 border-b">
              <h3 className="text-sm font-semibold text-gray-700">アイテムのプロパティ</h3>
            </div>
            <div className="flex-grow overflow-y-auto p-3 space-y-4">
              {/* フォントサイズ */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">フォントサイズ（ポイント）</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="4"
                    max="72"
                    step="0.5"
                    value={selectedItem.fontSize || 10.5}
                    onChange={e => {
                      const value = parseFloat(e.target.value)
                      if (!isNaN(value) && value >= 4 && value <= 72) {
                        handleFontSizeChange(value)
                      }
                    }}
                    className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const current = selectedItem.fontSize || 10.5
                        handleFontSizeChange(Math.min(current + 0.5, 72))
                      }}
                      className="w-8 h-4 text-xs border border-gray-300 rounded hover:bg-gray-100"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = selectedItem.fontSize || 10.5
                        handleFontSizeChange(Math.max(current - 0.5, 4))
                      }}
                      className="w-8 h-4 text-xs border border-gray-300 rounded hover:bg-gray-100"
                    >
                      −
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Ctrl/Cmd + +/- でも変更可能</p>
              </div>

              {/* 位置情報（読み取り専用） */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">位置</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <span className="text-xs text-gray-500">X座標</span>
                    <div className="text-sm font-mono">{selectedItem.x.toFixed(2)} mm</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Y座標</span>
                    <div className="text-sm font-mono">{selectedItem.y.toFixed(2)} mm</div>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">ページ</span>
                  <div className="text-sm font-mono">
                    {(selectedItem.pageIndex || 0) + 1} / {currentPage}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">矢印キーで微調整可能</p>
              </div>

              {/* コンポーネントID */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">コンポーネントID</label>
                <div className="text-xs font-mono bg-gray-50 p-2 rounded border border-gray-200 break-all">
                  {selectedItem.componentId}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </DndContext>
  )
}
