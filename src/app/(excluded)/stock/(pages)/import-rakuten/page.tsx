'use client'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, Padding, R_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import React from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {toast} from 'react-toastify'
import useFileUploadPropsOptimized from '@cm/hooks/useFileUpload/useFileUploadPropsOptimized'

export default function page() {
  const {toggleLoad} = useGlobal()
  const {
    fileArrState,
    component: {FileUploaderMemo},
  } = useFileUploadPropsOptimized({
    maxFiles: 1,
    readAs: 'readAsText',
    charset: 'shift-jis',
    accept: {
      'text/csv': ['.csv'],
    },
  })

  const csvData = fileArrState[0]?.fileContent ?? []
  const firstHeaderRow = csvData.findIndex(d => d[0] === '種別')
  const headerRow = csvData[firstHeaderRow]
  const dataRows = csvData.slice(firstHeaderRow + 1)

  const DataSample = () => {
    const header = [
      '種別',
      '銘柄コード・ティッカー',
      '銘柄',
      '口座',
      '保有数量',
      '［単位］',
      '平均取得価額',
      '［単位］',
      '現在値',
      '［単位］',
      '現在値(更新日)',
      '(参考為替)',
      '前日比',
      '［単位］',
      '時価評価額[円]',
      '時価評価額[外貨]',
      '評価損益[円]',
      '評価損益[％]',
    ]

    return (
      <div>
        {CsvTable({
          records: dataRows.map(row => {
            const [...cols] = row

            return {
              csvTableRow: headerRow.map((header, i) => {
                const label = header
                let value = row[i]
                const toNum = Number(value)

                value = isNaN(toNum) ? value : toNum

                return {
                  label,
                  cellValue: value,
                  style: {
                    fontSize: 10,
                    minWidth: 120,
                  },
                }
              }),
            }
          }),
        }).WithWrapper({})}
      </div>
    )
  }

  return (
    <Padding>
      <C_Stack className={` items-center`}>
        <R_Stack>
          <div>{FileUploaderMemo}</div>
          <Button
            onClick={async () => {
              toggleLoad(async () => {
                const res = await doTransaction({
                  transactionQueryList: dataRows
                    .filter(d => d[0] === '国内株式')
                    .map(data => {
                      const [種別, Code, companyName, account, heldCount, unit, averageBuyPrice, ...rest] = data

                      return {
                        model: `stock`,
                        method: `update`,
                        queryObject: {
                          where: {Code: `${Code}0`},
                          data: {
                            favorite: 1,
                            heldCount: Number(heldCount),
                            averageBuyPrice: Number(averageBuyPrice),
                          },
                        },
                      }
                    }),
                })
                toast.success(res.message)
              })
            }}
          >
            保有数量等を連携
          </Button>
        </R_Stack>
        {csvData && <DataSample />}
        <div></div>
      </C_Stack>
    </Padding>
  )
}
