import {Fields} from 'src/cm/class/Fields/Fields'

import {columnGetterType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'
import {Absolute, Vr} from 'src/cm/components/styles/common-components/common-components'
import {LabelValue} from '@cm/components/styles/common-components/ParameterCard'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getColorStyles} from '@cm/lib/methods/colors'

export const defaultRegister = {register: {required: '必須'}}
export const textAreaDefaultStyle = {width: 600, height: 150}

export const dynamicMasterModel = (props: columnGetterType & {dataModelName: string}) => {
  const col1: colType[] = [
    {id: 'name', label: '名称', type: 'text', form: {register: {required: '必須'}}, td: {style: {minWidth: 100}}},
  ]
  if (String(props?.dataModelName)?.includes(`Master`)) {
    col1.push({id: 'color', label: '色', type: 'color', form: {register: {required: '必須'}}})
  }
  const data: colType[] = col1
  return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
}

export const editableTd = {
  td: {editable: {}},
}

export const dateFormatter = props => {
  const {value, prefix = ``, width = 80} = props
  return (
    <div className={`w-[${width}px]`}>
      <span>{prefix}</span>
      <span className={` inline-block `}>{formatDate(value, `YY/M/D(ddd)`)}</span>
    </div>
  )
}

export const dividerCol = ({label, color}) => {
  return new Fields([
    {
      id: `divider_${label}`,
      label: ``,
      form: {hidden: true},
      format: () => {
        return (
          <Vr
            {...{
              style: {backgroundColor: color},
              className: ` relative h-[150px] w-[5px] `,
            }}
          >
            <Absolute>
              <div className={`py-2`}>
                <div
                  {...{style: {...getColorStyles(color)}}}
                  className={`shadow-xs z-10 rounded  py-2  text-[10px]  font-bold
              `}
                >
                  {label}
                </div>
              </div>
            </Absolute>
          </Vr>
        )
      },
    },
  ]).plain
}

export const TableInfoWrapper = (props: {showShadow?: boolean; label?: any; children: any}) => {
  const {showShadow, label, children} = props
  return (
    <div className={showShadow ? `px-1 ` : ``}>
      {label && <small className={`text-sm font-bold  text-gray-900`}>{label}</small>}
      <div>{children}</div>
    </div>
  )
}

export const TableInfo = (props: {label; children?: any; value?: any; labelWidthPx?: number; wrapperWidthPx?: number}) => {
  const {label, children, value, labelWidthPx = 50, wrapperWidthPx = 200} = props

  const valueWidth = wrapperWidthPx - labelWidthPx

  return (
    <LabelValue
      {...{
        label,
        styling: {
          styles: {
            wrapper: {width: wrapperWidthPx},
            label: {minWidth: labelWidthPx},
          },
          classes: {wrapper: `!text-sm min-h-[25px] `},
        },
      }}
    >
      <div
        style={{
          maxWidth: valueWidth,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:  'nowrap',
        }}
      >
        <>{children ?? value}</>
      </div>
    </LabelValue>
  )
}
