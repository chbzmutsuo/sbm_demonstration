'use client'

import {useState, useEffect} from 'react'
import {makeEasySearchGroupsProp} from 'src/cm/class/builders/QueryBuilderVariables'

import {EsGroupClientPropType} from '@cm/components/DataLogic/TFs/MyTable/components/EasySearcher/EsGroupClient'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'

export default function useInitEasySearcher({
  availableEasySearchObj,
  easySearchPrismaDataOnServer,
  dataCountObject,
  useGlobalProps,
}) {
  const [excrusiveGroups, setexcrusiveGroups] = useState({})
  useEffect(() => {
    const excrusiveGroups = {}
    Object.keys(availableEasySearchObj ?? {}).map(key => {
      const exclusiveGroup: makeEasySearchGroupsProp = availableEasySearchObj[key]?.exclusiveGroup

      const {groupIndex, rowGroupIdx} = exclusiveGroup

      const GROUPKEY_ROWGROUPIDX = `${groupIndex}_${rowGroupIdx}`
      obj__initializeProperty(excrusiveGroups, GROUPKEY_ROWGROUPIDX, {
        name: exclusiveGroup?.name,
        searchBtnDataSources: [],
      })

      excrusiveGroups[GROUPKEY_ROWGROUPIDX].searchBtnDataSources.push({
        queryKey: key,
        ...availableEasySearchObj[key],
        rowGroupIdx,
      })
    })

    setexcrusiveGroups(excrusiveGroups)
  }, [easySearchPrismaDataOnServer])

  const {query, addQuery, toggleLoad} = useGlobalProps

  const activeExGroup: EsGroupClientPropType[] = []
  const nonActiveExGroup: EsGroupClientPropType[] = []

  const splitByRow: any = {}
  Object.keys(excrusiveGroups).map((key, groupIdx) => {
    const [idx, rowIdx] = key.split('_')
    const data = excrusiveGroups[key]
    obj__initializeProperty(splitByRow, rowIdx, [])

    splitByRow[rowIdx].push(data)
  })

  const RowGroups: EsGroupClientPropType[][] = Object.values(splitByRow).map((EsGroupClientPropList: any, i) => {
    return EsGroupClientPropList.map((EsGroupClientProp, j) => {
      const {name: groupName} = EsGroupClientProp

      const searchBtnDataSources = EsGroupClientProp.searchBtnDataSources.map((dataSource, j) => {
        const {queryKey, keyValueList, id} = dataSource
        const count = dataCountObject[queryKey]
        const isUrgend = count > 0
        const isActive = query[id]

        const conditionMatched = keyValueList?.reduce((flag, curr) => {
          const {key, value} = curr
          if (query?.[key] !== value?.toString()) {
            flag = false
          }
          return flag
        }, true)

        return {
          count,
          isUrgend,
          isActive,
          conditionMatched,
          dataSource,
        }
      })

      const isActiveExGroup = searchBtnDataSources.some(d => d.isActive || d.dataSource.defaultOpen !== false)

      const isRefreshTarget = searchBtnDataSources.some(d => d.dataSource.refresh)

      const isLastBtn = j === EsGroupClientPropList.length - 1

      const result = {groupName, isRefreshTarget, isLastBtn, searchBtnDataSources}

      if (isActiveExGroup > 0) {
        activeExGroup.push(result)
      } else {
        nonActiveExGroup.push(result)
      }

      return result
    })
  })

  return {
    nonActiveExGroup,
    activeExGroup,
    RowGroups,
  }
}
