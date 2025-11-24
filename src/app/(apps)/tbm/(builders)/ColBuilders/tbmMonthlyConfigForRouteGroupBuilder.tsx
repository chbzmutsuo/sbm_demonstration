'use client'

import TbmRouteCl, { TbmRouteData } from '@app/(apps)/tbm/(class)/TbmRouteCl'
import useUnchinChildCreator from '@app/(apps)/tbm/(globalHooks)/useUnchinChildCreator'
import { defaultRegister } from '@cm/class/builders/ColBuilderVariables'
import { NumHandler } from '@cm/class/NumHandler'
import { Fields } from '@cm/class/Fields/Fields'
import { columnGetterType } from '@cm/types/types'
import { KeyValue } from '@cm/components/styles/common-components/ParameterCard'

export const tbmMonthlyConfigForRouteGroupBuilder = (props: columnGetterType) => {
  const HK_UnchinChildCreator = useUnchinChildCreator()

  return new Fields([
    {
      id: 'seikyuKaisu',
      label: '請求回数\n(チェック用)',
      type: 'number',
      td: { style: { width: 100 } },
    },
    {
      id: 'tsukoryoSeikyuGaku',
      label: '通行料\n(郵便)',
      type: 'number',
      td: { style: { width: 100 } },
    },

    {
      id: 'generalFee',
      label: '通行料\n(一般)',
      type: 'number',
      td: { style: { width: 100 } },
    },

    {
      id: 'postalFee',
      label: `その他情報`,
      type: 'number',

      form: { hidden: true },
      format: (value, row: TbmRouteData) => {
        const { TbmDriveSchedule, TbmMonthlyConfigForRouteGroup } = row
        const monthConfig = TbmMonthlyConfigForRouteGroup?.[0]
        const TbmRouteInst = new TbmRouteCl(row)
        const { jitsudoKaisu } = TbmRouteInst.getMonthlyData(monthConfig?.yearMonth)

        const latestTbmRouteGroupFee = row.TbmRouteGroupFee[0]
        const { futaiFee = 0, driverFee = 0 } = latestTbmRouteGroupFee ?? {}

        return (
          <div style={{ width: 240 }} className={`grid grid-cols-2`}>
            <KeyValue {...{ label: '運賃' }}>{NumHandler.WithUnit(driverFee ?? 0, '')}</KeyValue>
            <KeyValue {...{ label: '実働回数' }}>{jitsudoKaisu}</KeyValue>
            <KeyValue {...{ label: '付帯作業' }}>{NumHandler.WithUnit(futaiFee ?? 0, '')}</KeyValue>

          </div>
        )
      },
    },
  ])
    .customAttributes(({ col }) => ({ ...col, form: { ...defaultRegister } }))
    .transposeColumns()
}
