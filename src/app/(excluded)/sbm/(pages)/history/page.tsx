import React from 'react'

export default function Page() {
  return <div>Page</div>
}

// 'use client'

// import React, {useState, useEffect} from 'react'
// import {Calendar, Search, Filter, FileText, Clock, User, RefreshCw} from 'lucide-react'
// import {formatDate} from '@cm/class/Days/date-utils/formatters'
// import {cn} from '@cm/shadcn/lib/utils'
// import useModal from '@cm/components/utils/modal/useModal'
// import {Padding} from '@cm/components/styles/common-components/common-components'
// import {getReservationHistories, HistoryFilterType} from '../../actions/history-actions'

// // 変更履歴閲覧ページ
// export default function HistoryPage() {
//   const [histories, setHistories] = useState<ReservationChangeHistoryType[]>([])
//   const [loading, setLoading] = useState(true)
//   const [expandedHistory, setExpandedHistory] = useState<string | null>(null)

//   // フィルター状態
//   const [filters, setFilters] = useState<HistoryFilterType>({
//     startDate: formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // 1週間前
//     endDate: formatDate(new Date()),
//     changeType: '',

//     keyword: '',
//   })

//   // 統計情報
//   const [statistics, setStatistics] = useState<any>(null)

//   // 詳細表示モーダル
//   const HistoryDetailModalReturn = useModal()

//   // フィルターの表示/非表示
//   const [showFilters, setShowFilters] = useState(false)

//   // 初期ロード
//   useEffect(() => {
//     loadHistories()
//     loadStatistics()
//   }, [])

//   // 変更履歴データ取得
//   const loadHistories = async () => {
//     setLoading(true)
//     try {
//       const data = await getReservationHistories(filters)
//       // 型変換して設定
//       setHistories(data as unknown as ReservationChangeHistoryType[])
//     } catch (error) {
//       console.error('変更履歴の取得に失敗しました:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // 統計情報の取得
//   const loadStatistics = async () => {
//     try {
//       const stats = await getHistoryStatistics('week')
//       setStatistics(stats)
//     } catch (error) {
//       console.error('統計情報の取得に失敗しました:', error)
//     }
//   }

//   // フィルター適用
//   const applyFilters = () => {
//     loadHistories()
//   }

//   // フィルターリセット
//   const resetFilters = () => {
//     setFilters({
//       startDate: formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
//       endDate: formatDate(new Date()),
//       changeType: '',
//       keyword: '',
//     })
//     loadHistories()
//   }

//   // フィルター入力の変更ハンドラ
//   const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const {name, value} = e.target
//     setFilters(prev => ({...prev, [name]: value}))
//   }

//   // 詳細表示の切り替え
//   const toggleExpand = (id: string) => {
//     setExpandedHistory(expandedHistory === id ? null : id)
//   }

//   // 変更タイプに応じたバッジスタイル
//   const getChangeTypeBadge = (changeType: string) => {
//     switch (changeType) {
//       case 'create':
//         return 'bg-green-100 text-green-800'
//       case 'update':
//         return 'bg-blue-100 text-blue-800'
//       case 'delete':
//         return 'bg-red-100 text-red-800'
//       default:
//         return 'bg-gray-100 text-gray-800'
//     }
//   }

//   // 変更タイプの日本語表示
//   const getChangeTypeLabel = (changeType: string) => {
//     switch (changeType) {
//       case 'create':
//         return '新規作成'
//       case 'update':
//         return '更新'
//       case 'delete':
//         return '削除'
//       default:
//         return changeType
//     }
//   }

//   // 変更されたフィールドの日本語表示
//   const getFieldLabel = (field: string) => {
//     const fieldLabels: Record<string, string> = {
//       customerName: '顧客名',
//       deliveryDate: '配達日時',
//       items: '商品',
//       quantity: '数量',
//       totalAmount: '合計金額',
//       notes: '備考',
//       pickupLocation: '受取方法',
//       purpose: '用途',
//       paymentMethod: '支払方法',
//       orderChannel: '注文経路',
//     }

//     return fieldLabels[field] || field
//   }

//   // ローディング表示
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">データを読み込み中...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-7xl mx-auto">
//         {/* ヘッダー */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
//           <div className="flex items-center space-x-3 mb-4 sm:mb-0">
//             <Clock className="text-blue-600" size={32} />
//             <h1 className="text-3xl font-bold text-gray-900">変更履歴</h1>
//           </div>
//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             <Filter size={20} />
//             <span>フィルター {showFilters ? '非表示' : '表示'}</span>
//           </button>
//         </div>

//         {/* フィルターセクション */}
//         {showFilters && (
//           <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
//                 <div className="relative">
//                   <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//                   <input
//                     type="date"
//                     name="startDate"
//                     value={filters.startDate}
//                     onChange={handleFilterChange}
//                     className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
//                 <div className="relative">
//                   <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//                   <input
//                     type="date"
//                     name="endDate"
//                     value={filters.endDate}
//                     onChange={handleFilterChange}
//                     className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">キーワード検索</label>
//                 <div className="relative">
//                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//                   <input
//                     type="text"
//                     name="keyword"
//                     value={filters.keyword}
//                     onChange={handleFilterChange}
//                     placeholder="顧客名、商品名などで検索..."
//                     className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">変更タイプ</label>
//                 <select
//                   name="changeType"
//                   value={filters.changeType}
//                   onChange={handleFilterChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">すべて</option>
//                   <option value="create">新規作成</option>
//                   <option value="update">更新</option>
//                   <option value="delete">削除</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">変更者</label>
//               </div>
//             </div>
//             <div className="flex justify-end space-x-2">
//               <button
//                 onClick={resetFilters}
//                 className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
//               >
//                 リセット
//               </button>
//               <button
//                 onClick={applyFilters}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 適用
//               </button>
//             </div>
//           </div>
//         )}

//         {/* 統計情報 */}
//         {statistics && (
//           <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">統計情報</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {/* 変更タイプ別集計 */}
//               <div>
//                 <h3 className="text-sm font-medium text-gray-700 mb-2">変更タイプ別</h3>
//                 <div className="space-y-2">
//                   {statistics.changeTypeCounts?.map((item: any) => (
//                     <div key={item.changeType} className="flex justify-between items-center">
//                       <span className="text-sm">
//                         {item.changeType === 'create'
//                           ? '新規作成'
//                           : item.changeType === 'update'
//                             ? '更新'
//                             : item.changeType === 'delete'
//                               ? '削除'
//                               : item.changeType}
//                       </span>
//                       <span className="font-semibold">{item.count}件</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* 期間情報 */}
//               <div>
//                 <h3 className="text-sm font-medium text-gray-700 mb-2">期間</h3>
//                 <div className="p-3 bg-gray-50 rounded-md">
//                   <p className="text-sm">
//                     {statistics.period === 'day'
//                       ? '過去24時間'
//                       : statistics.period === 'week'
//                         ? '過去1週間'
//                         : statistics.period === 'month'
//                           ? '過去1ヶ月'
//                           : ''}
//                     の変更履歴を表示しています
//                   </p>
//                   <div className="mt-2 flex justify-end">
//                     <button onClick={loadStatistics} className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
//                       <RefreshCw size={12} className="mr-1" />
//                       更新
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* 変更履歴一覧 */}
//         <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//           <div className="px-6 py-4 border-b">
//             <h2 className="text-lg font-semibold text-gray-900">変更履歴一覧 ({histories.length}件)</h2>
//           </div>

//           {histories.length > 0 ? (
//             <div className="divide-y divide-gray-200">
//               {histories.map(history => (
//                 <div key={history.id} className="p-6 hover:bg-gray-50">
//                   <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
//                     <div className="flex items-center space-x-3 mb-2 md:mb-0">
//                       <span
//                         className={cn(
//                           'px-2 py-1 text-xs font-semibold rounded-full',
//                           getChangeTypeBadge(history.changeType as string)
//                         )}
//                       >
//                         {getChangeTypeLabel(history.changeType as string)}
//                       </span>
//                       <span className="text-gray-600">予約ID: {history.sbmReservationId}</span>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                       <span className="text-sm text-gray-500">
//                         <Clock className="inline-block mr-1" size={14} />
//                         {formatDate(history.changedAt as Date, 'YYYY/MM/DD HH:mm')}
//                       </span>
//                     </div>
//                   </div>

//                   {/* 変更内容のサマリー */}
//                   <div className="mt-2 text-sm text-gray-700">
//                     <p>
//                       変更フィールド:{' '}
//                       {history.changedFields && Object.keys(history.changedFields).length > 0
//                         ? Object.keys(history.changedFields)
//                             .map(field => getFieldLabel(field))
//                             .join(', ')
//                         : '変更なし'}
//                     </p>
//                   </div>

//                   {/* 詳細表示ボタン */}
//                   <div className="mt-3 flex justify-end">
//                     <button
//                       onClick={() => HistoryDetailModalReturn.handleOpen({history})}
//                       className="flex items-center text-blue-600 hover:text-blue-800"
//                     >
//                       <FileText size={16} className="mr-1" />
//                       <span>詳細を表示</span>
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8">
//               <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//               <p className="text-gray-500">変更履歴がありません</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 詳細表示モーダル */}
//       <HistoryDetailModalReturn.Modal>
//         <Padding>
//           <HistoryDetailModal
//             history={HistoryDetailModalReturn?.open?.history}
//             onClose={() => HistoryDetailModalReturn.handleClose()}
//           />
//         </Padding>
//       </HistoryDetailModalReturn.Modal>
//     </div>
//   )
// }

// // 変更履歴詳細モーダル
// const HistoryDetailModal = ({
//   history,
//   onClose,
// }: {
//   history: ReservationChangeHistoryType | null | undefined
//   onClose: () => void
// }) => {
//   if (!history) return null

//   // 関連する予約情報を取得するための状態
//   const [relatedReservation, setRelatedReservation] = useState<any>(null)
//   const [loadingRelated, setLoadingRelated] = useState(false)

//   // タブ切り替え用の状態
//   const [activeTab, setActiveTab] = useState<'changes' | 'json'>('changes')

//   // 変更タイプの日本語表示
//   const getChangeTypeLabel = (changeType: string) => {
//     switch (changeType) {
//       case 'create':
//         return '新規作成'
//       case 'update':
//         return '更新'
//       case 'delete':
//         return '削除'
//       default:
//         return changeType
//     }
//   }

//   // 変更されたフィールドの日本語表示
//   const getFieldLabel = (field: string) => {
//     const fieldLabels: Record<string, string> = {
//       customerName: '顧客名',
//       contactName: '担当者名',
//       deliveryDate: '配達日時',
//       items: '商品',
//       quantity: '数量',
//       totalAmount: '合計金額',
//       finalAmount: '最終金額',
//       pointsUsed: '使用ポイント',
//       notes: '備考',
//       pickupLocation: '受取方法',
//       purpose: '用途',
//       paymentMethod: '支払方法',
//       orderChannel: '注文経路',
//       postalCode: '郵便番号',
//       prefecture: '都道府県',
//       city: '市区町村',
//       street: '町名・番地',
//       building: '建物名',
//       phoneNumber: '電話番号',
//       deliveryCompleted: '配達完了',
//       recoveryCompleted: '回収完了',
//       orderStaff: '受注担当者',
//     }

//     return fieldLabels[field] || field
//   }

//   // 値の表示形式を整える
//   const formatValue = (key: string, value: any): React.ReactNode => {
//     if (value === null || value === undefined) return <span className="text-gray-400">未設定</span>

//     // 日付の場合
//     if (key === 'deliveryDate' || key === 'changedAt' || key === 'createdAt' || key === 'updatedAt') {
//       if (value instanceof Date || typeof value === 'string') {
//         return formatDate(new Date(value), 'YYYY/MM/DD HH:mm')
//       }
//     }

//     // 真偽値の場合
//     if (typeof value === 'boolean') {
//       return value ? <span className="text-green-600">はい</span> : <span className="text-red-600">いいえ</span>
//     }

//     // 商品配列の場合
//     if (key === 'items' && Array.isArray(value)) {
//       return (
//         <div className="space-y-2">
//           {value.map((item, idx) => (
//             <div key={idx} className="border p-2 rounded-md bg-gray-50">
//               <div>
//                 <span className="font-medium">商品名:</span> {item.productName}
//               </div>
//               <div>
//                 <span className="font-medium">数量:</span> {item.quantity}
//               </div>
//               <div>
//                 <span className="font-medium">単価:</span> ¥{item.unitPrice?.toLocaleString()}
//               </div>
//               {item.totalPrice && (
//                 <div>
//                   <span className="font-medium">小計:</span> ¥{item.totalPrice?.toLocaleString()}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )
//     }

//     // 金額の場合
//     if ((key.includes('Amount') || key.includes('Price') || key.includes('Cost')) && typeof value === 'number') {
//       return <span className="font-medium">¥{value.toLocaleString()}</span>
//     }

//     // オブジェクトの場合
//     if (typeof value === 'object' && value !== null) {
//       return (
//         <details className="cursor-pointer">
//           <summary className="text-blue-600 hover:text-blue-800">詳細を表示</summary>
//           <pre className="mt-2 p-2 bg-gray-50 rounded-md text-xs overflow-auto max-h-40">{JSON.stringify(value, null, 2)}</pre>
//         </details>
//       )
//     }

//     return String(value)
//   }

//   return (
//     <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-xl font-bold text-gray-900">変更履歴詳細 - {getChangeTypeLabel(history.changeType as string)}</h2>
//         <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//           <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </button>
//       </div>

//       <div className="mb-6">
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <p className="text-sm text-gray-500">予約ID</p>
//             <p className="font-medium">{history.sbmReservationId}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">変更者</p>
//             <p className="font-medium">{history.changedBy}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">変更日時</p>
//             <p className="font-medium">{formatDate(history.changedAt as Date, 'YYYY/MM/DD HH:mm:ss')}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">変更タイプ</p>
//             <p className="font-medium">{getChangeTypeLabel(history.changeType as string)}</p>
//           </div>
//         </div>
//       </div>

//       {/* タブ切り替え */}
//       <div className="border-b border-gray-200 mb-6">
//         <nav className="flex -mb-px">
//           <button
//             onClick={() => setActiveTab('changes')}
//             className={cn(
//               'py-2 px-4 border-b-2 font-medium text-sm',
//               activeTab === 'changes'
//                 ? 'border-blue-500 text-blue-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             )}
//           >
//             変更内容
//           </button>
//           <button
//             onClick={() => setActiveTab('json')}
//             className={cn(
//               'py-2 px-4 border-b-2 font-medium text-sm',
//               activeTab === 'json'
//                 ? 'border-blue-500 text-blue-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             )}
//           >
//             JSON形式
//           </button>
//         </nav>
//       </div>

//       {/* 変更内容タブ */}
//       {activeTab === 'changes' && (
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold mb-2">変更内容</h3>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">フィールド</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">変更前</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">変更後</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {history.changedFields &&
//                   Object.keys(history.changedFields).map(field => (
//                     <tr key={field}>
//                       <td className="px-4 py-3 text-sm font-medium text-gray-900">{getFieldLabel(field)}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600">
//                         {history.oldValues && formatValue(field, (history.oldValues as any)[field])}
//                       </td>
//                       <td className="px-4 py-3 text-sm text-gray-900">
//                         {history.newValues && formatValue(field, (history.newValues as any)[field])}
//                       </td>
//                     </tr>
//                   ))}
//                 {(!history.changedFields || Object.keys(history.changedFields).length === 0) && (
//                   <tr>
//                     <td colSpan={3} className="px-4 py-3 text-sm text-center text-gray-500">
//                       変更内容の詳細はありません
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* JSON形式タブ */}
//       {activeTab === 'json' && (
//         <div className="mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <h3 className="text-md font-semibold mb-2">変更前</h3>
//               <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
//                 <pre className="text-xs">{JSON.stringify(history.oldValues, null, 2)}</pre>
//               </div>
//             </div>
//             <div>
//               <h3 className="text-md font-semibold mb-2">変更後</h3>
//               <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
//                 <pre className="text-xs">{JSON.stringify(history.newValues, null, 2)}</pre>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="flex justify-end">
//         <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
//           閉じる
//         </button>
//       </div>
//     </div>
//   )
// }
