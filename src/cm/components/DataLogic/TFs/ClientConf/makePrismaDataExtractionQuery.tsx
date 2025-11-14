import {P_Query} from 'src/cm/class/PQuery'
import {prismaDataExtractionQueryType} from 'src/cm/components/DataLogic/TFs/Server/Conf'

export const makePrismaDataExtractionQuery = ({
  query,
  dataModelName,
  additional,
  easySearchWhereAnd,
  myTable,
  DetailePageId,
  include,
  take,
  skip,
  page,
  searchQueryAnd,
  disableOrderByFromUrlParams ,
}) => {
  const flexQuery = P_Query.createFlexQuery({
    query,
    dataModelName,
    myTable,
    additional,
    take,
    skip,
    page,
    disableOrderByFromUrlParams,
  })

  const where = DetailePageId
    ? {id: DetailePageId}
    : {
        AND: [...searchQueryAnd, ...flexQuery.AND, ...easySearchWhereAnd].filter(Boolean),
      }

  const orderBy = flexQuery.orderBy

  const prismaDataExtractionQuery: prismaDataExtractionQueryType = {
    ...flexQuery,
    select: additional?.select,
    where,
    include,
    orderBy,
  }

  return prismaDataExtractionQuery as prismaDataExtractionQueryType
}
