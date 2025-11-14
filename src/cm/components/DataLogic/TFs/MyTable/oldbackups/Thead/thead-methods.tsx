import {C_Stack, Center} from '@cm/components/styles/common-components/common-components'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import React, {useMemo} from 'react'
import {colType} from '@cm/types/col-types'
import {cn} from '@shadcn/lib/utils'

// 型定義を追加
interface KadoProps {
  rowSpan?: number
  colSpan?: number
  style?: React.CSSProperties
  children: React.ReactNode
}

interface ThDisplayJSXProps {
  col: colType
  width?: number
}

export const Kado = React.memo<KadoProps>(({rowSpan, colSpan, style, children}) => {
  return (
    <th rowSpan={rowSpan} colSpan={colSpan} className="sticky left-0" style={style}>
      {children}
    </th>
  )
})

Kado.displayName = 'Kado'

export const ThDisplayJSX = React.memo<ThDisplayJSXProps>(({col}) => {
  // ✅ 条件分岐のある計算なのでメモ化有効
  const displayValue = useMemo(() => (col?.th?.format ? col?.th?.format(col) : col?.label), [col?.th?.format, col?.label, col])

  const className = cn(!col?.th?.divider && 'h-fit')

  // ✅ 条件分岐のあるJSX要素なのでメモ化有効
  const displayElement = useMemo(() => {
    if (typeof displayValue === 'string') {
      return <MarkDownDisplay className={className}>{displayValue}</MarkDownDisplay>
    } else {
      return <div className={className}>{displayValue}</div>
    }
  }, [displayValue, className])

  return (
    <Center>
      <C_Stack className="items-center text-center">{displayElement}</C_Stack>
    </Center>
  )
})

ThDisplayJSX.displayName = 'ThDisplayJSX'
