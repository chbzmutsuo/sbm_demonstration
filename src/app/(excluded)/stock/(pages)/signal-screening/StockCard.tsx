import StockChart from '@app/(excluded)/stock/(components)/StockChart'
import {Stock} from '@prisma/client'
import {StockCl} from 'src/non-common/EsCollection/(stock)/StockCl'

export function StockCard({stock, config, signalOptions}: {stock: Stock; config: any; signalOptions: any[]}) {
  if (!config) return null

  const stockInstance = new StockCl(stock as any, config)
  const activeSignals = signalOptions.filter(option => stock[`last_${option.key}` as keyof Stock])

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-bold text-lg">{stock.Code}</div>
          <div className="text-sm text-gray-600 truncate">{stock.CompanyName}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg">{stock.last_Close?.toLocaleString()}円</div>
          <div className={`font-mono text-sm ${(stock.last_riseRate || 0) >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {stock.last_riseRate && stock.last_riseRate > 0 ? '+' : ''}
            {stock.last_riseRate?.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* チャート */}
      <div className="mb-3">
        <StockChart data={stockInstance.prevListAsc as any} macdData={stockInstance.getMacdValues()} height={80} />
      </div>

      {/* アクティブシグナル */}
      <div className="flex flex-wrap gap-1">
        {activeSignals.slice(0, 3).map(signal => (
          <span key={signal.key} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
            {signal.label}
          </span>
        ))}
        {activeSignals.length > 3 && (
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">+{activeSignals.length - 3}</span>
        )}
      </div>
    </div>
  )
}
