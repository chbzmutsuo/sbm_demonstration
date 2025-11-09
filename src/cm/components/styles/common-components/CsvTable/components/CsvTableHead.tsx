import {bodyRecordsType, stylesInColumns} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import {Counter} from '@cm/components/styles/common-components/Table'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import {cl} from '@cm/lib/methods/common'

export type CsvTableHeadProps = {
  headerRecords: bodyRecordsType
  stylesInColumns?: stylesInColumns
}

export function CsvTableHead(props: CsvTableHeadProps) {
  const hasHeader = props.headerRecords?.some(d => d.csvTableRow.some(cell => cell.cellValue))

  if (hasHeader === false) {
    return null
  }

  return (
    <thead>
      {props.headerRecords?.map((row, rowIdx) => {
        const {csvTableRow, ...restPropsOnTr} = row

        return (
          <tr key={rowIdx} {...restPropsOnTr} className={[restPropsOnTr?.className].join(` `)}>
            {csvTableRow.map((cell, celIdx) => {
              const stylesInThisColumn = props?.stylesInColumns?.[celIdx]

              const {cellValue, style, thStyle, className, cellValueRaw, ...restPropsOnTd} = cell ?? {}

              const isNumber = typeof cellValue === 'number'
              const isString = typeof cellValue === 'string'

              if (cell?.colSpan === 0) {
                return null
              }

              return (
                <th
                  key={celIdx}
                  {...restPropsOnTd}
                  {...{
                    style: {...stylesInThisColumn?.style, ...style, ...thStyle},
                    className: cl(`text-center!`, stylesInThisColumn?.className, className),
                  }}
                >
                  {isNumber ? (
                    <Counter>{cellValue}</Counter>
                  ) : isString ? (
                    <MarkDownDisplay>{cellValue}</MarkDownDisplay>
                  ) : (
                    cellValue
                  )}
                </th>
              )
            })}
          </tr>
        )
      })}
    </thead>
  )
}
