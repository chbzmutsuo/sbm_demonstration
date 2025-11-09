'use client'

import {colType} from '@cm/types/col-types'

export const addColIndexs = (rowsInCols: any[]) => {
  const result: colType[] = []
  rowsInCols.forEach((rowsInCol, colIdx) => {
    rowsInCol = rowsInCol.forEach((col: colType) => {
      if (col?.form) {
        col.form.colIndex = colIdx
      }

      result.push(col)
    })
  })
  return result as colType[]
}
