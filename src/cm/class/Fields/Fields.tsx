'use client'
const defaultSummaryInTdArgs = {
  hideUndefinedValue: false,
  labelWidthPx: 70,
  wrapperWidthPx: 160,
  showShadow: true,
}

import {colType, colTypeOptional} from '@cm/types/col-types'
import {aggregateOnSingleTd, aggregateOnSingleTdProps} from 'src/cm/class/Fields/lib/aggregateOnSingleTd'
import {addColIndexs} from 'src/cm/class/Fields/lib/addColIndex'
import {setAttribute} from 'src/cm/class/Fields/lib/setAttribute'
import {transposeColumns} from 'src/cm/class/Fields/lib/transposeColumns'

import {NestHandler} from '@cm/class/NestHandler'

import React from 'react'

import {TableInfo, TableInfoWrapper} from '@cm/class/builders/ColBuilderVariables'
import {DH__convertDataType} from '@cm/class/DataHandler/type-converter'
import {defaultFormat} from '@cm/class/Fields/lib/defaultFormat'
import {NumHandler} from '../NumHandler'

export const defaultSelect = {id: true, name: true}
export const masterDataSelect = {...defaultSelect, color: true}

type freeColType = Exclude<colTypeOptional, 'id' | 'label'>
export type setterType = (props: {col: colType}) => freeColType
export class Fields {
  plain: colType[]
  private cache = new Map()

  constructor(array: colType[]) {
    this.plain = array
  }

  setTdMinWidth = ({minWidth, maxWidth = undefined}) => {
    return this.customAttributes(({col}) => {
      return {
        ...col,
        td: {...col?.td, style: {minWidth, maxWidth}},
      }
    })
  }

  showSummaryInTd = (
    props: {
      wrapperLabel?: any
      wrapperWidthPx?: number
      labelWidthPx?: number
      hideUndefinedValue?: boolean
      showShadow?: boolean
      convertColId?: {[key: string]: string}
    } & colTypeOptional
  ) => {
    const columns = this.plain
    const cacheKey = `summary_${columns.map(d => d.id).join('_')}_${JSON.stringify(props)}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const {hideUndefinedValue, wrapperWidthPx, labelWidthPx, showShadow} = {...defaultSummaryInTdArgs, ...props}
    const id = `readOnly_${columns.map(d => d.id).join('_')}`

    const SummaryRow = React.memo(({value, row}: {value: any; row: any}) => {
      const existingValues: any[] = []
      const undefinedLabels: any[] = []

      columns
        .filter(col => col.td?.hidden !== true)
        .forEach(col => {
          const pseudoId = props.convertColId?.[col.id] ?? col.id
          let colValue = ''

          if (col.format) {
            colValue = col.format(value, row, col)
          } else if (col.type === 'price') {
            colValue = NumHandler.toPrice(row[col.id])
          } else if (col.type === 'password') {
            colValue = '********'
          } else if (col.forSelect) {
            const value = DH__convertDataType(NestHandler.GetNestedValue(pseudoId, row), col.type, 'client')

            colValue = defaultFormat(value, row, col) as string
          } else {
            colValue = DH__convertDataType(NestHandler.GetNestedValue(pseudoId, row), col.type, 'client')
          }

          const item = {label: col.label, value: colValue}

          if (hideUndefinedValue && !colValue) {
            undefinedLabels.push(item)
          } else {
            existingValues.push(item)
          }
        })

      return (
        <TableInfoWrapper {...{showShadow, label: props.wrapperLabel ?? ''}}>
          {existingValues.map((d, i) => (
            <div key={i}>
              <div
                style={{
                  border: '1px dashed transparent',
                  borderBottomColor: '#e0e0e0',
                }}
              >
                <TableInfo
                  {...{
                    ...d,
                    wrapperWidthPx,
                    labelWidthPx,
                  }}
                />
              </div>
            </div>
          ))}
          {hideUndefinedValue && undefinedLabels.length > 0 && (
            <div className="mt-1">
              <small>
                <TableInfo
                  {...{
                    label: 'データ無',
                    value: <div className="text-xs opacity-50">{undefinedLabels.map(d => d.label).join(', ')}</div>,

                    wrapperWidthPx,
                    labelWidthPx,
                  }}
                />
              </small>
            </div>
          )}
        </TableInfoWrapper>
      )
    })

    const result = new Fields([
      {
        id,
        label: '',
        form: {hidden: true},
        td: {withLabel: false},
        format: (value, row) => <SummaryRow value={value} row={row} />,
      },
      ...new Fields(columns).customAttributes(({col}) => ({...col, td: {hidden: true}})).plain,
    ])

    this.cache.set(cacheKey, result)
    return result
  }

  customAttributes = (
    setter: setterType,
    options?: {
      include?: string[]
      exclude?: string[]
    }
  ) => {
    const cols = this.plain
    const cacheKey = JSON.stringify({cols, options})

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const defaultInclude = (cols ?? []).map(col => col.id)
    const {include = defaultInclude, exclude} = options ?? {}

    const result = cols.map(col => {
      const isInExclude = exclude?.includes(col.id)
      const isInInclude = include?.includes(col.id)

      if (isInExclude) return col
      if (isInInclude) return {...col, ...setter({col})}
      return col
    })

    const newFields = new Fields(result)
    this.cache.set(cacheKey, newFields)
    return newFields
  }

  setNormalTd = () => {
    const result = this.customAttributes(({col}) => {
      const withLabel = !col?.td?.withLabel
      return {...col, td: {...col.td, withLabel}}
    })

    return result
  }
  aggregateOnSingleTd = (props?: aggregateOnSingleTdProps & {cols?: any}) => {
    const result = aggregateOnSingleTd({...props, cols: this.setNormalTd().plain})
    this.plain = result
    return new Fields(result)
  }

  buildFormGroup = ({groupName}) => {
    return this.customAttributes(({col}) => {
      return {...col, form: {...col.form, colIndex: groupName}}
    })
  }

  transposeColumns = () => {
    const cols = this.plain
    return transposeColumns(cols)
  }

  static transposeColumns = transposeColumns
  static mod = {aggregateOnSingleTd, addColIndexs, setAttribute}

  static doShowLabel = (col: colType) => col?.td?.withLabel === true
}
