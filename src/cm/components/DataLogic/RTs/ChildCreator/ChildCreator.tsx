'use client'
import {dataMinimumCommonType, form_table_modal_config, prismaDataType, additionalPropsType, MyTableType} from '@cm/types/types'
import {anyObject} from '@cm/types/utility-types'

import {C_Stack, NoData} from 'src/cm/components/styles/common-components/common-components'
import {PrismaModelNames} from '@cm/types/prisma-types'
import React, {JSX, useMemo} from 'react'
import TableForm from '@cm/components/DataLogic/TFs/PropAdjustor/components/TableForm'
import {useParams} from 'next/navigation'
import {checkShowHeader} from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/usePropAdjusctorLogic/useMyTable'
import useRecords from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'
import useInitFormState from '@cm/hooks/useInitFormState'
import {serverFetchProps} from '@cm/components/DataLogic/TFs/Server/fetchers/getInitModelRecordsProps'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {getQueryArgs} from '@cm/components/DataLogic/TFs/Server/fetchers/getQueryArgs'
import EasySearcher from '@cm/components/DataLogic/TFs/MyTable/components/EasySearcher/EasySearcher'
import {convertColumns, getModelData} from '@cm/components/DataLogic/RTs/ChildCreator/helpers/childCreator-helpers'

export type ChildCreatorProps = dataMinimumCommonType &
  form_table_modal_config & {
    NoDatawhenParentIsUndefined?: () => JSX.Element
    ParentData: anyObject
    models: {
      parent: PrismaModelNames
      children: PrismaModelNames
    }
    nonRelativeColumns?: string[]
    forcedPirsmaData?: prismaDataType
    easySearchExtraProps?: anyObject
  }

export const ChildCreator = React.memo((props: ChildCreatorProps) => {
  const params = useParams()
  const {query, rootPath} = useGlobal()
  const {NoDatawhenParentIsUndefined, ParentData, models, additional, EditForm, editType, useGlobalProps} = props
  const {parentModelIdStr, childrenModelIdStr} = getModelData(models)
  const columns = convertColumns(props)

  const orderBy = useMemo(
    () => [...(props.myTable?.drag ? [{sortOrder: 'asc'}] : []), ...(additional?.orderBy ?? [{sortOrder: 'asc'}, {id: 'asc'}])],
    [props.myTable?.drag, additional?.orderBy]
  )

  const tunedAdditional: additionalPropsType = useMemo(
    () => ({
      ...additional,
      payload: {...additional?.payload, [parentModelIdStr]: ParentData?.id},
      where: {
        [parentModelIdStr]: ParentData?.id,
        ...additional?.where,
      },
      orderBy,
    }),
    [additional, parentModelIdStr, ParentData?.id, orderBy]
  )

  const childTableProps = useMemo(
    () => ({
      myTable: {
        showHeader: checkShowHeader({myTable: props.myTable, columns}),
        ...{sort: false, drag: false},
        ...props.myTable,
      } as MyTableType,
      myForm: {...props.myForm},
    }),
    [props.myTable, props.myForm, columns]
  )

  const myTable = childTableProps.myTable
  const myForm = childTableProps.myForm
  const dataModelName = models.children

  const prismaDataExtractionQuery = useMemo(() => {
    const {prismaDataExtractionQuery} = getQueryArgs({
      dataModelName,
      query,
      additional: tunedAdditional,
      myTable,
      DetailePageId: null,
      include: tunedAdditional?.include ? tunedAdditional?.include : undefined,
      easySearchObject: null,
    })
    return prismaDataExtractionQuery
  }, [dataModelName, query, tunedAdditional, myTable])

  const serverFetchProps: serverFetchProps = useMemo(
    () => ({
      prismaDataExtractionQuery,
      DetailePageId: null,
      dataModelName: models.children,
      additional: tunedAdditional,
      myTable,
      include: tunedAdditional?.include ? tunedAdditional?.include : undefined,
      session: null,
      easySearchExtraProps: props.easySearchExtraProps ?? null,
    }),
    [prismaDataExtractionQuery, models.children, tunedAdditional, myTable, props.easySearchExtraProps]
  )

  const UseRecordsReturn = useRecords({
    serverFetchProps,
    initialModelRecords: undefined,
    fetchTime: undefined,
  })

  const {records, setrecords, mutateRecords, deleteRecord, totalCount, easySearchPrismaDataOnServer} = UseRecordsReturn

  const hasEasySearch = useMemo(
    () => Object.keys(easySearchPrismaDataOnServer?.availableEasySearchObj || {}).length > 0,
    [easySearchPrismaDataOnServer?.availableEasySearchObj]
  )

  const {formData, setformData} = useInitFormState(null, [], false, dataModelName)

  const toggleLoadFunc = useMemo(
    () => props.additional?.toggleLoadFunc ?? (async cb => await cb()),
    [props.additional?.toggleLoadFunc]
  )

  const tableFormProps = useMemo(
    () => ({
      params: params as any,
      easySearchPrismaDataOnServer: easySearchPrismaDataOnServer,
      prismaDataExtractionQuery,
      dataModelName,
      columns,

      formData,
      setformData,
      records,
      setrecords,
      mutateRecords,
      deleteRecord,
      totalCount,
      myTable,
      myForm,
      additional: {...tunedAdditional, toggleLoadFunc},
      EditForm,
      editType,
      useGlobalProps,
      UseRecordsReturn,
    }),
    [
      params,
      easySearchPrismaDataOnServer,
      prismaDataExtractionQuery,
      dataModelName,
      columns,
      formData,
      setformData,
      records,
      setrecords,
      mutateRecords,
      deleteRecord,
      totalCount,
      myTable,
      myForm,
      tunedAdditional,
      toggleLoadFunc,
      EditForm,
      editType,
      useGlobalProps,
      UseRecordsReturn,
    ]
  )

  return (
    <div className={`w-fit`}>
      {!ParentData?.id ? (
        (NoDatawhenParentIsUndefined?.() ?? <NoData>データ作成後に登録可能</NoData>)
      ) : (
        <C_Stack>
          {hasEasySearch && (
            <div>
              <EasySearcher
                dataModelName={dataModelName}
                easySearchPrismaDataOnServer={easySearchPrismaDataOnServer}
                useGlobalProps={useGlobalProps}
                UseRecordsReturn={UseRecordsReturn}
              />
            </div>
          )}
          <TableForm {...tableFormProps} />
        </C_Stack>
      )}
    </div>
  )
})

export default ChildCreator
