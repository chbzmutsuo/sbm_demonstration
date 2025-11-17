'use client'

import React, {useState, useEffect} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

interface TradeJournalEntry {
  id: number
  date: Date
  stockCode: string
  stockName: string
  action: 'buy' | 'sell'
  quantity: number
  price: number
  totalAmount: number
  reason: string
  emotion: string
  result?: 'profit' | 'loss' | 'pending'
  profitLoss?: number
  notes: string
  createdAt: Date
}

export default function TradeJournalPage() {
  const [entries, setEntries] = useState<TradeJournalEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TradeJournalEntry | null>(null)
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'profit' | 'loss'>('all')
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'all'>('month')

  const [formData, setFormData] = useState({
    date: formatDate(new Date(), 'YYYY-MM-DD'),
    stockCode: '',
    stockName: '',
    action: 'buy' as 'buy' | 'sell',
    quantity: 0,
    price: 0,
    reason: '',
    emotion: '',
    result: 'pending' as 'profit' | 'loss' | 'pending',
    profitLoss: 0,
    notes: '',
  })

  const fetchEntries = async () => {
    setLoading(true)
    try {
      // 実際の実装では、TradeJournalテーブルを作成する必要があります
      // ここでは仮のデータを使用
      const mockData: TradeJournalEntry[] = [
        {
          id: 1,
          date: new Date('2024-01-15'),
          stockCode: '7974',
          stockName: '任天堂',
          action: 'buy',
          quantity: 10,
          price: 11000,
          totalAmount: 110000,
          reason: 'ゴールデンクロス発生、業績好調',
          emotion: '冷静',
          result: 'profit',
          profitLoss: 15000,
          notes: '想定通りの上昇',
          createdAt: new Date('2024-01-15'),
        },
        {
          id: 2,
          date: new Date('2024-01-20'),
          stockCode: '6098',
          stockName: 'リクルートHD',
          action: 'sell',
          quantity: 5,
          price: 8500,
          totalAmount: 42500,
          reason: '利確目標到達',
          emotion: '満足',
          result: 'profit',
          profitLoss: 5000,
          notes: '計画通りの利確',
          createdAt: new Date('2024-01-20'),
        },
      ]
      setEntries(mockData)
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async () => {
    try {
      const newEntry: TradeJournalEntry = {
        id: editingEntry?.id || Date.now(),
        date: new Date(formData.date),
        stockCode: formData.stockCode,
        stockName: formData.stockName,
        action: formData.action,
        quantity: formData.quantity,
        price: formData.price,
        totalAmount: formData.quantity * formData.price,
        reason: formData.reason,
        emotion: formData.emotion,
        result: formData.result,
        profitLoss: formData.profitLoss,
        notes: formData.notes,
        createdAt: new Date(),
      }

      if (editingEntry) {
        setEntries(prev => prev.map(entry => (entry.id === editingEntry.id ? newEntry : entry)))
      } else {
        setEntries(prev => [...prev, newEntry])
      }

      resetForm()
    } catch (error) {
      console.error('保存エラー:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      date: formatDate(new Date(), 'YYYY-MM-DD'),
      stockCode: '',
      stockName: '',
      action: 'buy',
      quantity: 0,
      price: 0,
      reason: '',
      emotion: '',
      result: 'pending',
      profitLoss: 0,
      notes: '',
    })
    setEditingEntry(null)
    setShowForm(false)
  }

  const editEntry = (entry: TradeJournalEntry) => {
    setFormData({
      date: formatDate(entry.date, 'YYYY-MM-DD'),
      stockCode: entry.stockCode,
      stockName: entry.stockName,
      action: entry.action,
      quantity: entry.quantity,
      price: entry.price,
      reason: entry.reason,
      emotion: entry.emotion,
      result: entry.result || 'pending',
      profitLoss: entry.profitLoss || 0,
      notes: entry.notes,
    })
    setEditingEntry(entry)
    setShowForm(true)
  }

  const deleteEntry = (id: number) => {
    if (confirm('この記録を削除しますか？')) {
      setEntries(prev => prev.filter(entry => entry.id !== id))
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const filteredEntries = entries.filter(entry => {
    if (filter === 'all') return true
    if (filter === 'buy' || filter === 'sell') return entry.action === filter
    if (filter === 'profit' || filter === 'loss') return entry.result === filter
    return true
  })

  const statistics = {
    totalTrades: entries.length,
    buyTrades: entries.filter(e => e.action === 'buy').length,
    sellTrades: entries.filter(e => e.action === 'sell').length,
    profitTrades: entries.filter(e => e.result === 'profit').length,
    lossTrades: entries.filter(e => e.result === 'loss').length,
    totalProfitLoss: entries.reduce((sum, e) => sum + (e.profitLoss || 0), 0),
    winRate:
      entries.filter(e => e.result !== 'pending').length > 0
        ? (entries.filter(e => e.result === 'profit').length / entries.filter(e => e.result !== 'pending').length) * 100
        : 0,
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📝 トレード日誌</h1>
              <p className="text-gray-600 mt-2">取引記録と分析</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
              新規記録追加
            </Button>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">{statistics.totalTrades}</div>
            <div className="text-sm text-gray-600">総取引数</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">{statistics.winRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">勝率</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className={`text-2xl font-bold ${statistics.totalProfitLoss >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
              {statistics.totalProfitLoss > 0 ? '+' : ''}
              {statistics.totalProfitLoss.toLocaleString()}円
            </div>
            <div className="text-sm text-gray-600">総損益</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-purple-600">
              {statistics.profitTrades}/{statistics.lossTrades}
            </div>
            <div className="text-sm text-gray-600">勝敗数</div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">フィルター:</label>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as any)}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="buy">買い注文</option>
                <option value="sell">売り注文</option>
                <option value="profit">利益</option>
                <option value="loss">損失</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">期間:</label>
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value as any)}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">1週間</option>
                <option value="month">1ヶ月</option>
                <option value="quarter">3ヶ月</option>
                <option value="all">すべて</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">{filteredEntries.length}件を表示中</div>
          </div>
        </div>

        {/* 記録一覧 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">取引記録</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">データを読み込み中...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-semibold">日付</th>
                    <th className="text-left p-3 font-semibold">銘柄</th>
                    <th className="text-center p-3 font-semibold">売買</th>
                    <th className="text-right p-3 font-semibold">数量</th>
                    <th className="text-right p-3 font-semibold">価格</th>
                    <th className="text-right p-3 font-semibold">金額</th>
                    <th className="text-left p-3 font-semibold">理由</th>
                    <th className="text-center p-3 font-semibold">結果</th>
                    <th className="text-right p-3 font-semibold">損益</th>
                    <th className="text-center p-3 font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map(entry => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{formatDate(entry.date, 'MM/DD')}</td>
                      <td className="p-3">
                        <div className="font-medium">{entry.stockCode}</div>
                        <div className="text-xs text-gray-500">{entry.stockName}</div>
                      </td>
                      <td className="text-center p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            entry.action === 'buy' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {entry.action === 'buy' ? '買い' : '売り'}
                        </span>
                      </td>
                      <td className="text-right p-3 font-mono">{entry.quantity.toLocaleString()}株</td>
                      <td className="text-right p-3 font-mono">{entry.price.toLocaleString()}円</td>
                      <td className="text-right p-3 font-mono">{entry.totalAmount.toLocaleString()}円</td>
                      <td className="p-3 max-w-32 truncate">{entry.reason}</td>
                      <td className="text-center p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            entry.result === 'profit'
                              ? 'bg-green-100 text-green-800'
                              : entry.result === 'loss'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {entry.result === 'profit' ? '利益' : entry.result === 'loss' ? '損失' : '未確定'}
                        </span>
                      </td>
                      <td
                        className={`text-right p-3 font-mono font-semibold ${
                          (entry.profitLoss || 0) >= 0 ? 'text-red-600' : 'text-blue-600'
                        }`}
                      >
                        {entry.profitLoss ? (
                          <>
                            {entry.profitLoss > 0 ? '+' : ''}
                            {entry.profitLoss.toLocaleString()}円
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="text-center p-3">
                        <div className="flex space-x-1">
                          <Button
                            onClick={() => editEntry(entry)}
                            className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1"
                          >
                            編集
                          </Button>
                          <Button
                            onClick={() => deleteEntry(entry.id)}
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1"
                          >
                            削除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 記録追加・編集フォーム */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{editingEntry ? '記録編集' : '新規記録追加'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({...prev, date: e.target.value}))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">銘柄コード</label>
                  <input
                    type="text"
                    value={formData.stockCode}
                    onChange={e => setFormData(prev => ({...prev, stockCode: e.target.value}))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 7974"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">銘柄名</label>
                  <input
                    type="text"
                    value={formData.stockName}
                    onChange={e => setFormData(prev => ({...prev, stockName: e.target.value}))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 任天堂"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">売買区分</label>
                  <select
                    value={formData.action}
                    onChange={e => setFormData(prev => ({...prev, action: e.target.value as 'buy' | 'sell'}))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="buy">買い</option>
                    <option value="sell">売り</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={e => setFormData(prev => ({...prev, quantity: parseInt(e.target.value) || 0}))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="株数"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">価格</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="円"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">取引理由</label>
                  <textarea
                    value={formData.reason}
                    onChange={e => setFormData(prev => ({...prev, reason: e.target.value}))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="なぜこの取引を行ったか"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">感情状態</label>
                  <input
                    type="text"
                    value={formData.emotion}
                    onChange={e => setFormData(prev => ({...prev, emotion: e.target.value}))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 冷静、不安、興奮"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">結果</label>
                  <select
                    value={formData.result}
                    onChange={e => setFormData(prev => ({...prev, result: e.target.value as 'profit' | 'loss' | 'pending'}))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">未確定</option>
                    <option value="profit">利益</option>
                    <option value="loss">損失</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">損益金額</label>
                  <input
                    type="number"
                    value={formData.profitLoss}
                    onChange={e => setFormData(prev => ({...prev, profitLoss: parseFloat(e.target.value) || 0}))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="円"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({...prev, notes: e.target.value}))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="その他のメモ"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button onClick={resetForm} className="bg-gray-500 hover:bg-gray-600 text-white">
                  キャンセル
                </Button>
                <Button onClick={saveEntry} className="bg-blue-500 hover:bg-blue-600 text-white">
                  {editingEntry ? '更新' : '保存'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
