import {handlePrismaError} from '@cm/lib/prisma-helper'
import prisma from 'src/lib/prisma'

import {NextRequest, NextResponse} from 'next/server'

import {getSelectId} from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/lib/MySelectMethods-server'
import {GetCaheOptionSWR_REQUEST_PARAMS} from '@cm/lib/server-actions/common-server-actions/serverGetCaheOptions'
import {colType} from '@cm/types/col-types'

export const POST = async (req: NextRequest) => {
  const isAllowed = true
  if (!isAllowed) return NextResponse.json({success: false, message: 'アクセスが禁止されています', result: null}, {status: 500})

  try {
    const options = await main(req)
    return NextResponse.json(options)
    //処理の実行
  } catch (error) {
    const errorMessage = handlePrismaError(error)
    console.error(error.stack)

    return NextResponse.json({success: false, message: errorMessage, error: error.message}, {status: 500})
  }
}

const main = async req => {
  const body = await req.json()

  const SWR_REQUEST_PARAMS: GetCaheOptionSWR_REQUEST_PARAMS[] = body.SWR_REQUEST_PARAMS

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

  return options
}
