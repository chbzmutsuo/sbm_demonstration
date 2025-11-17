import {useState} from 'react'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {createUpdate} from '@cm/lib/methods/createUpdate'

export const useEtcData = () => {
  const [etcRawData, setEtcRawData] = useState<EtcRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // CSVデータをインポートする関数
  const importCsvData = async (data: {tbmVehicleId: number; month: Date; csvData: string}) => {
    setIsLoading(true)
    try {
      const {tbmVehicleId, month, csvData} = data

      if (!tbmVehicleId || !month || !csvData) {
        toastByResult({success: false, message: '必要な情報がすべて入力されていません'})
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

            const parsedFromDate = parseJapaneseDate(fromDate)
            const parsedToDate = parseJapaneseDate(toDate)

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
        loadEtcRawData(tbmVehicleId, month)
      }
    } catch (error) {
      console.error('インポート中にエラーが発生しました:', error)
      toastByResult({success: false, message: 'インポート中にエラーが発生しました'})
    } finally {
      setIsLoading(false)
    }
  }

  // EtcCsvRawデータをロードする関数
  const loadEtcRawData = async (vehicleId: number, month: Date) => {
    setIsLoading(true)
    try {
      const yearMonth = new Date(month)
      const year = yearMonth.getFullYear()
      const monthNum = yearMonth.getMonth()

      const startDate = new Date(year, monthNum, 1)
      const endDate = new Date(year, monthNum + 1, 0)

      const {result} = await doStandardPrisma('etcCsvRaw', 'findMany', {
        where: {
          tbmVehicleId: vehicleId,
          fromDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: [{fromDate: 'asc'}, {fromTime: 'asc'}],
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

      setEtcRawData(result || [])
    } catch (error) {
      console.error('データ取得中にエラーが発生しました:', error)
      toastByResult({success: false, message: 'データ取得中にエラーが発生しました'})
    } finally {
      setIsLoading(false)
    }
  }

  return {
    etcRawData,
    isLoading,
    importCsvData,
    loadEtcRawData,
  }
}
