'use server'
import {makeEasySearcherQuery} from '@cm/components/DataLogic/TFs/ClientConf/makeEasySearcherQuery'

import {EasySearchDataSwrFetcher} from '@cm/components/DataLogic/TFs/Server/fetchers/EasySearchDataSwrFetcher'
import {prismaDataExtractionQueryType} from '@cm/components/DataLogic/TFs/Server/Conf'
import {searchByQuery} from '@cm/lib/server-actions/common-server-actions/SerachByQuery/SerachByQuery'
import {EasySearchBuilderCollection} from 'src/non-common/EsCollection/EasySearchBuilderCollection'
import {getQueryArgs} from '@cm/components/DataLogic/TFs/Server/fetchers/getQueryArgs'

export type serverFetchProps = {
  withEasySearch?: boolean
  DetailePageId
  dataModelName
  additional
  myTable
  include
  session
  easySearchExtraProps

  prismaDataExtractionQuery?: prismaDataExtractionQueryType
}

export const getInitModelRecordsProps = async (props: serverFetchProps & {query: any; rootPath: string; env: string}) => {
  const {
    DetailePageId,

    dataModelName,
    additional,
    myTable,
    include,
    session,
    easySearchExtraProps,
    withEasySearch = true,
    query,
    rootPath,
    env,
  } = props

  const EasySearchBuilder = withEasySearch ? EasySearchBuilderCollection[rootPath] : undefined

  // if (!EasySearchBuilder) {
  //   console.warn(`EasySearchBuilder not found or withEasySearch is false for rootPath`, {rootPath})
  // }
  const EasySearchBuilderFunc = await EasySearchBuilder?.()

  const easySearchObject = await EasySearchBuilderFunc?.[dataModelName]?.({
    additionalWhere: additional?.where,
    session,
    query,
    dataModelName,
    easySearchExtraProps: easySearchExtraProps,
  })

  const {prismaDataExtractionQuery} = getQueryArgs({
    dataModelName,
    query,
    additional,
    myTable,
    DetailePageId,
    include,
    easySearchObject,
    disableOrderByFromUrlParams: false,
  })



  const EasySearcherQuery = await makeEasySearcherQuery({
    EasySearchBuilder,
    dataModelName,
    additional,
    session,
    query,
    easySearchExtraProps,
  })

  const {records, totalCount} = await searchByQuery({modelName: dataModelName, prismaDataExtractionQuery})

  const easySearchPrismaDataOnServer = await EasySearchDataSwrFetcher(EasySearcherQuery)
  // console.log({easySearchPrismaDataOnServer: Object.keys(easySearchPrismaDataOnServer.availableEasySearchObj)})

  return {
    queries: {
      easySearchObject,
      EasySearcherQuery,
      prismaDataExtractionQuery,
    },
    data: {
      records,
      totalCount,
      easySearchPrismaDataOnServer,
    },
  }
}
