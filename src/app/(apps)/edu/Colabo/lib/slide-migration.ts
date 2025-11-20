/**
 * スライドデータのマイグレーション関数
 * 既存のblocks構造をrows構造に変換
 */

import type {SlideContentData, SlideRow, SlideBlock} from '../types/game-types'

/**
 * 既存のblocks配列をrows構造に変換
 * 既存データは1行・1列として扱う
 */
export const migrateBlocksToRows = (contentData: any): SlideContentData => {
  // 既にrowsが存在する場合は、columnsが欠落している行を修正して返す
  if (contentData.rows && Array.isArray(contentData.rows)) {
    // columnsが欠落している行があれば、デフォルト値1を設定
    const normalizedRows = contentData.rows.map((row: any) => ({
      ...row,
      columns: row.columns !== undefined ? row.columns : 1,
    }))
    return {
      ...contentData,
      rows: normalizedRows,
    }
  }

  // blocksが存在しない場合は空のrowsを返す
  if (!contentData.blocks || !Array.isArray(contentData.blocks) || contentData.blocks.length === 0) {
    return {
      ...contentData,
      rows: [],
    }
  }

  // blocksを1行にまとめる（各ブロックを1列として配置）
  const rows: SlideRow[] = [
    {
      id: `row_${Date.now()}`,
      columns: 1,
      blocks: contentData.blocks.map((block: SlideBlock, index: number) => ({
        ...block,
        sortOrder: index,
      })),
    },
  ]

  return {
    ...contentData,
    rows,
  }
}

/**
 * スライドコンテンツデータを正規化（rows構造を確保）
 */
export function normalizeSlideContentData(contentData: any): SlideContentData {
  return migrateBlocksToRows(contentData)
}
