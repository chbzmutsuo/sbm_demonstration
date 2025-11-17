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

  // ドラッグハンドルサイズ（PlacedItem.tsxの`-left-1 -top-1 w-4 h-4`から）
  const DRAG_HANDLE_SIZE = 4 // px
  const DRAG_HANDLE_OFFSET = -4 // px (left-1 = -4px, top-1 = -4px)

  /**
   * ドラッグハンドルオフセットをmm単位に変換
   * @param offsetPx ピクセル単位のオフセット
   * @param dimension 'x' または 'y'
   * @returns mm単位のオフセット
   */
  const pxToMmOffset = (offsetPx: number, dimension: 'x' | 'y'): number => {
    if (dimension === 'x') {
      return (offsetPx / FIXED_WIDTH) * 210
    } else {
      return (offsetPx / ACTUAL_HEIGHT) * 297
    }
  }

  /**
   * DragEndEventから正確なマウス位置を取得
   * @param event DragEndEvent
   * @param pdfRect PDF要素のgetBoundingClientRect()の結果
   * @returns マウスのclientX, clientY
   */
  const getMousePositionFromEvent = (event: DragEndEvent, pdfRect: DOMRect): {x: number; y: number} | null => {
    const {delta, activatorEvent} = event

    // 方法1: activatorEventから開始位置を取得し、deltaを加算
    if (activatorEvent && 'clientX' in activatorEvent && 'clientY' in activatorEvent) {
      const startX = (activatorEvent as MouseEvent).clientX
      const startY = (activatorEvent as MouseEvent).clientY
      return {
        x: startX + delta.x,
        y: startY + delta.y,
      }
    }

    // 方法2: over.rectとdeltaを使用（フォールバック）
    if (event.over?.rect) {
      const overRect = event.over.rect
      // over.rectの中心を基準にdeltaを加算
      return {
        x: overRect.left + overRect.width / 2 + delta.x,
        y: overRect.top + overRect.height / 2 + delta.y,
      }
    }

    return null
  }

  /**
   * ピクセル座標をmm座標に変換（オフセット考慮）
   * @param pxX ピクセルX座標（PDF要素内の相対座標）
   * @param pxY ピクセルY座標（PDF要素内の相対座標）
   * @returns mm座標 {x, y}
   */
  const convertPxToMm = (pxX: number, pxY: number): {x: number; y: number} => {
    const mmX = (pxX / FIXED_WIDTH) * 210
    const mmY = (pxY / ACTUAL_HEIGHT) * 297
    return {x: mmX, y: mmY}
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over, delta} = event
    setDraggedComponentId(null)

    if (!over || !pdfRef.current) return

    const pdfRect = pdfRef.current.getBoundingClientRect()

    // 既存のアイテムを移動する場合
    if (active.id.toString().startsWith('placed-item-')) {
      const activeData = active.data.current as {item: PlacedItem; index: number; initialX: number; initialY: number}
      if (activeData && activeData.index !== undefined && over.id.toString().startsWith('pdf-drop-zone-page-')) {
        // ページ番号を取得
        const pageIndex = parseInt(over.id.toString().replace('pdf-drop-zone-page-', '')) - 1

        // アイテムの現在位置（ピクセル単位）にdeltaを加算
        // initialXとinitialYは既にピクセル単位で保存されている
        const newPxX = activeData.initialX + delta.x
        const newPxY = activeData.initialY + delta.y

        // mm座標に変換
        const {x: mmX, y: mmY} = convertPxToMm(newPxX, newPxY)

        onItemMove(activeData.index, mmX, mmY, pageIndex)
      }
      return
    }

    // 新しいアイテムを追加する場合
    if (over.id.toString().startsWith('pdf-drop-zone-page-')) {
      const componentId = active.id as string
      // ページ番号を取得（pdf-drop-zone-page-1 → 0）
      const pageIndex = parseInt(over.id.toString().replace('pdf-drop-zone-page-', '')) - 1

      // マウス位置を取得（イベントベースの方法を優先）
      const mousePos = getMousePositionFromEvent(event, pdfRect)
      if (!mousePos) {
        console.warn('Could not get mouse coordinates from drag event')
        return
      }

      // PDF要素内の相対座標を計算
      const relativeX = mousePos.x - pdfRect.left
      const relativeY = mousePos.y - pdfRect.top

      // mm座標に変換
      const {x: mmX, y: mmY} = convertPxToMm(relativeX, relativeY)

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
    // mm単位で渡される座標をそのまま使用（オフセット不要）
    const newItems = [...items]
    const updatedItem = {...newItems[index], x: mmX, y: mmY}
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
