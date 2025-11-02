// 'use server'

// import {SearchQuery} from '@components/DataLogic/TFs/MyTable/TableHandler/SearchHandler/search-methods'

// import {getEasySearchWhereAnd} from '@class/builders/QueryBuilderVariables'

// import {makePrismaDataExtractionQuery} from '@components/DataLogic/TFs/ClientConf/makePrismaDataExtractionQuery'
// import {getMyTableId} from '@components/DataLogic/TFs/MyTable/getMyTableId'
// import {P_Query} from '@class/PQuery'
// import {makeEasySearcherQuery} from '@components/DataLogic/TFs/ClientConf/makeEasySearcherQuery'

// import {EasySearchDataSwrFetcher} from '@components/DataLogic/TFs/ClientConf/fetchers/EasySearchDataSwrFetcher'
// import {prismaDataExtractionQueryType} from '@components/DataLogic/TFs/Server/Conf'
// import {searchByQuery} from '@lib/server-actions/common-server-actions/SerachByQuery/SerachByQuery'
// import {EasySearchBuilderCollection} from 'src/non-common/EsCollection/EasySearchBuilderCollection'

// export type serverFetchProps = {
//   withEasySearch?: boolean
//   DetailePageId
//   dataModelName
//   additional
//   myTable
//   include
//   session
//   easySearchExtraProps

//   prismaDataExtractionQuery?: prismaDataExtractionQueryType
// }

// export const getInitModelRecordsProps = async (props: serverFetchProps & {query: any; rootPath: string; env: string}) => {
//   const {
//     DetailePageId,

//     dataModelName,
//     additional,
//     myTable,
//     include,
//     session,
//     easySearchExtraProps,
//     withEasySearch = true,
//     query,
//     rootPath,
//     env,
//   } = props

//   const {page, take, skip} = P_Query.getPaginationPropsByQuery({
//     query,
//     tableId: getMyTableId({dataModelName, myTable}),
//     countPerPage: myTable?.pagination?.countPerPage,
//   })

//   const EasySearchBuilder = withEasySearch ? EasySearchBuilderCollection[rootPath] : undefined

//   if (!EasySearchBuilder) {
//     console.warn(`EasySearchBuilder not found or withEasySearch is false for rootPath`, {rootPath})
//   }
//   const EasySearchBuilderFunc = await EasySearchBuilder?.()

//   const easySearchObject = await EasySearchBuilderFunc?.[dataModelName]?.({
//     additionalWhere: additional?.where,
//     session,
//     query,
//     dataModelName,
//     easySearchExtraProps: easySearchExtraProps,
//   })

//   const searchQueryAnd: any = SearchQuery.createWhere({dataModelName, query: query})

//   const easySearchWhereAnd = getEasySearchWhereAnd({
//     easySearchObject,
//     query,
//     additionalWhere: {...additional?.where},
//   })

//   const prismaDataExtractionQuery =
//     props.prismaDataExtractionQuery ??
//     makePrismaDataExtractionQuery({
//       query,
//       dataModelName,
//       additional,
//       myTable,
//       DetailePageId,
//       include,
//       take,
//       skip,
//       page,
//       easySearchWhereAnd,
//       searchQueryAnd,
//     })

//   const EasySearcherQuery = await makeEasySearcherQuery({
//     EasySearchBuilder,
//     dataModelName,
//     additional,
//     session,
//     query,
//     easySearchExtraProps,
//   })

//   const {records, totalCount} = await searchByQuery({modelName: dataModelName, prismaDataExtractionQuery})

//   const easySearchPrismaDataOnServer = await EasySearchDataSwrFetcher(EasySearcherQuery)

//   return {
//     queries: {
//       easySearchObject,
//       EasySearcherQuery,
//       prismaDataExtractionQuery,
//     },
//     data: {
//       records,
//       totalCount,
//       easySearchPrismaDataOnServer,
//     },
//   }
// }
