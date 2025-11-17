'use server'

import {handlePrismaError} from '@cm/lib/prisma-helper'

import {colType} from '@cm/types/col-types'
import {anyObject} from '@cm/types/utility-types'
import {getSelectId} from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/lib/MySelectMethods-server'
import {prismaMethodType, PrismaModelNames} from '@cm/types/prisma-types'
import prisma from 'src/lib/prisma'

export type usePrismaOnServerPropType = {
  model: PrismaModelNames
  method: prismaMethodType
  queryObject: any
  transactionPrisma?: any
}

export type GetCaheOptionSWR_REQUEST_PARAMS = usePrismaOnServerPropType & anyObject

export const serverGetCaheOptions = async (props: {SWR_REQUEST_PARAMS: GetCaheOptionSWR_REQUEST_PARAMS[]}) => {
  const {SWR_REQUEST_PARAMS} = props

  try {
    const options = {}
    await Promise.all(
      SWR_REQUEST_PARAMS.map(async props => {
        const {model, method, queryObject} = props
        const col = props.col as colType
        const selectId = getSelectId(col)

        const result = await prisma?.[model][method](queryObject)

        const optionObjArr = result
        options[selectId] = optionObjArr
      })
    )
    return options as any
    //処理の実行
  } catch (error) {
    const errorMessage = handlePrismaError(error)
    console.error(error.stack)
    console.error({errorMessage})
    return {success: false, message: errorMessage, error: error.message}
  }
}
