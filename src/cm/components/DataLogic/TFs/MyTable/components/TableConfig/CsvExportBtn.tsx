'use client'

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {CSVLink} from 'react-csv'
import {TableConfigPropsType} from '@cm/components/DataLogic/TFs/MyTable/components/TableConfig'
import {ClientPropsType2} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import {generalDoStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

type CsvExportBtnProps = {
  TableConfigProps: TableConfigPropsType
  ClientProps2: ClientPropsType2
}

export default function CsvExportBtn({TableConfigProps, ClientProps2}: CsvExportBtnProps) {
  const {myTable, dataModelName, useGlobalProps} = TableConfigProps
  const {csvOutput} = myTable ?? {}
  const {query} = useGlobalProps
  const {UseRecordsReturn} = ClientProps2
  const {prismaDataExtractionQuery: currentQuery} = UseRecordsReturn ?? {}

  const linkRef = useRef<any>(null)
  const [csvDataArr, setcsvDataArr] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const linkId = useMemo(() => `csv-link-${Date.now()}`, [])

  const generateCsvData = useCallback(
    async (records: any[]) => {
      if (!csvOutput?.columns || records.length === 0) return []

      const csvDataArray = records.map(record => {
        const rowObj: any = {}
        csvOutput.columns.forEach((column, index) => {
          // keyの場合はrecordから値を取得
          const value = typeof column.format === 'function' ? column.format(record) : record[column.key]
          // labelが指定されていればそれを使用、なければkeyを使用
          const header = column.label || column.key
          rowObj[header] = value ?? ''
        })
        return rowObj
      })

      return csvDataArray
    },
    [csvOutput]
  )

  const handleExport = useCallback(async () => {
    if (!csvOutput || !currentQuery) return

    setIsLoading(true)
    try {
      // 現在のクエリからwhere条件を取得し、ページネーションを無視
      const csvQuery = {
        ...currentQuery,
        take: undefined,
        skip: undefined,
        page: undefined,
      }

      // 全件データを取得
      const result = await generalDoStandardPrisma(dataModelName, 'findMany', {
        where: csvQuery.where,
        include: csvQuery.include,
        orderBy: csvQuery.orderBy,
        select: csvQuery.select,
        omit: csvQuery.omit,
      })

      if (result.success && result.result) {
        const csvData = await generateCsvData(result.result)
        setcsvDataArr(csvData)
      } else {
        alert('CSVデータの取得に失敗しました')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('CSV export error:', error)
      alert('CSV出力中にエラーが発生しました')
      setIsLoading(false)
    }
  }, [csvOutput, currentQuery, dataModelName, generateCsvData])

  const outputCsv = useCallback(() => {
    if (csvDataArr.length > 0 && linkRef.current) {
      const link = document.getElementById(linkId)
      if (link) {
        link.click()
        alert('CSVファイルをダウンロードしました')
        setIsLoading(false)
      }
    }
  }, [csvDataArr, linkId])

  useEffect(() => {
    if (csvDataArr.length > 0) {
      outputCsv()
    }
  }, [csvDataArr, outputCsv])

  if (!csvOutput) return null

  return (
    <>
      <button onClick={handleExport} className={`t-link`} type="button" disabled={isLoading}>
        {isLoading ? 'CSV出力中...' : 'CSV'}
      </button>
      <CSVLink id={linkId} ref={linkRef} data={csvDataArr} filename={`${csvOutput.fileTitle}.csv`} />
    </>
  )
}
