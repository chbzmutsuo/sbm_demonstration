import {NextRequest, NextResponse} from 'next/server'

import {anyObject} from '@cm/types/utility-types'
import {prismaMethodType, PrismaModelNames} from '@cm/types/prisma-types'
import {isRouteAccessAllowed} from '@app/api/prisma/isAllowed'
import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

export const POST = async (req: NextRequest) => {
  if (await isRouteAccessAllowed(req)) {
    const body = (await req.json()) as {
      model: PrismaModelNames
      method: prismaMethodType
      queryObject: anyObject
      transactionQueryList: transactionQuery<any, any>[]
      fetchKey?: string
      transactionPrisma?: any
    }

    const result = await doStandardPrisma(
      //
      body.model,
      body.method,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      body.queryObject,
      body.transactionPrisma
    )

    return NextResponse.json(result)
  } else {
    return NextResponse.json({success: false, message: 'アクセスが禁止されています', result: null}, {status: 200})
  }
}
