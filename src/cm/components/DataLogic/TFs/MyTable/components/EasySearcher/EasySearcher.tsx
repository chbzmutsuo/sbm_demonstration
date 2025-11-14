'use client'

import React, {useCallback, useMemo} from 'react'

import useGlobal, {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobal'
import {C_Stack, R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {PrismaModelNames} from '@cm/types/prisma-types'

import GlobalModal from '@cm/components/utils/modal/GlobalModal'

import useInitEasySearcher from '@cm/components/DataLogic/TFs/MyTable/components/EasySearcher/useInitEasySearcher'

import EsGroupClient from '@cm/components/DataLogic/TFs/MyTable/components/EasySearcher/EsGroupClient'
import {CircledIcon, IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {SquareArrowRight} from 'lucide-react'
import {Wrapper} from '@cm/components/styles/common-components/paper'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {easySearchDataSwrType} from '@cm/class/builders/QueryBuilderVariables'
import {Filter} from 'lucide-react'
import {UseRecordsReturn} from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'
import useWindowSize from '@cm/hooks/useWindowSize'

export default function EasySearcher(props: {
  easySearchPrismaDataOnServer: easySearchDataSwrType
  useGlobalProps: useGlobalPropType
  dataModelName: PrismaModelNames
  UseRecordsReturn?: UseRecordsReturn
  hideEasySearch?: boolean
  // prismaDataExtractionQuery: prismaDataExtractionQueryType
}) {
  const {dataModelName, useGlobalProps, easySearchPrismaDataOnServer, hideEasySearch} = props
  const {dataCountObject, availableEasySearchObj = {}} = easySearchPrismaDataOnServer

  const {activeExGroup, nonActiveExGroup, RowGroups} = useInitEasySearcher({
    availableEasySearchObj,
    easySearchPrismaDataOnServer,
    dataCountObject,
    useGlobalProps,
  })

  const {query} = useGlobal()
  const {SP} = useWindowSize()

  const createNextQuery = useCallback(
    props => {
      let newQuery = {}
      if (availableEasySearchObj) {
        const {exclusiveGroup, keyValueList, refresh} = props.dataSource ?? {}

        const friends = Object.keys(availableEasySearchObj).filter(key => {
          const obj = availableEasySearchObj[key]

          return exclusiveGroup?.groupIndex === obj.exclusiveGroup?.groupIndex && obj.refresh !== true
        })

        const others = Object.keys(availableEasySearchObj).filter(key => {
          const obj = availableEasySearchObj[key]

          return exclusiveGroup?.groupIndex !== obj.exclusiveGroup?.groupIndex && obj.refresh !== true
        })

        const refreshes = Object.keys(availableEasySearchObj).filter(key => {
          const {refresh} = availableEasySearchObj[key]
          return refresh === true
        })

        if (refresh) {
          const resetQuery = Object.fromEntries(Object.keys(availableEasySearchObj).map(key => [key, undefined]))
          newQuery = {...resetQuery}
        } else {
          friends.forEach(key => (newQuery[key] = ''))
          others.forEach(key => (newQuery[key] = query[key]))
        }

        refreshes.forEach(key => (newQuery[key] = undefined))

        //関連のあるキーを挿入
        keyValueList.forEach(obj => {
          const {key, value} = obj

          const isSet = query[key] ?? '' === String(value)
          const newValue = isSet ? '' : String(value)
          newQuery[key] = newValue
        })
        newQuery['P'] = 1
        newQuery['S'] = undefined
      }

      return newQuery
    },
    [availableEasySearchObj, query]
  )

  const MainComponentMemo = useMemo(() => {
    return <Main {...{dataModelName, nonActiveExGroup, RowGroups, activeExGroup, createNextQuery, hideEasySearch}} />
  }, [dataModelName, nonActiveExGroup, RowGroups, activeExGroup, createNextQuery, hideEasySearch])

  if (activeExGroup.length === 0) return <PlaceHolder />

  const filterIsActive = activeExGroup.length > 0
  if (SP) {
    return (
      <GlobalModal
        id={`${dataModelName}-Es-Modal`}
        Trigger={
          <IconBtn className={`onHover`} color={filterIsActive ? `yellow` : `gray`}>
            <R_Stack>
              <Filter />
            </R_Stack>
          </IconBtn>
        }
      >
        {MainComponentMemo}
      </GlobalModal>
    )
  }

  return (
    <div>
      <R_Stack className={` items-stretch  gap-0.5`}>{MainComponentMemo}</R_Stack>
    </div>
  )
}

const Main = ({
  dataModelName,
  nonActiveExGroup,
  RowGroups,
  activeExGroup,
  hideNonActives = true,
  createNextQuery,
  hideEasySearch,
}) => {
  const ShownRowGroups = RowGroups.filter((EsGroupClientPropList, i) => {
    return (
      EsGroupClientPropList.filter((EsGroupClientProp, j) => {
        const isActive = activeExGroup.some(g => {
          return g.groupName === EsGroupClientProp.groupName
        })
        const show = hideNonActives === false || isActive
        return show
      }).length > 0
    )
  })

  return (
    <div>
      <R_Stack className={` items-center  flex-nowrap gap-2`}>
        <ShowAllFilterBtn {...{dataModelName, RowGroups, activeExGroup, createNextQuery, nonActiveExGroup, hideEasySearch}} />
        <C_Stack className={` w-full `}>
          {ShownRowGroups.map((EsGroupClientPropList, i) => {
            return (
              <R_Stack key={i} className={`   w-fit  items-stretch justify-start gap-0 gap-y-1`}>
                {EsGroupClientPropList.map((EsGroupClientProp, j) => {
                  const {isRefreshTarget, isLastBtn} = EsGroupClientProp

                  return (
                    <R_Stack key={j}>
                      {/* <R_Stack className={`${border}  relative pr-6 `}> */}
                      <Wrapper className={`p-0.5!`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 px-0.5">
                            <div className={` `}>
                              <EsGroupClient {...{EsGroupClientProp, createNextQuery}} />
                            </div>
                          </div>
                        </div>
                      </Wrapper>
                    </R_Stack>
                  )
                })}
              </R_Stack>
            )
          })}
        </C_Stack>
      </R_Stack>
    </div>
  )
}

const ShowAllFilterBtn = ({dataModelName, RowGroups, activeExGroup, createNextQuery, nonActiveExGroup, hideEasySearch}) => {
  if (nonActiveExGroup.length === 0) {
    return null
  }
  return (
    <div>
      <>
        <GlobalModal
          id={`${dataModelName}-Es-Modal`}
          Trigger={
            <span className={`t-link  text-xs `}>
              <CircledIcon>
                <SquareArrowRight />
              </CircledIcon>
            </span>
          }
        >
          <Main
            {...{
              dataModelName,
              nonActiveExGroup,
              RowGroups,
              activeExGroup,
              createNextQuery,
              hideNonActives: false,
              hideEasySearch,
            }}
          />
        </GlobalModal>
      </>
    </div>
  )
}
