import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {optionType} from 'src/cm/class/Fields/col-operator-types'
import {Fields} from 'src/cm/class/Fields/Fields'
import {P_Query} from 'src/cm/class/PQuery'
import {mapAdjustOptionValue} from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/lib/MySelectMethods-server'

import {getSchema} from 'src/cm/lib/methods/prisma-schema'

import {colType} from '@cm/types/col-types'
import {StrHandler} from '@cm/class/StrHandler'

import {DH__convertDataType, DH__switchColType} from '@cm/class/DataHandler/type-converter'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
export const searchQueryKey = 'search'
export type searchNotationType =
  | 'contains'
  | 'equals'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'not'
  | 'searchNotation'

export type searchFormatKeyValType = {
  label: string
  searchType: searchNotationType
}

export const Sub = {
  getSearchFormats: ({col}) => {
    //検索パターンを定義
    let searchFormats: searchFormatKeyValType[] = []

    const type = col?.type ? col?.type : 'text'
    const convertedType = DH__switchColType({type})

    switch (convertedType) {
      case 'number':
        {
          if (!col.forSelect) {
            searchFormats = [
              {label: 'と一致', searchType: `equals`},
              {label: '以上', searchType: `gte`},
              {label: '以下', searchType: `lte`},
            ]
          } else {
            searchFormats = [{label: 'と一致', searchType: `equals`}]
          }
        }
        break
      case 'date': {
        searchFormats = [
          {label: 'と一致', searchType: `equals`},
          {label: '以降', searchType: `gte`},
          {label: '以前', searchType: `lte`},
        ]
        break
      }
      default:
        searchFormats = [
          {label: 'を含む', searchType: `contains`},
          {label: 'と一致', searchType: `equals`},
        ]
        break
    }
    return searchFormats
  },
  makeMainColsAndSearchCols: ({columns}) => {
    const MainColObject = {}
    const SearchColObject = {}
    columns.flat().forEach(col => {
      const type = String(col.id).includes('searchNotation') ? 'searchNotation' : 'main'
      if (type === 'main') {
        MainColObject[col.id] = col
      } else {
        SearchColObject[col.id] = col
      }
    })
    return {MainColObject, SearchColObject}
  },

  makeSearchColumns: ({columns, dataModelName, SP}) => {
    columns = columns.flat().map(col => {
      /**検索パターンを取得 */
      let searchFormats = Sub.getSearchFormats({col})
      searchFormats = searchFormats.map(format => {
        const {searchType} = format
        const whereKey = P_Query.create_where_colId_searchType_dataType_key(col, dataModelName, searchType)

        return {...format, whereKey}
      })

      return {...col, searchFormats, form: {}, type: ['textarea'].includes(col.type) ? 'text' : col.type}
    })

    const searchableCols = columns
      .filter(col => col?.search)
      .sort((a, b) => {
        return Number(a.originalColIdx) - Number(b.originalColIdx)
      })

    const data = (() => {
      const data: colType[] = []

      const mainCols = searchableCols.map((col: colType | any) => ({
        ...col,
        form: {},
      }))
      const searchTypeSelectorCols = searchableCols.map((col: colType | any) => {
        let serachOptions = col.searchFormats.map(format => {
          const result = {value: format.searchType, name: format.label}
          return result
        })

        serachOptions = mapAdjustOptionValue(serachOptions) as optionType[]
        const defaultValue = serachOptions[0]?.value
        const noOption = serachOptions.length === 1

        const newCol: colType = {
          ...col,
          id: `${col.id}_searchNotation`,
          type: undefined,
          label: '検索方法',
          forSelect: {optionsOrOptionFetcher: serachOptions},
          form: {
            showResetBtn: false,
            disabled: noOption,
            defaultValue: defaultValue,
            style: {
              width: 120,
              color: 'gray',
              fontSize: 13,
              background: '',
            },
          },
        }
        return newCol
      })

      // if (!SP) {
      //   // data = Fields.mod.addColIndexs([mainCols, searchTypeSelectorCols])
      // }

      mainCols.forEach((col, i) => {
        const hasCol = data.find(d => d.id === col.id)
        if (hasCol) return
        data.push({
          ...col,
          form: {...col.form, colIndex: '検索項目'},
        })
        data.push({
          ...searchTypeSelectorCols[i],
          form: {...searchTypeSelectorCols[i].form, colIndex: '種類'},
        })
      })

      return data
    })()

    columns = Fields.transposeColumns(data)

    return columns
  },
}

export const prismaSearchQueryKeys: searchNotationType[] = ['contains', 'equals', 'gte', 'lte']
export type earchTypeKeyVal = {
  searchType: searchNotationType
  key: string
  val: any
}

const getSearchTypeKeyValArrFromQueryStr = ({dataModelName, query}) => {
  const SearchTypeKeyValArr: earchTypeKeyVal[] = []
  const queryStr = String(query['search']) //car[contains:bpNumber=232,frame=10]
  const [dataModelNameToSearch, ...searchTypes] = queryStr.split('[')

  const schema = getSchema()
  if (dataModelName?.toLowerCase() === dataModelNameToSearch.toLowerCase()) {
    searchTypes.forEach(type => {
      //contains:bpNumber=232,frame=10]
      const searchType = type.split(':')[0] as searchNotationType
      const keyValStr = type?.split(':')?.[1]?.replace(']', '') //bpNumber=232,frame=10

      const keyVals = keyValStr.split(',')
      keyVals.forEach(keyVal => {
        const key = keyVal.split('=')[0]
        let val: any = keyVal.split('=')[1]

        // 正規表現 2023-11-22
        if (val.match(/(\d{4})-(\d{2})-(\d{2})/)) {
          val = toUtc(val)
        } else {
          const ModelOnSchema = schema[StrHandler.capitalizeFirstLetter(dataModelName)]
          const colsOnSchema = ModelOnSchema.map(field => {
            const regex = /\S+/g

            const match = field.match(regex) ?? []

            const fieldName = String(match[0]).replace(/\s/g, '')
            let type = String(match[1]).replace(/\s/g, '')
            type = type.replace('?', '').replace('[]', '').toLowerCase()
            const convertedType = DH__switchColType({type})

            return {
              fieldName,
              type,
              convertedType,
            }
          })

          const dataType = colsOnSchema.find(col => {
            return col.fieldName === key
          })?.convertedType

          val = DH__convertDataType(val, dataType, 'server')
        }

        if (searchType) {
          SearchTypeKeyValArr.push({
            searchType,
            key,
            val,
          })
        }
      })
    })
  }

  return SearchTypeKeyValArr
}

export const SearchQuery = {
  /**serverに送るwherequeryオブジェクトを作成する */
  createWhere: ({dataModelName, query}) => {
    const AND: any = []
    const SearchTypeKeyValArr = getSearchTypeKeyValArrFromQueryStr({dataModelName, query})

    SearchTypeKeyValArr.forEach(({searchType, key, val}) => {
      AND.push({[key]: {[searchType]: val}})
    })

    return AND
  },

  /**URLノクエリからオブジェクトに変換 */
  getSearchDefaultObject: ({dataModelName, query}) => {
    const result = {}
    const SearchTypeKeyValArr = getSearchTypeKeyValArrFromQueryStr({dataModelName, query})
    SearchTypeKeyValArr.forEach(({searchType, key, val}) => {
      const mainColId = key
      const SearchColId = `${key}_searchNotation`

      result[SearchColId] = searchType
      result[mainColId] = val
    })

    return result
  },

  createQueryStr: (props: {
    allData: {[key: string]: any}
    MainColObject: {[key: string]: any}
    SearchColObject: {[key: string]: any}
  }) => {
    const {allData, MainColObject, SearchColObject} = props
    const searchQueryResult = {}
    const searchNotations: {[key: string]: any[]} = {}

    Object.keys(SearchColObject)
      .flat()
      .forEach(key => {
        // コメントを追加
        // SearchColObjectからsearchColを取得
        const searchCol = SearchColObject[key]
        // MainColObjectからmainColを取得
        const mainCol = MainColObject[key.replace('_searchNotation', '')]
        // allDataからsearchColのidに対応する値を取得し、searchNotationに代入
        const searchNotation: searchNotationType = allData[searchCol?.id]
        // mainColのidをsearchKeyに代入
        const searchKey = mainCol.id
        // allDataからmainColのidに対応する値を取得し、searchValueに代入
        let searchValue = allData[mainCol.id]

        // searchValueが存在し、mainColのtypeが'date'の場合、searchValueをformatDateでフォーマットする
        if (searchValue && mainCol.type === 'date') {
          searchValue = formatDate(getMidnight(searchValue))
        }

        // searchKeyとsearchValueが存在する場合、searchNotationsオブジェクトに値を追加する
        const keyValue = `${searchKey}=${searchValue}`
        if (searchKey && searchValue) {
          obj__initializeProperty(searchNotations, searchNotation, [])
          searchNotations[searchNotation].push(keyValue)
        }
      })

    // searchNotationsオブジェクトをループし、searchQueryResultオブジェクトに値を追加する
    Object.keys(searchNotations).forEach((notation, i) => {
      const value = searchNotations[notation]
      searchQueryResult[notation] = value.join(',')
    })

    ///constinscarName|123,bpNumber|456
    const result = Object.keys(searchQueryResult)
      .map(key => {
        return `[${key}:${searchQueryResult[key]}]`
      })
      .join(``)

    return result
  },
}
