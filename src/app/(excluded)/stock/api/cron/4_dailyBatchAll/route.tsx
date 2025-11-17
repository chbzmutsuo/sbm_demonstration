import {updateAlgorithm, upsertStockHistory} from '@app/(excluded)/stock/api/jquants-server-actions/jquants-getter'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {isDev} from '@cm/lib/methods/common'
import {NextRequest, NextResponse} from 'next/server'

export const GET = async (req: NextRequest) => {
  const params = await req.nextUrl.searchParams
  const date = toUtc(params.get('date') ?? new Date())
  try {
    if (!isDev) {
      await upsertStockHistory({date})
    }

    await updateAlgorithm({date})
    return NextResponse.json({
      date,
      message: '更新が完了しました。',
    })
  } catch (error) {
    console.error(error) //////////
    return NextResponse.json({
      date,
      message: '更新に失敗しました。',
    })
  }
}
