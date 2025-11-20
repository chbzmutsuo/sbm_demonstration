import type {SlideRow, SlideBlock} from '../types/game-types'

export interface GridTemplate {
  id: string
  name: string
  icon: string
  rows: Array<{columns: number}>
}

/**
 * グリッドレイアウトテンプレート定義
 * 各テンプレートは行ごとの列数を定義する
 */
export const GRID_TEMPLATES: GridTemplate[] = [
  {
    id: 'grid-1-2',
    name: '1列→2列',
    icon: '📐',
    rows: [
      {columns: 1}, // 1行目：1列
      {columns: 2}, // 2行目：2列
    ],
  },
  {
    id: 'grid-1-3',
    name: '1列→3列',
    icon: '📊',
    rows: [
      {columns: 1}, // 1行目：1列
      {columns: 3}, // 2行目：3列
    ],
  },

  {
    id: 'grid-2-1',
    name: '2列→1列',
    icon: '📋',
    rows: [
      {columns: 2}, // 1行目：2列
      {columns: 1}, // 2行目：1列
    ],
  },
  {
    id: 'grid-3-1',
    name: '3列→1列',
    icon: '📑',
    rows: [
      {columns: 3}, // 1行目：3列
      {columns: 1}, // 2行目：1列
    ],
  },
]

/**
 * グリッドテンプレートIDからSlideRow配列を生成する
 */
export function createRowsFromTemplate(templateId: string): SlideRow[] {
  const template = GRID_TEMPLATES.find(t => t.id === templateId)
  if (!template) {
    // デフォルト：1行1列、テキストブロック1つ
    const baseTimestamp = Date.now()
    return [
      {
        id: `row_${baseTimestamp}_${Math.random().toString(36).substr(2, 9)}`,
        columns: 1,
        blocks: [
          {
            id: `block_${baseTimestamp}_0_${Math.random().toString(36).substr(2, 9)}`,
            blockType: 'text' as const,
            content: '',
            sortOrder: 0,
          },
        ],
      },
    ]
  }

  const baseTimestamp = Date.now()
  const result = template.rows.map((row, rowIndex) => {
    // 列の数に応じてテキストブロックを自動生成
    const blocks: SlideBlock[] = Array.from({length: row.columns}, (_, blockIndex) => ({
      id: `block_${baseTimestamp}_${rowIndex}_${blockIndex}_${Math.random().toString(36).substr(2, 9)}`,
      blockType: 'text' as const,
      content: '',
      sortOrder: blockIndex,
    }))

    const slideRow: SlideRow = {
      id: `row_${baseTimestamp}_${rowIndex}_${Math.random().toString(36).substr(2, 9)}`,
      columns: row.columns,
      blocks,
    }
    // デバッグ: 各rowのcolumnsとblocksを確認
    console.log(`[createRowsFromTemplate] Row ${rowIndex}: columns=${slideRow.columns}, blocks=${blocks.length}`)
    return slideRow
  })

  // デバッグ: 生成されたrows全体を確認
  console.log(`[createRowsFromTemplate] Template ${templateId} から生成されたrows:`, JSON.stringify(result, null, 2))

  return result
}
