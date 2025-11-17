import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {NumHandler} from '@cm/class/NumHandler'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import React from 'react'

import {ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, Line, Customized} from 'recharts'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'

// recharts v2.15.1 には CandlestickSeries がないため、カスタムでローソク足を描画
// ここではBarでVolume、カスタムSVGでローソク足を描画します

// StockHistoryの型例: { Date: Date, Open: number, Close: number, High: number, Low: number, Volume: number }
type StockHistoryType = {
  Date: Date
  Open: number
  Close: number
  High: number
  Low: number
  Volume: number
}[]

type Props = {
  data: StockHistoryType
  height?: number
  macdData: {
    macdLine: number[]
    signalLine: number[]
    histogram: number[]
    dates: Date[]
  } | null
}

// recharts用に日付をstring化
type ChartDataType = {
  date: string
  Open: number
  Close: number
  High: number
  Low: number
  Volume: number
  MA5?: number | null
  MA20?: number | null
  MA60?: number | null
  MACD?: number | null
  Signal?: number | null
  Histogram?: number | null
}

const formatData = (data: StockHistoryType, macdData?: Props['macdData']): ChartDataType[] => {
  const formattedData = data.map(d => ({
    date: d.Date instanceof Date ? formatDate(d.Date, 'M/D(ddd)') : String(d.Date),
    Open: d.Open,
    Close: d.Close,
    High: d.High,
    Low: d.Low,
    Volume: d.Volume,
  }))

  // 移動平均線の計算
  const calculateMA = (data: ChartDataType[], period: number) => {
    return data.map((item, index) => {
      if (index < period - 1) {
        return undefined // nullの代わりにundefinedを使用
      }
      const sum = data.slice(index - period + 1, index + 1).reduce((total, current) => total + current.Close, 0)
      return NumHandler.round(sum / period, 2)
    })
  }

  // 短期（5日）、中期（20日）、長期（60日）の移動平均を計算
  const ma5Data = calculateMA(formattedData, 5)
  const ma20Data = calculateMA(formattedData, 20)
  const ma60Data = calculateMA(formattedData, 60)

  // MACDデータをマッピング
  const macdMap = new Map<string, {macd: number; signal: number; histogram: number}>()
  if (macdData) {
    // console.log("MACD dates:", macdData.dates);
    // null/undefinedをフィルタリング
    const validDates = macdData.dates.filter(date => date !== null && date !== undefined)
    validDates.forEach((date, index) => {
      const dateStr = formatDate(date, 'M/D(ddd)')
      macdMap.set(dateStr, {
        macd: macdData.macdLine[index] ?? 0,
        signal: macdData.signalLine[index] ?? 0,
        histogram: macdData.histogram[index] ?? 0,
      })
    })
  }

  // 移動平均とMACDをデータに追加
  return formattedData.map((item, index) => {
    const macdValues = macdMap.get(item.date)
    return {
      ...item,
      // nullやundefinedの場合は変換しない（0にしない）
      MA5: ma5Data[index] !== undefined ? NumHandler.round(ma5Data[index], 2) : undefined,
      MA20: ma20Data[index] !== undefined ? NumHandler.round(ma20Data[index], 2) : undefined,
      MA60: ma60Data[index] !== undefined ? NumHandler.round(ma60Data[index], 2) : undefined,
      MACD: macdValues?.macd !== undefined ? NumHandler.round(macdValues.macd, 2) : undefined,
      Signal: macdValues?.signal !== undefined ? NumHandler.round(macdValues.signal, 2) : undefined,
      Histogram: macdValues?.histogram !== undefined ? NumHandler.round(macdValues.histogram, 2) : undefined,
    }
  })
}

// Customizedで全ローソク足を描画
const Candles = ({data, xAxis, yAxis, width, height, ...props}) => {
  if (!xAxis || !yAxis) return null
  const xScale = xAxis.scale
  const yScale = yAxis.scale
  const barWidth = 1

  return (
    <g>
      {data.map((d, i) => {
        const x = xScale(d.date) + (xScale.bandwidth ? (xScale.bandwidth() - barWidth) / 2 : 0)
        const open = yScale(d.Open)
        const close = yScale(d.Close)
        const high = yScale(d.High)
        const low = yScale(d.Low)

        const color = d.Close > d.Open ? '#FF0033' : '#003399'
        const candleY = Math.min(open ?? 0, close ?? 0)

        let candleHeight = Math.abs(open - close)
        if (isNaN(candleHeight)) candleHeight = 0
        return (
          <g key={i}>
            {/* ヒゲ */}
            <line
              {...{
                x1: x + barWidth / 2,
                x2: x + barWidth / 2,
                y1: high,
                y2: low,
                stroke: color,
                strokeWidth: 0.5,
              }}
            />
            {/* 実体 */}
            <rect
              {...{
                x,
                y: candleY,
                width: barWidth,
                height: candleHeight === 0 ? 2 : candleHeight,
                fill: color,
                stroke: color,
              }}
            />
          </g>
        )
      })}
    </g>
  )
}

// カスタムツールチップ
const CustomTooltip = ({active, payload, label}: {active?: boolean; payload?: any; label?: any}) => {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  // 前日比
  let diff = ''
  let diffColor = '#888'
  if (payload[0].payload && payload[1] && payload[1].payload) {
    const prev = payload[1].payload
    if (d.Close > prev.Close) {
      diff = `+${(d.Close - prev.Close).toFixed(2)}`
      diffColor = '#FF0033'
    } else if (d.Close < prev.Close) {
      diff = `${(d.Close - prev.Close).toFixed(2)}`
      diffColor = '#003399'
    } else {
      diff = '0.00'
      diffColor = '#888'
    }
  }
  return (
    <div
      style={{
        zIndex: 500,
        background: '#fff',
        border: '1px solid #ccc',
        padding: 10,
        borderRadius: 6,
        fontSize: 13,
        minWidth: 120,
      }}
    >
      <div>
        <b>{d.date}</b>
      </div>
      <R_Stack className={` items-start justify-between gap-4 w-[200px]`}>
        <section>
          <div>
            始値: <b>{NumHandler.WithUnit(d.Open)}</b>
          </div>
          <div>
            高値: <b>{NumHandler.WithUnit(d.High)}</b>
          </div>
          <div>
            安値: <b>{NumHandler.WithUnit(d.Low)}</b>
          </div>
          <div>
            終値: <b>{NumHandler.WithUnit(d.Close)}</b>
          </div>
        </section>
        <section>
          {diff !== '' && (
            <div>
              前日比: <b style={{color: diffColor}}>{diff}</b>
            </div>
          )}
          <div>
            出来高: <b>{NumHandler.WithUnit(d.Volume)}</b>
          </div>
          {d.MA5 && (
            <div>
              移動平均(5日): <b>{NumHandler.WithUnit(d.MA5)}</b>
            </div>
          )}
          {d.MA20 && (
            <div>
              移動平均(20日): <b>{NumHandler.WithUnit(d.MA20)}</b>
            </div>
          )}
          {d.MA60 && (
            <div>
              移動平均(60日): <b>{NumHandler.WithUnit(d.MA60)}</b>
            </div>
          )}
          {d.MACD !== null && d.MACD !== undefined && (
            <div>
              MACD: <b>{d.MACD.toFixed(3)}</b>
            </div>
          )}
          {d.Signal !== null && d.Signal !== undefined && (
            <div>
              シグナル: <b>{d.Signal.toFixed(3)}</b>
            </div>
          )}
          {d.Histogram !== null && d.Histogram !== undefined && (
            <div>
              ヒストグラム: <b>{d.Histogram.toFixed(3)}</b>
            </div>
          )}
        </section>
      </R_Stack>
    </div>
  )
}

export const StockChart: React.FC<Props> = ({
  data,
  height = 160,
  macdData,
}: {
  data: StockHistoryType
  height?: number
  macdData?: Props['macdData']
}) => {
  const chartData = formatData(data, macdData)

  const chartSizeProps = {
    top: 0,
    right: 10,
    left: -20,
    bottom: -10,
  }

  // // グローバルステートで表示切り替え
  // const [chartConfig, setChartConfig] = useJotaiByKey<{price: boolean; macd: boolean}>('stockChartConfig' as atomKey, {
  //   price: true,
  //   macd: true,
  // })

  // const showPrice = chartConfig.price
  // const showMACD = chartConfig.macd && hasMACD
  const showPrice = true
  const showMACD = true

  // データがない場合の処理
  if (chartData.length === 0) {
    return <div className="text-center text-gray-500 py-4">チャートデータがありません</div>
  }

  return (
    <div>
      {/* 表示切り替えボタン */}
      <div className="mb-2 flex gap-2"></div>

      {!showPrice && !showMACD ? (
        <PlaceHolder className={`text-sm`}>表示する指標を選択してください</PlaceHolder>
      ) : (
        <>
          {/* 株価チャート */}
          {showPrice && (
            <div className="mb-3">
              <ResponsiveContainer width="100%" height={height} className={`text-[7px]`}>
                <ComposedChart data={chartData} margin={chartSizeProps}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" minTickGap={1} xAxisId="main" />

                  <YAxis
                    yAxisId="price"
                    orientation="left"
                    domain={[dataMin => dataMin * 0.98, dataMax => Math.ceil(dataMax * 1.02)]}
                  />

                  <Tooltip content={props => <CustomTooltip {...props} />} />

                  {/* 終値の折れ線グラフ */}
                  <Line
                    type="monotone"
                    dataKey="Close"
                    yAxisId="price"
                    xAxisId="main"
                    stroke="#gray"
                    strokeWidth={2}
                    dot={{r: 1.5, fill: '#003399'}}
                    name="終値"
                    isAnimationActive={false}
                  />

                  {/* 移動平均線（短期：5日） */}
                  <Line
                    type="monotone"
                    dataKey="MA5"
                    yAxisId="price"
                    xAxisId="main"
                    stroke="#FF9500"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={true}
                    name="MA5"
                    isAnimationActive={false}
                  />

                  {/* 移動平均線（中期：20日） */}
                  <Line
                    type="monotone"
                    dataKey="MA20"
                    yAxisId="price"
                    xAxisId="main"
                    stroke="#2196F3"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={true}
                    name="MA20"
                    isAnimationActive={false}
                  />

                  {/* 移動平均線（長期：60日） */}
                  <Line
                    type="monotone"
                    dataKey="MA60"
                    yAxisId="price"
                    xAxisId="main"
                    stroke="#9C27B0"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={true}
                    name="MA60"
                    isAnimationActive={false}
                  />

                  {/* ローソク足（ヒゲ＋実体） */}
                  <Customized
                    component={({xAxisMap, yAxisMap, width, height}) => {
                      const xAxis = xAxisMap && xAxisMap['main']
                      const yAxis = yAxisMap && yAxisMap['price']
                      if (!xAxis || !yAxis) return null
                      return <Candles data={chartData} xAxis={xAxis} yAxis={yAxis} width={width} height={height} />
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* MACDチャート */}
          {showMACD && (
            <>
              {/* MACD指標グラフ */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">MACD指標</div>
                <ResponsiveContainer width="100%" height={height * 0.5} className={`text-[7px]`}>
                  <ComposedChart data={chartData} margin={chartSizeProps}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" minTickGap={1} xAxisId="main" />

                    <YAxis yAxisId="macd" orientation="left" domain={['auto', 'auto']} />

                    <Tooltip content={props => <CustomTooltip {...props} />} />

                    {/* MACDライン */}
                    <Line
                      type="monotone"
                      dataKey="MACD"
                      yAxisId="macd"
                      xAxisId="main"
                      stroke="#FF0033"
                      strokeWidth={2}
                      dot={false}
                      connectNulls={true}
                      name="MACD"
                      isAnimationActive={false}
                    />

                    {/* シグナルライン */}
                    <Line
                      type="monotone"
                      dataKey="Signal"
                      yAxisId="macd"
                      xAxisId="main"
                      stroke="#003399"
                      strokeWidth={2}
                      dot={false}
                      connectNulls={true}
                      name="Signal"
                      isAnimationActive={false}
                    />

                    {/* ヒストグラム */}
                    <Customized
                      component={({xAxisMap, yAxisMap, width, height}) => {
                        const xAxis = xAxisMap && xAxisMap['main']
                        const yAxis = yAxisMap && yAxisMap['macd']
                        if (!xAxis || !yAxis) return null

                        const xScale = xAxis.scale
                        const yScale = yAxis.scale
                        const barWidth = 3
                        const zeroY = yScale(0)

                        return (
                          <g>
                            {chartData.map((d, i) => {
                              if (d.Histogram === null || d.Histogram === undefined) return null

                              const x = xScale(d.date) + (xScale.bandwidth ? (xScale.bandwidth() - barWidth) / 2 : 0)
                              const histogramY = yScale(d.Histogram)
                              const color = d.Histogram >= 0 ? '#4CAF50' : '#F44336'
                              const barHeight = Math.abs(histogramY - zeroY)
                              const barY = d.Histogram >= 0 ? histogramY : zeroY

                              return (
                                <rect key={i} x={x} y={barY} width={barWidth} height={barHeight} fill={color} opacity={0.7} />
                              )
                            })}
                          </g>
                        )
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default StockChart
