//classを切り替える

import {setCustomParams} from '@cm/components/DataLogic/helpers/SetCustomParams'

import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {PageBuilder} from '../../(builders)/TeamSynapseTopCC'
import {ColBuilder} from '../../(builders)/ColBuilder'
import {QueryBuilder} from '../../(builders)/QueryBuilder'

import {ViewParamBuilder} from '../../(builders)/ViewParamBuilder'
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

  //---------------個別設定-------------
  const customParams = await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: [`user`],
        setParams: async () => {
          return {
            additional: {
              payload: [],
              where: {apps: {has: ``}},
            },
          }
        },
      },
    ],
  })
  return customParams
}
