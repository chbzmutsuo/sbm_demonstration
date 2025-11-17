import {upsertStockHistory} from '@app/(excluded)/stock/api/jquants-server-actions/jquants-getter'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {NextRequest, NextResponse} from 'next/server'

export const GET = async (req: NextRequest) => {
  const params = await req.nextUrl.searchParams

  const date = toUtc(params.get('date') ?? new Date())
  const data = await upsertStockHistory({date})
  return NextResponse.json({data})
}
