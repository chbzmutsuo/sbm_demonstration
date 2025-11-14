import {COLORS} from 'src/cm/lib/constants/constants'

import {CSS} from '@dnd-kit/utilities'
import {useSortable} from '@dnd-kit/sortable'
import {cn} from '@shadcn/lib/utils'

export const createRowColor = ({myTable, recIdx, record, rows}) => {
  const allColumns = rows.flat()
  const {oddNumberRow, evenNumberRow} = COLORS.table
  let rowColor = myTable?.stripedTableRow !== false ? (recIdx % 2 === 0 ? COLORS.table.evenNumberRow : oddNumberRow) : ''
  // 1行当たりの処理

  const designatedRowColor = allColumns
    .map(col => {
      const getRowColor = col?.td?.getRowColor
      if (getRowColor) {
        return getRowColor(record[col.id], record)
      }

      return ''
    })
    .find(val => val)

  rowColor = designatedRowColor ?? rowColor ?? '#ffffff'

  return rowColor
}

// roundedTrClassをTailwind CSSのクラスとして定義
const roundedTrClass = [
  // テーブル行全体のスタイル
  'shadow-md border  rounded-[10px]',
  // th, tdの共通: 上ボーダー
  '[&>th]:border-t [&>td]:border-t',
  // 先頭セル: 左丸み・左ボーダー
  '[&>td:first-child]:rounded-l-[8px] [&>td:first-child]:border-l [&>th:first-child]:rounded-l-[8px] [&>th:first-child]:border-l',
  // 最後セル: 右丸み・右ボーダー
  '[&>td:last-child]:rounded-r-[8px] [&>td:last-child]:border-r [&>th:last-child]:rounded-r-[8px] [&>th:last-child]:border-r',
].join(' ')

export const createTrClassName = ({myTable, record, formData}) =>
  cn(
    //
    `relative `,
    formData?.id === record?.id ? 'bg-sub-light' : '',
    myTable?.showHeader ? '' : roundedTrClass,
    'odd:bg-gray-100 even:bg-gray-200'
  )

export const getDndProps = ({dndId, rowColor, myTable}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
    id: dndId,
  })
  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isDragging ? '#fef788' : rowColor,
  }

  const allowDnd = myTable?.['drag']
  const dndProps = allowDnd ? {ref: setNodeRef, ...attributes, ...listeners, style: dndStyle} : undefined
  return {dndProps, dndStyle}
}
