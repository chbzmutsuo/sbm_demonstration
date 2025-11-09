'use client'
import {tbmMonthlyConfigForRouteGroupBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/tbmMonthlyConfigForRouteGroupBuilder'
import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'
import {TimeHandler} from '@app/(apps)/tbm/(class)/TimeHandler'

import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'
import {createUpdate} from '@cm/lib/methods/createUpdate'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {useEffect, useState} from 'react'
import {toast} from 'react-toastify'
import {colType} from '@cm/types/col-types'

const timeVlidator = (value: string) => {
  if (value) {
    const {isValid, error} = TimeHandler.validateTimeString(value)
    return error ?? undefined
  }
}
const timeFormatter = (value: string) => {
  if (value) {
    return TimeHandler.formatTimeString(value, 'display')
  }
  return ''
}

export const TbmRouteGroupColBuilder = (props: columnGetterType) => {
  const {yearMonth, showMonthConfig = false, tbmBaseId} = props.ColBuilderExtraProps ?? {}

  const {useGlobalProps} = props

  const regularStyle = {color: `#43639a`, fontSize: 14}

  let colsource: colType[] = [
    ...new Fields([
      {
        id: 'code',
        label: 'CD',
        form: {defaultValue: null},
        td: {style: {...regularStyle, minWidth: 75}},
        search: {},
      },
      {
        id: 'serviceNumber',
        label: '服務番号',
        form: {defaultValue: null},
        td: {style: {...regularStyle, minWidth: 85}},
        search: {},
      },

      {
        id: 'tbmBaseId',
        label: '営業所',
        forSelect: {},
        form: {
          ...defaultRegister,
          defaultValue: tbmBaseId,
          disabled: tbmBaseId,
        },
        td: {style: {...regularStyle, minWidth: 120}},
      },
      {
        id: `_shareBaseIds`,
        label: `共有先営業所`,
        td: {style: {...regularStyle, minWidth: 160}},
        form: {hidden: true},

        format: (val, routeGroup) => {
          const shares = routeGroup.TbmRouteGroupShare || []
          if (shares.length === 0) return ''

          if (routeGroup.isShared) {
            const shareCount = routeGroup.TbmRouteGroupShare?.length || 0
            return (
              <div className={`flex flex-col`}>
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full bg-yellow-400"></div>
                  <span className="text-xs text-yellow-700">共有中({shareCount})</span>
                </div>
                <div className="text-xs">{shares.map(share => share.TbmBase?.name).join(', ')}</div>
              </div>
            )
          }
        },
      },
      {
        id: 'seikyuKbn',
        label: '区分',
        td: {style: {...regularStyle, minWidth: 180, fontSize: 12}},
        form: {...defaultRegister, defaultValue: `01`},
        forSelect: {codeMaster: TBM_CODE.ROUTE_KBN},
      },
      {
        id: 'name',
        label: '便名',
        td: {style: {...regularStyle, minWidth: 200}},
        form: {...defaultRegister},
        search: {},
      },
      {
        id: 'routeName',
        label: '路線名',
        td: {style: {...regularStyle, minWidth: 200}},
        form: {},
        search: {},
      },
    ]).buildFormGroup({groupName: '便設定①'}).plain,
    ...new Fields([
      {
        id: 'departureTime',
        label: '出発時刻',
        type: 'text',
        td: {style: {...regularStyle, minWidth: 80}},
        inputProps: {
          placeholder: '0800',
          minLength: 4,
          maxLength: 4,
        },
        form: {register: {validate: timeVlidator}},
        format: timeFormatter,
      },
      {
        id: 'finalArrivalTime',
        label: '最終到着',
        type: 'text',
        td: {style: {...regularStyle, minWidth: 100}},
        inputProps: {
          placeholder: '1200',
          minLength: 4,
          maxLength: 4,
        },
        form: {register: {validate: timeVlidator}},
        format: timeFormatter,
      },
      {
        id: 'allowDuplicate',
        label: '重複許可',
        type: 'boolean',
        td: {style: {...regularStyle, minWidth: 80}},
        form: {defaultValue: false},
        format: val => (val ? '○' : ''),
      },
      {
        id: 'vehicleType',
        label: '車種',
        type: 'text',
        td: {style: {...regularStyle, minWidth: 60}},
        form: {},
      },
      // {
      //   id: 'delegatePattern',
      //   label: '委託パターン',
      //   td: {style: {...regularStyle, minWidth: 200}},
      //   form: {hidden: true},
      // },
      {
        id: `productName`,
        label: `品名`,
        td: {style: {...regularStyle, minWidth: 60}},
        form: {},
      },

      {
        id: `tbmCustomerId`,
        label: `取引先`,
        td: {style: {...regularStyle, minWidth: 200}},
        form: {
          defaultValue: ({alreadyRegisteredFormData, formData, col}) => {
            return formData?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.id
          },
        },
        forSelect: {},

        format: (val, routeGroup) => {
          return <div>{routeGroup.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.name}</div>
        },
      },
    ]).buildFormGroup({groupName: '便設定②'}).plain,
  ]

  if (showMonthConfig) {
    colsource = [
      ...colsource,

      ...tbmMonthlyConfigForRouteGroupBuilder({useGlobalProps})
        .flat()
        .map(col => {
          const dataKey = col.id
          return {
            id: dataKey,
            label: col.label,
            format: (val, row) => {
              if (col.format) {
                return col.format(val, row, col)
              }

              const MonthConfig = row?.TbmMonthlyConfigForRouteGroup.sort((a, b) => -(a.id - b.id))?.[0]

              const defaultValue = MonthConfig?.[dataKey] ?? ''
              const [value, setvalue] = useState<any>(null)

              useEffect(() => {
                setvalue(defaultValue)
              }, [defaultValue])

              const unique_yearMonth_tbmRouteGroupId = {yearMonth, tbmRouteGroupId: row.id}
              const style = col.td?.style

              return (
                <input
                  style={style}
                  type={col.type}
                  className={`control-border  pl-1 ${value ? '' : ' opacity-30'}`}
                  onChange={e => setvalue(e.target.value)}
                  onBlur={async e => {
                    const value = col.type === `number` ? Number(e.target.value) : e.target.value

                    const res = await doStandardPrisma(`tbmMonthlyConfigForRouteGroup`, `upsert`, {
                      where: {unique_yearMonth_tbmRouteGroupId},
                      ...createUpdate({
                        ...unique_yearMonth_tbmRouteGroupId,
                        [dataKey]: value ?? '',
                      }),
                    })

                    if (res.success === false) {
                      toast.error(res.message)
                    }
                  }}
                  value={value ?? ''}
                />
              )
            },
          }
        }),
    ]
  }

  return new Fields([...colsource]).transposeColumns()
}
