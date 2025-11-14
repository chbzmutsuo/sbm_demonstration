'use client'
import {dataFormatterType} from '@cm/types/types'
import {colType, colTypeOptional} from '@cm/types/col-types'
import {C_Stack, R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {cl} from 'src/cm/lib/methods/common'
import React, {Fragment} from 'react'

import TdContent from '@cm/components/DataLogic/TFs/MyTable/components/MainTable/TdContent/TdContent'
import {Fields} from 'src/cm/class/Fields/Fields'
import {converDataForClient} from 'src/cm/class/Fields/lib/methods'
import {defaultFormat} from 'src/cm/class/Fields/lib/defaultFormat'
import {CssString} from 'src/cm/components/styles/cssString'
import {twMerge} from 'tailwind-merge'
import {getColMinWidth} from '@cm/class/Fields/lib/transposeColumns'
import {cn} from '@shadcn/lib/utils'
const {table, border} = CssString
const defaultStyle = {
  width: '100%',
  textAlign: 'start',
} as const

const ensureColType = (col: any): colType => {
  if (!col || typeof col !== 'object') {
    return {} as colType
  }
  return col as colType
}
const defaultClassName = twMerge(border.dottedBottom, table.getCellHeight())

const MemoizedTdContent = React.memo(TdContent)
export type aggregateOnSingleTdProps = {
  mainTd?: {
    id: string
    C_StackClassName?: string
    entireCellFormat?: dataFormatterType
    th?: {
      stack?: any
    }
  } & colTypeOptional

  mainColForceProps?: colType
  subColForceProps?: colTypeOptional
}

export const aggregateOnSingleTd = (
  props: aggregateOnSingleTdProps & {
    cols: colType[] | any[]
  }
) => {
  const {subColForceProps} = props
  const mainTd = props.mainTd ?? props.cols[0]

  const cols = Fields.mod.setAttribute({
    cols: props.cols.map(ensureColType),
    attributeSetter: ({col}) => {
      const newCol = {
        ...col,
        format: col.format ?? defaultFormat,
      }
      return newCol
    },
  })

  const {C_StackClassName = `items-start justify-start w-full  `} = mainTd

  const stackClassName = twMerge(`h-full justify-start gap-0 leading-[20px]`, C_StackClassName)

  const thStackClassName = `mx-auto items-start justify-start gap-0 leading-4`

  // // 初期化
  const mainCol = {
    ...cols.find(col => col.id === mainTd.id),
    ...mainTd,
  } as colType

  // subColsにはformを追加し、tdを削除する

  const processedData = cols.reduce(
    (acc, col) => {
      // subColsの処理
      if (col.id !== mainTd.id) {
        const processedCol = {
          ...col,
          td: {...col.td, hidden: true},
          ...(subColForceProps ?? {}),
        }
        acc.subCols.push(processedCol)
      }

      // theaderColsの処理
      if (!col.td?.hidden) {
        acc.theaderCols.push(col)
      }

      // allColisHiddenの処理
      acc.allColisHidden = acc.allColisHidden && !!col.td?.hidden

      return acc
    },
    {
      subCols: [] as colType[],
      theaderCols: [] as colType[],
      allColisHidden: true,
    }
  )

  const {subCols, theaderCols, allColisHidden} = processedData

  const NewCol = {...mainCol, td: {style: mainTd?.td?.style, getRowColor: mainTd?.td?.getRowColor, hidden: allColisHidden}}

  // 改善案

  NewCol.id = mainTd.id

  NewCol.format = (value, row) => {
    value = value ? converDataForClient(value, NewCol) : '-'

    const EntireCellFormat = props?.mainTd?.entireCellFormat && props?.mainTd?.entireCellFormat(value, row, mainCol)

    if (EntireCellFormat) {
      return EntireCellFormat
    }

    return ({record, dataModelName, mutateRecords, tdStyle, showHeader}) => {
      const processedCols = React.useMemo(() => {
        return theaderCols.map((col, i) => {
          const newCol = {...col}
          if (i === 0) {
            newCol.isMain = true //tdの中にlabelをつけるときに二重になるのフラグをつける
          }
          const value = row[col.id] ? converDataForClient(row[col.id], newCol) : undefined
          const format = newCol.format ?? defaultFormat
          return {
            col: newCol,
            value: format(value, row, newCol),
          }
        })
      }, [theaderCols, row])

      return (
        <Fragment>
          <C_Stack
            className={cn(
              //
              `bg-white/50`,
              `  justify-start gap-0  leading-[20px]`,
              stackClassName
            )}
          >
            {processedCols.map((item, i) => {
              const style = {
                ...defaultStyle,
                ...(item.col.type === `date` ? {minWidth: getColMinWidth(item.col)} : undefined),
              }

              return (
                <R_Stack key={i} style={style} className={defaultClassName}>
                  <MemoizedTdContent
                    {...{
                      showHeader,
                      value: item.value,
                      dataModelName,
                      col: item.col,
                      record,
                      tdStyle,
                      mutateRecords,
                    }}
                  />
                </R_Stack>
              )
            })}
          </C_Stack>
        </Fragment>
      )
    }
  }

  // 改善案
  const shouldUseRStack = mainTd.th?.stack || (theaderCols?.length ?? 0) > 3
  const Stack = shouldUseRStack ? R_Stack : C_Stack

  const thCols = cols.filter(col => col.th?.hidden !== true)

  NewCol.th = {
    format: () => {
      return (
        <Stack className={thStackClassName}>
          {thCols.map((col, i) => {
            return (
              <div className={cl(border.dottedBottom, `text-center`)} key={i}>
                {col.label}
              </div>
            )
          })}
        </Stack>
      )
    },
  }

  const result = [NewCol, ...subCols]

  return result as (colType & colTypeOptional)[]
}
