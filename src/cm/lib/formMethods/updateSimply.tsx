import {isMultiItem, updateMultiItemInTransaction} from '@cm/lib/methods/multipleItemLib'
import {PrismaModelNames} from '@cm/types/prisma-types'
import {requestResultType} from '@cm/types/types'

import {colType} from '@cm/types/col-types'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {generalDoStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {StrHandler} from '@cm/class/StrHandler'
import {separateFormData} from '@cm/lib/formMethods/separateFormData'
import {anyObject} from '@cm/types/utility-types'
import {multipleSelectProps} from '@cm/types/select-types'

export const updateSimply = async (props: {
  columns: any[]
  latestFormData: anyObject
  dataModelName: PrismaModelNames
  additionalPayload?: object
  additionalInclude?: object
  initialModelData: any
  extraFormState: anyObject
}) => {
  const {columns, latestFormData, dataModelName, additionalPayload, additionalInclude, initialModelData, extraFormState} = props

  //=============複数選択の場合=============
  const MultiItems = columns.flat().filter(col => isMultiItem(col.id))
  const cleansedFormData = {...latestFormData}

  MultiItems.forEach(obj => {
    delete cleansedFormData[obj.id] //親子構造のモデルは除去し、別途処理する
  })

  const {id, modelBasicData, relationIds} = separateFormData({
    latestFormData: cleansedFormData,
    additionalPayload,
    columns,
  })

  //==========リレーションを削除し、後でトランザクションで処理==========

  const midTableTargetCols = columns.flat().filter(col => {
    if (col.multipleSelect) {
      delete modelBasicData[col.id]
      return true
    }
  })

  const payload = {
    ...additionalPayload, //元々最後に設置してアップデートする予定でだったが、初期値とするように設定
    ...modelBasicData,
    ...relationIds,
    // include: additionalInclude,
  }

  columns.flat().forEach(col => {
    if (col.type === 'file' && !payload[col.id]) {
      //空で更新した際に、ファイルが削除されてしまうので、ファイルの削除を防ぐ
      delete payload[col.id]
    }
    if (col?.form?.send === false) {
      delete payload[col.id]
    }
  })

  let updatedModelRes: requestResultType

  if (id) {
    updatedModelRes = await generalDoStandardPrisma(dataModelName, 'update', {
      where: {id: id ?? 0},
      data: payload,
    })
  } else {
    updatedModelRes = await generalDoStandardPrisma(dataModelName, 'create', {
      data: payload,
    })
  }

  await updateMultiItemInTransaction({
    MultiItems,
    latestFormData,
    initialModelData,
    updatedModelRes,
    dataModelName,
    doTransaction,
  })

  if (midTableTargetCols.length > 0) {
    const createdData = updatedModelRes.result

    const midTableTransactionQuery: transactionQuery<any, any>[] = []

    midTableTargetCols.forEach((col: colType) => {
      const {
        models: {parent, mid, option, uniqueWhereKey},
      } = col.multipleSelect as multipleSelectProps

      const selectedValues = extraFormState[col.id]

      Object.keys(selectedValues).forEach(optionId => {
        const isActive = selectedValues[optionId]

        const payload = {
          [`${parent}Id`]: createdData?.id,
          [`${option}Id`]: Number(optionId),
        }

        if (isActive) {
          midTableTransactionQuery.push({
            model: mid,
            method: `upsert`,
            queryObject: {
              where: {[uniqueWhereKey]: payload},
              create: payload,
              update: payload,
            },
          })
        } else {
          const dataRegistered = latestFormData[StrHandler.capitalizeFirstLetter(mid)]
          if (dataRegistered.find(data => data[`${option}Id`] === Number(optionId))) {
            midTableTransactionQuery.push({
              model: mid,
              method: `delete`,
              queryObject: {
                where: {[uniqueWhereKey]: payload},
              },
            })
          }
        }
      })
    })

    await doTransaction({transactionQueryList: midTableTransactionQuery})
  }

  return updatedModelRes
}
