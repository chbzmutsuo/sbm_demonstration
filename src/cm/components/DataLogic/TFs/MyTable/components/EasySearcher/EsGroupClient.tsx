'use client'

import React from 'react'

import {C_Stack, R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {EasySearchObject} from '@cm/class/builders/QueryBuilderVariables'

import {EsButton} from '@cm/components/DataLogic/TFs/MyTable/components/EasySearcher/EsButton'
import BasicModal from '@cm/components/utils/modal/BasicModal'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {SquareArrowOutUpLeft, Trash2} from 'lucide-react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import ShadPopover from '@cm/shadcn/ui/Organisms/ShadPopover'

export default function EsGroupClient(props: {
  groupNameAlign?: string
  EsGroupClientProp: EsGroupClientPropType
  createNextQuery
}) {
  const {addQuery} = useGlobal()
  const {createNextQuery, EsGroupClientProp, groupNameAlign} = props
  const {groupName, searchBtnDataSources} = EsGroupClientProp

  const {isRefreshTarget, isLastBtn} = EsGroupClientProp

  const stackClass = groupNameAlign === 'left' ? `row-stack gap-1` : `col-stack gap-0`

  const currentSelected = searchBtnDataSources.filter(d => d.isActive)

  const Main = () => {
    return (
      <>
        {searchBtnDataSources.map((d, j) => {
          const {count, isUrgend, isActive, dataSource, conditionMatched} = d
          const IsSingleItemGroup = searchBtnDataSources.length === 1

          const Button = (
            <div className="h-full">
              <EsButton {...{IsSingleItemGroup, createNextQuery, conditionMatched, isActive, dataSource, count}} />
            </div>
          )

          if (dataSource.description) {
            return (
              <ShadPopover PopoverTrigger={Button} key={j}>
                <div>{dataSource.description && <div className={` max-w-[260px]`}>{dataSource.description}</div>}</div>
              </ShadPopover>
            )
          } else {
            return <div key={j}>{Button}</div>
          }
        })}
      </>
    )
  }

  const LabelDisplay = () => {
    return (
      <div className={`h-8`}>
        <R_Stack className={` cursor-pointer gap-1 h-8`}>
          <SquareArrowOutUpLeft className={`text-blue-700 h-4`} />

          {currentSelected.length > 0 ? (
            <R_Stack>
              <C_Stack>
                {currentSelected.map(d => {
                  return (
                    <div key={d.dataSource.id}>
                      <div className={`text-xs pointer-events-none   animate-pulse  rounded-xl`}>{d.dataSource.label}</div>
                    </div>
                  )
                })}
              </C_Stack>
            </R_Stack>
          ) : (
            <></>
          )}
        </R_Stack>
      </div>
    )
  }

  const showAsModal = searchBtnDataSources.some((d: any) => {
    const showAsModal = d.dataSource.showAsModal
    return showAsModal
  })

  return (
    <div className={`      text-sm h-10 `}>
      <div className={` ${stackClass}   `}>
        <small className={`text-start leading-3`}>{groupName}</small>
        {showAsModal ? (
          <div className={` ${stackClass}   `}>
            <R_Stack>
              <BasicModal Trigger={<LabelDisplay />}>
                <C_Stack>
                  <Main />
                </C_Stack>
              </BasicModal>

              {currentSelected.length > 0 && (
                <IconBtn
                  color="red"
                  onClick={() => {
                    const nextQuery = {
                      [currentSelected[0].dataSource.id]: undefined,
                    }
                    addQuery(nextQuery)
                  }}
                >
                  <Trash2 className={`text-gray-700  h-4 `} />
                </IconBtn>
              )}
            </R_Stack>
          </div>
        ) : (
          <>
            <R_Stack>
              <Main />
            </R_Stack>
          </>
        )}
      </div>
    </div>
  )
}

export type EsGroupClientPropType = {
  groupName: string
  searchBtnDataSources: searchBtnDataSourceType[]
  isRefreshTarget: boolean
  isLastBtn: boolean
}

export type searchBtnDataSourceType = {
  count: number
  isUrgend: boolean
  isActive: boolean
  conditionMatched: boolean
  dataSource: EasySearchObject
}
