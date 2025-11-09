import useSWR from 'swr'
import {colType} from '@cm/types/col-types'
import {anyObject} from '@cm/types/utility-types'
import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {
  convertColIdToModelName,
  getSelectId,
} from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/lib/MySelectMethods-server'

import {generalDoStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {arr__uniqArray} from '@cm/class/ArrHandler/array-utils/basic-operations'
import {DH__switchColType} from '@cm/class/DataHandler/type-converter'

export const renewOptions = ({col, allOptions, setallOptionsState, newOptions}) => {
  if (setallOptionsState) {
    setallOptionsState(prev => {
      const selectId = getSelectId(col)
      const newAllOptions = {...allOptions}
      const optionsForThisSelectId = newAllOptions?.[selectId]
      const newUniqueOptions = arr__uniqArray([...optionsForThisSelectId, ...(newOptions ?? [])])
      return {
        ...newAllOptions,
        [selectId]: newUniqueOptions,
      }
    })
  }
}

export const scaleUpWhereQueryForOptionSearch = ({where, select, searchNotationVersions}) => {
  const getAndQueryToSearchForOptions = ({where, OrQueryFromSearchedInput}) => {
    const AND: anyObject[] = []
    where ? AND.push(where) : '' //whereがあれば、それをANDに追加
    OrQueryFromSearchedInput.length > 0 ? AND.push({OR: OrQueryFromSearchedInput}) : '' //OrQueryFromSearchedInputがあれば、それをANDに追加
    return AND
  }

  //config.selectの中身を全部検索対象にする
  const OrQueryFromSearchedInput = getOrQueryFromSearchedInput({select, searchNotationVersions})

  //config.whereの中身を全部検索対象にする
  const AND = getAndQueryToSearchForOptions({where, OrQueryFromSearchedInput})

  return AND
}

/**ORを取得 */
export function getOrQueryFromSearchedInput({select, searchNotationVersions}) {
  const OR: anyObject[] = []

  if (select) {
    Object.keys(select).forEach(key => {
      if (key === `id`) return //idはテキスト型のため

      const dataType = DH__switchColType({type: select[key]})

      //全角、半角、大文字、文字などをORで繋ぐ
      searchNotationVersions.forEach(possibleInputNotation => {
        const {value} = possibleInputNotation
        let object: any = {[key]: {contains: value}}

        if (dataType === `number`) {
          const ToNumber = Number(value)
          object = {[key]: {equals: isNaN(ToNumber) ? 0 : ToNumber}}
        } else if (dataType === `date`) {
          if (Days.validate.isDate(value)) {
            object = {[key]: {equals: formatDate(new Date(value), `iso`)}}
          } else {
            return
          }
        }

        OR.push(object)
      })
    })
  }

  return OR
}

// }

export const judgeOptionGetType = ({optionsOrOptionFetcher}) => {
  let type: 'array' | 'automatic' | 'custom' = 'automatic'
  if (Array.isArray(optionsOrOptionFetcher)) {
    type = 'array'
  } else if (optionsOrOptionFetcher) {
    type = 'custom'
  }
  return type
}

export const getRecord = (props: {col: colType; currentValue: any; options: any[]}) => {
  const {col, currentValue, options} = props
  let SWR_KEY = ''
  try {
    SWR_KEY = JSON.stringify({col, currentValue})
  } catch (error) {
    // console.error(error.stack) //////////
  }

  const {data, error} = useSWR(SWR_KEY, async () => {
    const OptionGetType = judgeOptionGetType({optionsOrOptionFetcher: col?.forSelect?.optionsOrOptionFetcher})

    let record
    if (currentValue === undefined) return ''

    if (OptionGetType == 'array') {
      record = options.find(obj => obj.id == currentValue) ?? {}
    } else {
      const modelName = convertColIdToModelName({col})
      const idIsNumber = !isNaN(Number(currentValue))
      if (idIsNumber) {
        const {result} = await generalDoStandardPrisma(modelName, 'findUnique', {
          where: {id: isNaN(Number(currentValue)) ? 0 : Number(currentValue)},
        })
        record = result
      }
    }

    return record
  })

  return data ?? ''
}
