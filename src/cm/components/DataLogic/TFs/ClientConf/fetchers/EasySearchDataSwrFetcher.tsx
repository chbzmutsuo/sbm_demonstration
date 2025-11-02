'use server'
import {easySearchPrismaDataOnServer} from '@cm/components/DataLogic/TFs/Server/fetchers/EasySearchDataSwrFetcher'
import {getEasySearchBtnCountData} from '@cm/lib/server-actions/common-server-actions/serverEasySearch'
import {getEasySearchPrismaDataOnServer} from 'src/cm/class/builders/QueryBuilderVariables'

export const EasySearchDataSwrFetcher = async ({dataModelName, additional, easySearchObject, query, searchQueryAnd}) => {
  const {queryArrays, availableEasySearchObj} = getEasySearchPrismaDataOnServer({
    query,
    dataModelName,
    easySearchObject,
    additionalWhere: additional?.where,
    searchQueryAnd,
  })

  const array = await getEasySearchBtnCountData({queryArrays})

  const result: easySearchPrismaDataOnServer = {
    dataCountObject: Object.fromEntries(array),
    availableEasySearchObj,
  }

  return result
}
