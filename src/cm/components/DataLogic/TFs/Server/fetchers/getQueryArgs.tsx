import {makePrismaDataExtractionQuery} from '@cm/components/DataLogic/TFs/ClientConf/makePrismaDataExtractionQuery'

import {getEasySearchWhereAnd} from '@cm/class/builders/QueryBuilderVariables'
import {SearchQuery} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/search-methods'
import {P_Query} from '@cm/class/PQuery'
import {getMyTableId} from '@cm/components/DataLogic/TFs/MyTable/helpers/getMyTableId'

export const getQueryArgs = ({
  dataModelName,
  query,
  additional,
  myTable,
  DetailePageId,
  include,
  easySearchObject,
  disableOrderByFromUrlParams,
}) => {
  const {page, take, skip} = P_Query.getPaginationPropsByQuery({
    query,
    tableId: getMyTableId({dataModelName, myTable}),
    countPerPage: myTable?.pagination?.countPerPage,
  })

  const searchQueryAnd: any = SearchQuery.createWhere({dataModelName, query: query})
  const easySearchWhereAnd = getEasySearchWhereAnd({
    easySearchObject,
    query,
    additionalWhere: {...additional?.where},
  })

  const prismaDataExtractionQuery = makePrismaDataExtractionQuery({
    disableOrderByFromUrlParams,
    query,
    dataModelName,
    additional,
    myTable,
    DetailePageId,
    include,
    take,
    skip,
    page,
    easySearchWhereAnd,
    searchQueryAnd,
  })

  return {prismaDataExtractionQuery, easySearchWhereAnd, searchQueryAnd}
}
