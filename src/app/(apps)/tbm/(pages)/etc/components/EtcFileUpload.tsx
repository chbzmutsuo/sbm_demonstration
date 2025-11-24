'use client'
import React, { useState, useRef, useMemo } from 'react'
import { Button } from '@cm/components/styles/common-components/Button'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { toastByResult } from '@cm/lib/ui/notifications'
import { FileIcon } from 'lucide-react'
import { CsvTable, bodyRecordsType } from '@cm/components/styles/common-components/CsvTable/CsvTable'

interface EtcFileUploadProps {
  onFileLoaded: (content: string) => void
  isLoading: boolean
  importAvailable: boolean
  onSubmit: () => void
}

/**
 * CSV文字列をパースしてCsvTable用の形式に変換
 */
const parseCsvToTableData = (csvContent: string): bodyRecordsType => {
  if (!csvContent.trim()) {
    return []
  }

  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '')
  if (lines.length === 0) {
    return []
  }

  return lines.map((line, rowIndex) => {
    // CSVの各セルをパース（カンマ区切り、ダブルクォート対応）
    const cells: string[] = []
    let currentCell = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // エスケープされたダブルクォート
          currentCell += '"'
          i++ // 次の文字をスキップ
        } else {
          // クォートの開始/終了
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        // カンマでセルを区切る
        cells.push(currentCell.trim())
        currentCell = ''
      } else {
        currentCell += char
      }
    }
    // 最後のセルを追加
    cells.push(currentCell.trim())

    return {
      csvTableRow: cells.map((cell, colIndex) => ({
        cellValue: cell,
        cellValueRaw: cell,
      })),
    }
  })
}

export const EtcFileUpload = (props: EtcFileUploadProps) => {
  const { onFileLoaded, isLoading, onSubmit, importAvailable } = props
  const [fileName, setFileName] = useState<string | null>(null)
  const [csvContent, setCsvContent] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CSVコンテンツをパースしてテーブルデータに変換
  const tableData = useMemo(() => {
    return parseCsvToTableData(csvContent)
  }, [csvContent])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // CSVファイルかどうかをチェック
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toastByResult({ success: false, message: 'CSVファイルを選択してください' })
      return
    }

    setFileName(file.name)

    // ファイルを読み込む
    const reader = new FileReader()
    reader.onload = event => {
      if (event.target?.result) {
        const content = event.target.result.toString()

        // Shift-JISエンコードされたCSVファイルを適切に処理
        // ブラウザ環境では文字コード変換が難しいため、サーバーサイドで処理するか
        // 文字化けしたままでも構造を解析できるようにする

        setCsvContent(content)
        onFileLoaded(content)
      }
    }
    reader.onerror = () => {
      toastByResult({ success: false, message: 'ファイルの読み込みに失敗しました' })
    }
    reader.readAsText(file, 'Shift_JIS') // Shift-JISエンコードを指定
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <C_Stack className="gap-4">
      <R_Stack className="gap-2 items-start">
        {/* //アップロード内容 */}
        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" style={{ display: 'none' }} />
          <Button onClick={handleButtonClick} disabled={isLoading}>
            {isLoading ? 'アップロード中...' : 'CSVファイルを選択'}
          </Button>

          {fileName && (
            <R_Stack className="items-center gap-1 text-sm text-gray-600">
              <FileIcon size={16} />
              <span>{fileName}</span>
            </R_Stack>
          )}
        </div>

        {/* アップロード実施ボタン */}
        {fileName && (
          <Button
            disabled={!importAvailable}
            onClick={onSubmit} color="red">
            {isLoading ? 'インポート中...' : 'インポート実施'}
          </Button>
        )}
      </R_Stack>

      {/* CSVデータのプレビュー */}
      {csvContent && tableData.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">アップロードデータの確認</h3>
          <p className="text-sm text-gray-600 mb-2">
            {tableData.length}行のデータが読み込まれました。内容を確認してからインポート実施ボタンを押してください。
          </p>
          {CsvTable({
            records: tableData,
          }).WithWrapper({})}
        </div>
      )}
    </C_Stack>
  )
}
