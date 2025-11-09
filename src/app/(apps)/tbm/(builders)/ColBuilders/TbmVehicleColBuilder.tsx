'use client'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'
import {TbmFuelCard, TbmVehicleMaintenanceRecord} from '@prisma/client'
import ShadPopover from '@cm/shadcn/ui/Organisms/ShadPopover'
import {VehicleCl} from '@app/(apps)/tbm/(class)/VehicleCl'

export const TbmVehicleColBuilder = (props: columnGetterType) => {
  return new Fields([
    ...new Fields([
      ...new Fields([
        // {id: 'code', label: 'コード', form: {...defaultRegister}},
        {id: 'frameNo', label: 'フレームNo', form: {...defaultRegister}, search: {}},
        {id: 'tbmBaseId', label: '営業所', forSelect: {}, form: {...defaultRegister}},
        {id: 'vehicleNumber', label: '車両番号', form: {...defaultRegister}, search: {}},
        {id: 'shodoTorokubi', label: '初度登録日', form: {}, type: `date`},
      ]).showSummaryInTd({
        wrapperWidthPx: 200,
      }).plain,
    ]).buildFormGroup({groupName: '車両情報①'}).plain,
    ...new Fields([
      ...new Fields([
        {id: 'type', label: '車種', form: {}, search: {}},
        {id: 'name', label: '車名', form: {}, search: {}},
        {id: 'shape', label: '形状', form: {}},
        {id: 'airSuspension', label: 'エアサス有無', form: {}},
      ]).showSummaryInTd({wrapperWidthPx: 200}).plain,
    ]).buildFormGroup({groupName: '車両情報②'}).plain,

    ...new Fields([
      {id: 'oilTireParts', label: '油脂/タイヤ/備品代', form: {}},
      {id: 'maintenance', label: '整備代', form: {}},
      {id: 'insurance', label: '保険代', form: {}},
      {id: 'sakenManryobi', label: '車検満了日', form: {}, type: 'date'},
    ])
      .showSummaryInTd({labelWidthPx: 120, wrapperWidthPx: 200})
      .buildFormGroup({groupName: '車両情報③'}).plain,

    ...new Fields([
      {id: 'jibaisekiHokenCompany', label: '自賠責(会社)', form: {}},
      {id: 'jibaisekiManryobi', label: '自賠責保険(満了日)', form: {}, type: 'date'},
      {id: 'jidoshaManryobi', label: '自動車保険(満了日)', form: {}, type: 'date'},
      {id: 'jidoshaHokenCompany', label: '自動車保険(会社)', form: {}},

      //
    ])
      .showSummaryInTd({labelWidthPx: 130, wrapperWidthPx: 220})
      .buildFormGroup({groupName: '保険情報①'}).plain,

    ...new Fields([
      //
      {id: 'kamotsuHokenCompany', label: '貨物保険\n(会社)', form: {}},
      {id: 'kamotsuManryobi', label: '貨物保険\n(満了日)', form: {}, type: 'date'},
      {id: 'sharyoHokenCompany', label: '車両保険\n(会社)', form: {}},
      {id: 'sharyoManryobi', label: '車両保険\n(満了日)', form: {}, type: 'date'},
    ])
      .showSummaryInTd({labelWidthPx: 130, wrapperWidthPx: 220})
      .buildFormGroup({groupName: '保険情報②'}).plain,

    ...new Fields([
      //
      {id: 'etcCardNumber', label: 'ETCカード番号', form: {}},
      {id: 'etcCardExpiration', label: 'ETCカード満', form: {}, type: 'date'},

      {
        id: 'sokoKyori',
        label: '走行距離',
        form: {hidden: true},
        format: (value, row) => {
          return `自動計算`
        },
      },

      {
        id: 'maintenanceRecord',
        label: '整備記録',
        form: {hidden: true},
        format: (value, row) => {
          const {TbmVehicleMaintenanceRecord} = row

          return (
            <ShadPopover {...{PopoverTrigger: `${TbmVehicleMaintenanceRecord.length}件`}}>
              <div>
                {TbmVehicleMaintenanceRecord?.map((item: TbmVehicleMaintenanceRecord) => {
                  return (
                    <div className={` grid grid-cols-3 gap-1`} key={item.id}>
                      <div>{item.type}</div>
                      <div>{formatDate(item.date, 'short')}</div>
                      <div>{item.title}</div>
                    </div>
                  )
                })}
              </div>
            </ShadPopover>
          )
        },
      },
      {
        id: 'fuelCard',
        label: '燃料カード',
        form: {hidden: true},
        format: (value, row) => {
          const {TbmFuelCard} = row ?? {}

          return (
            <ShadPopover {...{PopoverTrigger: `${TbmFuelCard?.length ?? 0}件`}}>
              <div>
                {TbmFuelCard?.map((item: TbmFuelCard) => {
                  return (
                    <div className={` grid grid-cols-3 gap-1`} key={item.id}>
                      <div>{item.name}</div>
                      <div>{formatDate(item.startDate, 'short')}</div>
                      <div>{formatDate(item.endDate, 'short')}</div>
                    </div>
                  )
                })}
              </div>
            </ShadPopover>
          )
        },
      },
    ])
      .showSummaryInTd({})
      .buildFormGroup({groupName: 'ETCカード情報'}).plain,

    // ...new Fields([
    //   //

    //   {
    //     id: 'sankagetsuTenkenbi',
    //     label: '3ヶ月点検',
    //     form: {hidden: true},
    //     format: (value, row) => {
    //       const {TbmVehicleMaintenanceRecord} = row

    //       const lastInspection = TbmVehicleMaintenanceRecord.sort((a, b) => {
    //         return new Date(b.date).getTime() - new Date(a.date).getTime()
    //       }).find(item => item.type === '3ヶ月点検')

    //       if (lastInspection) {
    //         const nextInspection = Days.month.add(lastInspection.date, 3)
    //         return <div style={{minWidth: 140}}>{formatDate(nextInspection, 'short')}</div>
    //       }

    //       return `過去の点検なし`
    //     },
    //   },
    // ])
    //   .showSummaryInTd({})
    //   .buildFormGroup({groupName: '車両情報③'}).plain,
  ]).transposeColumns()
}

export const getVehicleForSelectConfig = VehicleCl.getVehicleForSelectConfig
