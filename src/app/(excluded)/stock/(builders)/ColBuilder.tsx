'use client'

import {StockCl} from 'src/non-common/EsCollection/(stock)/StockCl'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

import StockChart from '../(components)/StockChart'
import {NumHandler} from '@cm/class/NumHandler'
import {LabelValue} from '@cm/components/styles/common-components/ParameterCard'

import {STOCK_CODE} from '@app/(excluded)/stock/(constants)/STOCK_CODE'
import {shorten} from '@cm/lib/methods/common'
import {toast} from 'react-toastify'
import {Wrapper} from '@cm/components/styles/common-components/paper'

const Flag = ({flag, label}) => {
  return (
    <IconBtn rounded={false} color={flag ? `blue` : `transparent`} className={`text-[10px] text-center  w-[80px] !p-0 leading-4`}>
      {shorten(label, 6)}
    </IconBtn>
  )
}

export class ColBuilder {
  static stock = (props: columnGetterType) => {
    return new Fields([
      {id: 'code', label: 'コード', td: {hidden: true}, search: {}},
      {id: 'CompanyName', label: '会社名', td: {hidden: true}, search: {}},
      {
        id: `summary1`,
        label: '',
        format: (value, row) => {
          const {config} = props.ColBuilderExtraProps ?? {}
          const stock = new StockCl(row as any, config)
          const profit = stock.prices.profit ?? 0

          const stressClassName = `text-red-400 `
          const minueClassName = `text-green-600 `

          const {riseRate} = stock
          const {Code, CompanyName} = stock.data

          return (
            <R_Stack className={` items-start flex-nowrap `}>
              <section className={`min-w-[300px] [&_*]:!gap-0.5`}>
                <C_Stack className={` justify-between  test-sm `}>
                  <Wrapper>
                    {/* 基本情報 */}
                    <div>
                      <R_Stack className={`text-[12px]`}>
                        <C_Stack>
                          <LabelValue
                            {...{
                              value: (
                                <span
                                  className={` t-link`}
                                  // href={href}
                                  // target="_blank"
                                  onClick={() => {
                                    navigator.clipboard.writeText(Code).then(
                                      () => toast.success('クリップボードにコピーしました'),
                                      err => console.error('クリップボードへのコピーに失敗しました: ', err)
                                    )
                                  }}
                                >
                                  {Code}
                                </span>
                              ),
                            }}
                          />
                          <LabelValue
                            {...{
                              // label: `会社名`,
                              value: <span>{shorten(CompanyName, 8)}</span>,
                            }}
                          />
                        </C_Stack>
                        <C_Stack>
                          <LabelValue
                            {...{
                              label: `利益`,
                              value: (
                                <small className={profit && profit > 0 ? `text-red-700 font-bold text-lg` : minueClassName}>
                                  {profit > 0 ? `+` : profit < 0 ? `-` : ``}
                                  {NumHandler.WithUnit(profit ?? 0)}
                                </small>
                              ),
                            }}
                          />
                          <LabelValue
                            {...{
                              label: `上昇率`,
                              value: (
                                <div className={`${(riseRate ?? 0) > 5 ? stressClassName : riseRate < 0 ? minueClassName : ''}`}>
                                  {NumHandler.WithUnit(stock.riseRate ?? 0)}
                                </div>
                              ),
                            }}
                          />
                        </C_Stack>
                      </R_Stack>
                    </div>

                    {/* チャート */}
                    <div>
                      <StockChart
                        {...{
                          macdData: stock.getMacdValues(),
                          data: stock.prevListAsc as any,
                          height: 100,
                        }}
                      />
                    </div>
                  </Wrapper>
                </C_Stack>
              </section>
            </R_Stack>
          )
        },
      },

      ...new Fields([
        {id: 'favorite', label: 'お気に入り', type: `number`, td: {editable: {style: {minWidth: 60}}}},
        {id: 'heldCount', label: '保有数', type: `number`, td: {editable: {style: {minWidth: 60}}}},
        {id: 'averageBuyPrice', label: '平均買値', type: `float`, td: {editable: {style: {minWidth: 60}}}},
        {
          id: 'summary2',
          label: '',
          format: (value, row) => {
            const {config} = props.ColBuilderExtraProps ?? {}

            const stock = new StockCl(row as any, config)
            const {currentPriceSum, buyPriceSum} = stock.prices
            const profit = stock.prices.profit ?? 0

            const stressClassName = `text-red-400 `
            const minueClassName = `text-green-600 `

            const {Code, CompanyName, last_Open, last_Close, last_High, last_Low} = stock.data
            // const barometer = stock.barometer
            // const barometerList = Object.values(StockCl.getBarometerObject(config))

            return (
              <section>
                <C_Stack className={`gap-0.5 justify-between w-[200px]`}>
                  <Wrapper>
                    <R_Stack className={`w-[280px] `}>
                      <LabelValue {...{label: `始`, value: NumHandler.WithUnit(last_Open ?? 0)}} />
                      <LabelValue
                        {...{
                          label: `終`,
                          value: (
                            <div className={`${(last_Close ?? 0) > (last_Open ?? 0) ? stressClassName : minueClassName}`}>
                              {NumHandler.WithUnit(last_Close ?? 0)}
                            </div>
                          ),
                        }}
                      />
                    </R_Stack>

                    <R_Stack className={`w-[200px] `}>
                      <R_Stack className={`w-[280px] `}>
                        <LabelValue {...{label: `安`, value: NumHandler.WithUnit(last_Low ?? 0)}} />
                        <LabelValue
                          {...{
                            label: `高`,
                            value: (
                              <div className={`${(last_High ?? 0) > (last_Low ?? 0) ? stressClassName : minueClassName}`}>
                                {NumHandler.WithUnit(last_High ?? 0)}
                              </div>
                            ),
                          }}
                        />
                      </R_Stack>
                    </R_Stack>
                  </Wrapper>

                  {/* <Wrapper>
                    <div className={` gap-y-0.5 grid grid-cols-2 `}>
                      {barometerList.map((d, j) => {
                        const flag = barometer[d.id]
                        if (flag) {
                          return (
                            <div key={j}>
                              <Flag {...{flag, label: d.label}} />
                            </div>
                          )
                        }
                      })}
                    </div>
                  </Wrapper> */}
                </C_Stack>
              </section>
            )
          },
        },
      ]).aggregateOnSingleTd().plain,
    ]).transposeColumns()
  }

  static stockHistory = (props: columnGetterType) => {
    const {config} = props.ColBuilderExtraProps ?? {}
    return new Fields([
      {id: 'Date', label: '取得日', type: 'datetime'},
      {id: 'Code', label: '証券コード'},
      {id: 'Date', label: '日付', type: 'date'},
      {id: 'Open', label: '始値'},
      {id: 'Close', label: '終値'},
      {id: 'High', label: '高値'},
      {id: 'Low', label: '安値'},
      {id: 'Volume', label: '出来高'},
    ]).transposeColumns()
  }
  static stockConfig = (props: columnGetterType) => {
    return new Fields([
      {
        id: 'type',
        label: '種類',
        form: {},
        forSelect: {
          codeMaster: STOCK_CODE.STOCK_CONFIG_TYPE,
        },
      },
      {
        id: 'name',
        label: '名前',
        form: {},
        forSelect: {
          codeMaster: STOCK_CODE.STOCK_CONFIG_NAME,
        },
      },
      {id: 'value', label: '値', form: {}, type: 'float'},
    ]).transposeColumns()
  }
}
