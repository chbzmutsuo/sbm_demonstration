//classを切り替える

import {setCustomParams} from '@cm/components/DataLogic/helpers/SetCustomParams'

import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {PageBuilder} from '@app/(excluded)/stock/(builders)/PageBuilder'
import {ColBuilder} from '@app/(excluded)/stock/(builders)/ColBuilder'
import {QueryBuilder} from '@app/(excluded)/stock/(builders)/QueryBuilder'

import {ViewParamBuilder} from '@app/(excluded)/stock/(builders)/ViewParamBuilder'
import {getMidnight, toUtc} from '@cm/class/Days/date-utils/calculations'
import {getStockConfig} from 'src/non-common/EsCollection/(stock)/getStockConfig'
import {getMasterPageCommonConfig} from '@cm/components/DataLogic/helpers/getMasterPageCommonConfig'

export default async function DynamicMasterPage(props) {
  return getMasterPageCommonConfig({
    nextPageProps: props,
    parameters,
    ColBuilder,
    ViewParamBuilder,
    PageBuilder,
    QueryBuilder,
  })
}

const parameters = async (props: {params; query; session; scopes: ReturnType<typeof getScopes>}) => {
  const {params, query, session, scopes} = props

  const config = await getStockConfig()

  //---------------個別設定-------------
  const customParams = await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: [`stock`],
        setParams: async () => {
          return {
            ColBuilderExtraProps: {config},
            myTable: {
              className: `[&_td]:!p-0`,
              style: {maxWidth: `98vw`, padding: 0},
              create: false,
              delete: false,
              update: false,
              showRecordIndex: false,
              useWrapperCard: false,
            },
            additional: {
              orderBy: [
                //
                {favorite: `desc`},
                {profit: {sort: `desc`, nulls: `last`}},
                {last_riseRate: `desc`},
                {Code: `asc`},
              ],
            },
          }
        },
      },
      {
        modelNames: [`stockHistory`],
        setParams: async () => {
          return {
            ColBuilderExtraProps: {config},
            additional: {
              where: {
                Date: getMidnight(toUtc(query.from ?? new Date())),
              },
              orderBy: [{Date: `desc`}, {Code: `asc`}],
            },
          }
        },
      },
    ],
  })
  return customParams
}
