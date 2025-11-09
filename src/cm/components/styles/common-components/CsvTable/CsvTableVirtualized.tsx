'use client'

import React, {useCallback, useMemo} from 'react'
import {TableVirtuoso} from 'react-virtuoso'
import {CsvTableProps, separateHeaderAndBody, VirtualizedOptions} from './CsvTable'
import {Counter} from '@cm/components/styles/common-components/Table'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import {cl} from '@cm/lib/methods/common'
import {twMerge} from 'tailwind-merge'

import {Downloader} from './components/CsvDownloader'
import {cn} from '@shadcn/lib/utils'
import {htmlProps} from '@cm/types/utility-types'

export type CsvTableVirtualizedProps = CsvTableProps & {
  virtualized?: VirtualizedOptions
}

/**
 * TableVirtuosoを使用した仮想化対応のCsvTable
 * 大量データ（1000件以上）のレンダリングパフォーマンスを向上
 *
 * 特徴：
 * - 動的な行の高さに自動対応
 * - コンポーネントセル完全対応
 * - 固定ヘッダー
 * - スムーズなスクロール
 * - CSV出力機能完全対応
 */
export const CsvTableVirtualized = (props: CsvTableVirtualizedProps) => {
  const {records, stylesInColumns, virtualized = {enabled: true, overscan: 5}, csvOutput} = props
  const {headerRecords, bodyRecords} = separateHeaderAndBody(records)

  // 固定ヘッダーコンテンツ
  const fixedHeaderContent = useCallback(() => {
    if (!headerRecords || headerRecords.length === 0) {
      return null
    }

    return headerRecords.map((row, rowIdx) => {
      const {csvTableRow, ...restPropsOnTr} = row

      return (
        <tr key={rowIdx} {...restPropsOnTr} className={twMerge(restPropsOnTr?.className)}>
          {csvTableRow.map((cell, celIdx) => {
            const stylesInThisColumn = stylesInColumns?.[celIdx]
            const {cellValue, style, thStyle, className, ...restPropsOnTd} = cell ?? {}

            const isNumber = typeof cellValue === 'number'
            const isString = typeof cellValue === 'string'

            if (cell?.colSpan === 0) {
              return null
            }

            return (
              <th
                key={celIdx}
                {...restPropsOnTd}
                style={{...stylesInThisColumn?.style, ...style, ...thStyle}}
                className={cl(
                  'text-center! bg-gray-100 font-bold border border-gray-300 px-2 py-1',
                  stylesInThisColumn?.className,
                  className
                )}
              >
                {isNumber ? (
                  <Counter>{cellValue}</Counter>
                ) : isString ? (
                  <MarkDownDisplay>{cellValue}</MarkDownDisplay>
                ) : (
                  cellValue
                )}
              </th>
            )
          })}
        </tr>
      )
    })
  }, [headerRecords, stylesInColumns])

  // 各行のコンテンツをレンダリング（<td>要素のみ返す）
  const itemContent = useMemo(() => {
    return (index: number, record: (typeof bodyRecords)[0]) => {
      if (!record || !record.csvTableRow) {
        return null
      }

      const {csvTableRow} = record

      return csvTableRow.map((cell, celIdx) => {
        const stylesInThisColumn = stylesInColumns?.[celIdx]
        const {cellValue, className, cellValueRaw, thStyle, ...restPropsOnTd} = cell ?? {}

        if (cell?.colSpan === 0) return null

        const isNumber = typeof cellValue === 'number'
        let style = {...stylesInThisColumn?.style}
        if (isNumber) {
          style.textAlign = 'right'
        }
        style = {...style, ...cell.style}

        return (
          <td
            key={celIdx}
            {...restPropsOnTd}
            style={style}
            className={cl('border border-gray-300 px-2 py-1 align-top', className, stylesInThisColumn?.className)}
          >
            {isNumber ? <Counter>{cellValue}</Counter> : cellValue}
          </td>
        )
      })
    }
  }, [stylesInColumns])

  // Virtuosoのコンポーネント設定
  const components = useMemo(
    () => ({
      Table: React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>((props, ref) => (
        <table
          {...props}
          ref={ref}
          className={twMerge('w-full', props.className)}
          style={{borderCollapse: 'separate', borderSpacing: 0, ...props.style}}
        />
      )),

      TableHead: React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>((props, ref) => (
        <thead {...props} ref={ref} className={twMerge('sticky top-0 z-30', props.className)} />
      )),

      TableBody: React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>((props, ref) => (
        <tbody {...props} ref={ref} />
      )),

      TableRow: React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>((props, ref) => (
        <tr {...props} ref={ref} className={twMerge('hover:bg-gray-50', props.className)} />
      )),
    }),
    []
  )

  const WithWrapper = (wrapperProps: htmlProps & {size?: 'sm' | 'base' | 'lg' | 'xl'}) => {
    if (!bodyRecords || bodyRecords.length === 0) {
      return <div className="p-4 text-center text-gray-500">データがありません</div>
    }

    const {className, ...otherWrapperProps} = wrapperProps
    return (
      <div {...otherWrapperProps}>
        <TableVirtuoso
          className={cn('max-h-[80vh] max-w-[95vw] mx-auto overflow-auto rounded-md border border-gray-300', className)}
          style={{height: '100vh', overflow: 'auto'}}
          data={bodyRecords}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={itemContent}
          components={components}
          overscan={virtualized?.overscan || 5}
        />
      </div>
    )
  }

  return {
    WithWrapper,
    Downloader: () => <Downloader records={records} csvOutput={csvOutput} />,
  }
}

/**
 * 統合されたCsvTableコンポーネント
 * データ量に応じて最適なレンダリング方式を自動選択
 *
 * データ量による自動選択ルール：
 * - ~50件: CsvTable (Server Component) - 高速・SEO対応
 * - 50~100件: CsvTableChunked (Client Component) - 段階的レンダリング
 * - 100件以上: CsvTableVirtualized (Client Component) - 仮想化で最高性能
 */
// export const CsvTableAuto = (props: CsvTableProps) => {
//   const dataCount = props.records?.length || 0

//   // 手動で仮想化が有効な場合
//   if (props.virtualized?.enabled) {
//     return CsvTableVirtualized(props as CsvTableVirtualizedProps)
//   }

//   // 手動でチャンク処理が有効な場合
//   if (props.chunked?.enabled) {
//     // 動的インポートを使用してClient Componentを読み込み
//     const {CsvTableChunked} = require('./CsvTableChunked')
//     return CsvTableChunked(props)
//   }

//   // 🔥 データ量に応じた自動選択
//   if (dataCount >= 100) {
//     // 100件以上: 仮想化で最高のパフォーマンス
//     return CsvTableVirtualized({
//       ...props,
//       virtualized: {
//         enabled: true,
//         height: '75vh',
//         overscan: 5,
//       },
//     })
//   } else if (dataCount >= 50) {
//     // 50-100件: チャンク処理で段階的レンダリング
//     const {CsvTableChunked} = require('./CsvTableChunked')
//     return CsvTableChunked({
//       ...props,
//       chunked: {
//         enabled: true,
//         chunkSize: 20,
//         delay: 32,
//         showProgress: false,
//         showControls: false,
//       },
//     })
//   } else {
//     // 50件未満: 通常のServer Component
//     const {CsvTable} = require('./CsvTable')
//     return CsvTable(props)
//   }
// }
