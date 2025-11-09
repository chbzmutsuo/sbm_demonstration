import {colType} from '@cm/types/col-types'
import {sqlResponse} from '@cm/class/SqlBuilder/useRawSql'

import {apiPath} from '@cm/lib/methods/common'
import {fetchAlt} from '@cm/lib/http/fetch-client'
import {DH__convertDataType} from '@cm/class/DataHandler/type-converter'

export const converDataForClient = (data, col) => {
  return DH__convertDataType(data, col.type, 'client')
}

export const isRelationalData = (col: colType) => {
  return col?.id?.includes('Id') && !Array.isArray(col?.forSelect?.optionsOrOptionFetcher)
}
export const judgeColType = (col: colType) => {
  if (isRelationalData(col)) {
    return 'selectId'
  } else {
    return col?.type ?? 'text'
  }
}

export const fetchRawSql = async ({sql}) => {
  const res: sqlResponse = await fetchAlt(`${apiPath}/prisma/raw`, {sql})
  return res
}
