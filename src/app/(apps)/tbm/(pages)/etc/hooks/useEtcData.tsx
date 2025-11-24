import { useState } from 'react'
import { toastByResult } from '@cm/lib/ui/notifications'
import { doTransaction, transactionQuery } from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import { toUtc } from '@cm/class/Days/date-utils/calculations'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import { Days } from '@cm/class/Days/Days'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

export const useEtcData = ({ selectedTbmVehicleId, selectedMonth }: { selectedTbmVehicleId: number; selectedMonth: Date }) => {
  const { addQuery } = useGlobal()
  const [isLoading, setIsLoading] = useState(false)




  const { firstDayOfMonth, lastDayOfMonth } = selectedMonth ? Days.month.getMonthDatum(selectedMonth) : {}
  const { data: etcRawData = [], mutate } = useDoStandardPrisma('etcCsvRaw', 'findMany', {
    where: {
      tbmVehicleId: selectedTbmVehicleId,
      fromDate: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      },
    },
    orderBy: [{ fromDate: 'asc' }, { fromTime: 'asc' }],
    include: {
      TbmEtcMeisai: {
        include: {
          TbmDriveSchedule: {
            include: {
              TbmRouteGroup: true,
              User: true,
            },
          },
        },
      },
    },
  })


  let monthOnCsv: Date | null = null

  // CSVデータをインポートする関数
  const importCsvData = async (data: { tbmVehicleId: number; month: Date; csvData: string }) => {
    const { tbmVehicleId, csvData } = data

    setIsLoading(true)
    try {

      if (!tbmVehicleId || !csvData) {
        toastByResult({ success: false, message: '必要な情報がすべて入力されていません' })
        return
      }

      // CSVデータをパース
      const rows = csvData.trim().split('\n')
      const parsedData = rows
        .map((row, index) => {
          if (index === 0) return null // ヘッダー行をスキップ

          const columns = row.split(',')
          if (columns.length < 9) return null // 不正な行はスキップ

          try {
            // CSVの列構造: 利用開始日,利用開始時刻,利用終了日,利用終了時刻,利用ICなど,出口ICなど,元の料金,割引額,通行料金,車種,車両番号,ETCカード番号,備考
            const [
              fromDate,
              fromTime,
              toDate,
              toTime,
              fromIc,
              toIc,
              originalFee,
              discount,
              toll,
              carType,
              vehicleNumber,
              cardNumber,
              remark,
            ] = columns



            // 日付のパース（例: '25/08/01' → '2025-08-01'）
            const parseJapaneseDate = (dateStr: string) => {
              if (!dateStr) return null
              const [year, month, day] = dateStr.split('/')
              if (!year || !month || !day) return null
              return new Date(`20${year}-${month}-${day}`)
            }

            let parsedFromDate = parseJapaneseDate(fromDate)
            parsedFromDate = parsedFromDate ? toUtc(parsedFromDate) : null


            let parsedToDate = parseJapaneseDate(toDate)
            parsedToDate = parsedToDate ? toUtc(parsedToDate) : null

            if (!parsedFromDate || !parsedToDate) return null

            // 料金のパース
            const parseFee = (feeStr: string) => {
              if (!feeStr) return null
              const cleaned = feeStr.replace(/[^\d-]/g, '')
              return cleaned ? parseInt(cleaned, 10) : null
            }

            const parsedOriginalFee = parseFee(originalFee)
            const parsedDiscount = parseFee(discount)
            const parsedToll = parseFee(toll)



            //遷移先の月を設定
            if (monthOnCsv === null) {
              monthOnCsv = parsedFromDate
            }

            return {
              tbmVehicleId,
              fromDate: parsedFromDate,
              fromTime: fromTime || '',
              toDate: parsedToDate,
              toTime: toTime || '',
              fromIc: fromIc || '',
              toIc: toIc || '',
              originalFee: parsedOriginalFee,
              discountAmount: parsedDiscount,
              fee: parsedToll || 0,
              isGrouped: false,
              tbmEtcMeisaiId: null,
              // groupIndex: null, // デフォルトはグルーピングなし
              remark: remark || '', // 備考欄
              cardNumber: cardNumber || '', // ETCカード番号
              carType: carType || '', // 車種
            }
          } catch (e) {
            console.error('行のパースに失敗しました:', e, columns)
            return null
          }
        })
        .filter(Boolean)

      // データをDBに保存
      const transactionQueries: transactionQuery<'etcCsvRaw', 'upsert'>[] = parsedData.map(item => {
        return {
          model: 'etcCsvRaw',
          method: 'upsert',
          queryObject: {
            where: {
              unique_tbmVehicleId_fromDate_fromTime: {
                tbmVehicleId: item?.tbmVehicleId ?? 0,
                fromDate: item?.fromDate ?? new Date(),
                fromTime: item?.fromTime ?? '',
              },
            },
            create: item ?? {},
            update: item ?? {},
          },
        } as transactionQuery<'etcCsvRaw', 'upsert'>
      })

      const result = await doTransaction({
        transactionQueryList: transactionQueries,
      })

      toastByResult(result)

      if (result.success) {
        mutate()
      }
    } catch (error) {
      console.error('インポート中にエラーが発生しました:', error)
      toastByResult({ success: false, message: 'インポート中にエラーが発生しました' })
    } finally {
      setIsLoading(false)

      addQuery({
        month: formatDate(monthOnCsv, 'YYYY-MM-DD'),
      })

    }
  }

  // 選択中の月のデータを削除する関数
  const deleteMonthData = async (tbmVehicleId: number, month: Date) => {
    if (!confirm(`選択中の月（${formatDate(month, 'YYYY年MM月')}）のデータを削除しますか？\nこの操作は取り消せません。`)) {
      return
    }

    setIsLoading(true)
    try {
      const { firstDayOfMonth, lastDayOfMonth } = Days.month.getMonthDatum(month)

      // まず、削除対象のレコードを取得して、関連するTbmEtcMeisaiのIDを収集
      const { result: recordsToDelete } = await doStandardPrisma('etcCsvRaw', 'findMany', {
        where: {
          tbmVehicleId,
          fromDate: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
        select: {
          id: true,
          tbmEtcMeisaiId: true,
        },
      })

      // 関連するTbmEtcMeisaiのIDを取得（重複を除去）
      const meisaiIds = [...new Set((recordsToDelete || []).map((r: { tbmEtcMeisaiId: number | null }) => r.tbmEtcMeisaiId).filter((id): id is number => id !== null))]

      // etcCsvRawを削除
      const { result: deleteResult } = await doStandardPrisma('etcCsvRaw', 'deleteMany', {
        where: {
          tbmVehicleId,
          fromDate: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      })

      // 関連するTbmEtcMeisaiも削除（EtcCsvRawが紐づいていないもの）
      if (meisaiIds.length > 0) {
        await doStandardPrisma('tbmEtcMeisai', 'deleteMany', {
          where: {
            id: {
              in: meisaiIds as number[],
            },
          },
        })
      }

      toastByResult({
        success: true,
        message: `${(deleteResult as { count: number })?.count || 0}件のデータを削除しました`,
      })

      mutate()
    } catch (error) {
      console.error('データ削除中にエラーが発生しました:', error)
      toastByResult({ success: false, message: 'データ削除中にエラーが発生しました' })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    etcRawData,
    mutateEtcRawData: mutate,
    isLoading,
    importCsvData,
    deleteMonthData,
  }
}
