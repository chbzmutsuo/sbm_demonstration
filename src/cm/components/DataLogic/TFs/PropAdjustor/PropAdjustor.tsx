'use client'
import React, {useMemo} from 'react'
import {C_Stack, Padding, R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {Z_INDEX} from '@cm/lib/constants/constants'

import {TableSkelton} from '@cm/components/utils/loader/TableSkelton'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'

import {usePropAdjustorLogic} from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/usePropAdjusctorLogic/usePropAdjustorLogic'
import {PropAdjustorPropsType} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import useWindowSize from '@cm/hooks/useWindowSize'
import {SurroundingComponent} from '@cm/components/DataLogic/TFs/PropAdjustor/components/SurroundingComponent'
import EasySearcher from '@cm/components/DataLogic/TFs/MyTable/components/EasySearcher/EasySearcher'
import DetailedPageCC from '@cm/components/DataLogic/TFs/PropAdjustor/components/DetailedPageCC'

const PropAdjustor = React.memo<PropAdjustorPropsType>(props => {
  const {serverFetchProps} = props
  const {ClientProps2, UseRecordsReturn, modelData, easySearchPrismaDataOnServer, useGlobalProps} = usePropAdjustorLogic(props)

  const {appbarHeight} = useWindowSize()

  const hasEasySearch = useMemo(
    () => Object.keys(easySearchPrismaDataOnServer?.availableEasySearchObj || {}).length > 0,
    [easySearchPrismaDataOnServer?.availableEasySearchObj]
  )

  const easySearcherProps = useMemo(
    () => ({
      dataModelName: ClientProps2.dataModelName,
      easySearchPrismaDataOnServer,
      useGlobalProps,
      UseRecordsReturn,
      hideEasySearch: ClientProps2?.myTable?.hideEasySearch,
    }),
    [
      ClientProps2.dataModelName,
      easySearchPrismaDataOnServer,
      useGlobalProps,
      UseRecordsReturn,
      ClientProps2?.myTable?.hideEasySearch,
    ]
  )

  const containerStyle = useMemo(
    () => ({
      ...ClientProps2.displayStyle,
      paddingTop: 10,
    }),
    [ClientProps2.displayStyle]
  )

  const stickyHeaderStyle = useMemo(
    () => ({
      position: 'sticky' as const,
      top: appbarHeight + 10,
      zIndex: Z_INDEX.EasySearcher,
      marginBottom: 12,
    }),
    [appbarHeight]
  )

  const mainSectionStyle = useMemo(
    () => ({
      zIndex: Z_INDEX.EasySearcher - 10,
    }),
    []
  )

  if (UseRecordsReturn.records === null) {
    return (
      <Padding>
        <TableSkelton />
      </Padding>
    )
  }

  if (serverFetchProps.DetailePageId) {
    return modelData === null ? <PlaceHolder /> : <DetailedPageCC ClientProps2={ClientProps2} modelData={modelData} />
  }

  return (
    <div style={containerStyle}>
      <section className="p-0" style={stickyHeaderStyle}>
        <C_Stack className="gap-1 z-100">
          {hasEasySearch && <EasySearcher {...easySearcherProps} />}
          <SurroundingComponent ClientProps2={ClientProps2} type="top" />
        </C_Stack>
      </section>

      <section style={mainSectionStyle}>
        <R_Stack className="mx-auto items-start justify-around">
          <SurroundingComponent ClientProps2={ClientProps2} type="left" />
          <SurroundingComponent ClientProps2={ClientProps2} type="table" />
          <SurroundingComponent ClientProps2={ClientProps2} type="right" />
        </R_Stack>

        <div className="sticky bottom-0">
          <SurroundingComponent ClientProps2={ClientProps2} type="bottom" />
        </div>
      </section>
    </div>
  )
})

export default PropAdjustor
