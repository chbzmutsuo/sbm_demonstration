'use client'

import {colType} from '@cm/types/col-types'

export const setAttribute = (props: {
  cols: colType[]
  attributeSetter: (props: {col: colType}) => colType
  targets?: {
    mode: 'include' | 'exclude'
    ids: string[]
  }
}) => {
  const {cols, attributeSetter, targets} = props

  const {mode = 'include', ids} = targets ?? {}
  const result = [...cols].map(col => {
    const originCol = cols.find(d => d.id === col.id)

    const isTarget = targets === undefined ? true : mode === 'include' ? ids?.includes(col.id) : ids?.includes(col.id) === false

    if (isTarget) {
      const newCol = {...col, ...attributeSetter({col})}
      return newCol
    } else {
      return col
    }
  })

  return result
}
