import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import {PrismaModelNames} from '@cm/types/prisma-types'

import {R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {additionalPropsType} from '@cm/types/types'

import {IconBtnForSelect} from '@cm/components/styles/common-components/IconBtn'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import {anyObject} from '@cm/types/utility-types'
import {forSelcetType} from '@cm/types/select-types'
import {colType} from '@cm/types/col-types'

export const multiId = (model: PrismaModelNames, colId: string, idx: number) => {
  const modelNameInCapital = model.charAt(0).toUpperCase() + model.slice(1)
  const result = `${colId}_${idx}_in_${modelNameInCapital}`
  return result
}

export const parseMultiId = (key: string) => {
  const [colId_idx, model] = key.split('_in_')
  const [colId, idx] = colId_idx.split('_')
  const result = {model, colId, idx}

  return result
}

export const isMultiItem = (colId: string) => {
  return colId?.includes('_in_')
}

export const getMultiItems = (latestFormData: anyObject) => Object.keys(latestFormData).filter(key => isMultiItem(key))

type copyMultipeColumnObjectProps = {
  label: string
  model: PrismaModelNames
  colId: string
  colCount
  forSelect?: {
    optionsOrOptionFetcher: forSelcetType
  }
  additional?: additionalPropsType
}

export const updateMultiItemInTransaction = async props => {
  const {MultiItems, latestFormData, initialModelData, updatedModelRes, dataModelName, doTransaction} = props
  const {ChildRecordsToUpsert, ChildRecordsToDelete} = (() => {
    const MultModelObj = MultiItems.map(col => col.id).reduce((acc, key) => {
      const {model} = parseMultiId(key)
      acc[model] = initialModelData[model]
      return acc
    }, {})

    const ChildRecordsToDelete: anyObject = {}
    const ChildRecordsToUpsert: anyObject = {}

    /**_in_のように親子構造のモデルは除去し、別途処理する */
    MultiItems.forEach(col => {
      const {id} = col
      const value = latestFormData[id]
      const {model, colId, idx} = parseMultiId(id)

      obj__initializeProperty(ChildRecordsToDelete, model, [])

      const obj = value ? {[colId]: value} : {delete: true}
      ChildRecordsToUpsert[model].push(obj)
    })

    Object.keys(ChildRecordsToUpsert).forEach(model => {
      const arr = ChildRecordsToUpsert[model]
      arr.forEach((obj, idx) => {
        if (obj.delete) {
          const deleteItemId = MultModelObj?.[model]?.[idx]?.id
          ChildRecordsToDelete[model].push(deleteItemId)
        }
      })
    })

    return {ChildRecordsToUpsert, ChildRecordsToDelete}
  })()

  const {transactionQueryList} = (() => {
    const transactionQueryList: transactionQuery[] = []

    /**upsertの対象データ */
    Object.keys(ChildRecordsToUpsert).forEach((model: PrismaModelNames) => {
      /**新規データの拡張クエリ */
      const newArr = ChildRecordsToUpsert[model].filter(obj => obj.delete !== true)

      newArr.forEach(async (obj, idx) => {
        /**配列に存在しない時 ➡︎ 新規追加*/
        const nthItemExist = initialModelData?.[model]?.[idx]
        let prismaId
        if (nthItemExist) {
          prismaId = nthItemExist?.id
        } else {
          prismaId = 0
        }
        let data = {...obj, [dataModelName + 'Id']: updatedModelRes?.result?.id}

        Object.keys(obj).forEach(colId => {
          const originalCol = MultiItems.find(col => {
            const relationalColId = parseMultiId(col.id).colId
            return relationalColId === colId
          })
          const colPayload = originalCol?.additional?.payload

          data = {...data, ...colPayload}
        })

        const result: transactionQuery = {
          model,
          method: 'upsert',
          queryObject: {
            where: {
              id: prismaId ?? 0,
            },
            create: data,
            update: data,
          },
        }
        transactionQueryList.push(result)
      })
    })

    /**deleteの対象データ */
    Object.keys(ChildRecordsToDelete).forEach((model: PrismaModelNames) => {
      const arr = ChildRecordsToDelete[model].filter(id => id !== undefined)
      arr.forEach(id => {
        const result: transactionQuery = {
          model,
          method: 'delete',
          queryObject: {where: {id: id}},
        }
        transactionQueryList.push(result)
      })
    })

    return {transactionQueryList}
  })()

  if (transactionQueryList.length > 0) {
    const res = await doTransaction({transactionQueryList})
  }
}

export const copyMultipeColumnObject = (props: copyMultipeColumnObjectProps) => {
  const {label, colCount, model, colId, forSelect = {}, additional} = props

  /**Purposeなどのリレーション先 */
  const capitalModelName = model.charAt(0).toUpperCase() + model.slice(1)

  /**purposeMasterIdなどの〜Idを大文字にして、IDを切り落とす */
  const capitalColIdWithoutId = colId.charAt(0).toUpperCase() + colId.slice(1).replace('Id', '')

  const result: colType[] = new Array(colCount)
    .fill(0)
    .map((_, i) => i)
    .map(i => {
      const id = multiId(model, colId, i)
      let obj: colType & {additional: additionalPropsType} = {
        id,
        label: `${label}`,
        td: {style: {verticalAlign: 'top'}},
        forSelect: forSelect,
        form: {register: {}},
        additional: additional,
      }

      if (i === 0) {
        obj = {
          ...obj,

          format: (value, row) => {
            const Children = row?.[capitalModelName]

            return (
              <R_Stack style={{width: 120}} className={`w-full items-center justify-start gap-1`}>
                {Children?.map((NthChild, i) => {
                  const Master = NthChild?.[capitalColIdWithoutId]

                  return (
                    <IconBtnForSelect style={{}} key={i} color={Master?.color}>
                      {Master?.name}
                    </IconBtnForSelect>
                  )
                })}
              </R_Stack>
            )
          },
        }
      } else {
        obj = {
          ...obj,
          td: {hidden: true},
        }
      }

      return obj
    })

  return result as colType[]
}
