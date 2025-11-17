// 'use client'

// // 💡
// // 「こちらはモックであり、単一ファイルに収まるよう構築されています。このページは最終的に削除するため、本番プロジェクトでは、プロジェクトの設計やルールに従ってページやコンポーネントを分割してください」。

// import React, {useState, useEffect, useMemo, useCallback} from 'react'

// // --- Sample Data --------------------------------------------------
// // This would normally be fetched from an API, but is defined as a constant for this mock.

// const initialProducts = [
//   // 危険水域になるように調整 (余裕在庫を多く設定)
//   {
//     id: 'PD001',
//     name: '玄関マット',
//     color: 'GB',
//     recipe: [
//       {rawMaterialId: 'RM001', amount: 2},
//       {rawMaterialId: 'RM002', amount: 5},
//     ],
//     cost: 1200,
//     productionCapacity: 10,
//     allowanceStock: 3000,
//   },
//   // 安全水域になるように調整
//   {
//     id: 'PD002',
//     name: '玄関マット',
//     color: 'RB',
//     recipe: [
//       {rawMaterialId: 'RM001', amount: 2},
//       {rawMaterialId: 'RM003', amount: 3},
//     ],
//     cost: 800,
//     productionCapacity: 15,
//     allowanceStock: 100,
//   },
//   {
//     id: 'PD003',
//     name: '玄関マット',
//     color: 'B',
//     recipe: [{rawMaterialId: 'RM004', amount: 10}],
//     cost: 500,
//     productionCapacity: 20,
//     allowanceStock: 80,
//   },
//   {id: 'PD004', name: 'マルチ', color: 'B', recipe: [], cost: 2000, productionCapacity: 5, allowanceStock: 20},
//   {
//     id: 'PD005',
//     name: '１５－３１０L',
//     color: 'B',
//     recipe: [
//       {rawMaterialId: 'RM001', amount: 3},
//       {rawMaterialId: 'RM004', amount: 8},
//     ],
//     cost: 950,
//     productionCapacity: 12,
//     allowanceStock: 70,
//   },
// ]
// const initialRawMaterials = [
//   // 安全水域
//   {id: 'RM001', category: 'カラーチップ', name: '基本チップ', unit: 'g', cost: 50, safetyStock: 1000},
//   // 危険水域になるように調整
//   {id: 'RM002', category: 'ヒーター線', name: '高出力ヒーター', unit: '個', cost: 200, safetyStock: 200},
//   {id: 'RM003', category: 'ヒーター線', name: '標準ヒーター', unit: '個', cost: 120, safetyStock: 500},
//   {id: 'RM004', category: '基材', name: '再生ファブリック', unit: 'g', cost: 20, safetyStock: 5000},
// ]
// const initialOrders = [
//   {id: 'SO001', orderDate: '2025-09-10', productId: 'PD001', quantity: 30, amount: 36000},
//   {id: 'SO002', orderDate: '2024-09-15', productId: 'PD001', quantity: 25, amount: 30000},
//   {id: 'SO003', orderDate: '2023-09-12', productId: 'PD001', quantity: 28, amount: 33600},
//   {id: 'SO004', orderDate: '2025-09-05', productId: 'PD002', quantity: 50, amount: 40000},
//   {id: 'SO005', orderDate: '2024-09-08', productId: 'PD002', quantity: 60, amount: 48000},
//   {id: 'SO006', orderDate: '2023-09-20', productId: 'PD002', quantity: 55, amount: 44000},
//   {
//     id: 'SO007',
//     orderDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-02`,
//     productId: 'PD001',
//     quantity: 10,
//     amount: 12000,
//   },
//   {
//     id: 'SO008',
//     orderDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-05`,
//     productId: 'PD002',
//     quantity: 20,
//     amount: 16000,
//   },
// ]
// const initialProductions = [
//   {
//     id: 'PR001',
//     productionDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
//     productId: 'PD001',
//     quantity: 15,
//     type: '国産',
//   },
//   {
//     id: 'PR002',
//     productionDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
//     productId: 'PD002',
//     quantity: 20,
//     type: '国産',
//   },
//   {
//     id: 'PR003',
//     productionDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-03`,
//     productId: 'PD001',
//     quantity: 10,
//     type: '国産',
//   },
//   {
//     id: 'PR004',
//     productionDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-04`,
//     productId: 'PD004',
//     quantity: 5,
//     type: '中国産',
//   },
// ]
// const initialStockAdjustments = [
//   {id: 'SA001', rawMaterialId: 'RM001', date: '2025-08-20', reason: '入荷', quantity: 10000},
//   // 危険水域になるように入荷数を調整
//   {id: 'SA002', rawMaterialId: 'RM002', date: '2025-08-20', reason: '入荷', quantity: 300},
//   {id: 'SA003', rawMaterialId: 'RM003', date: '2025-08-20', reason: '入荷', quantity: 2000},
//   {id: 'SA004', rawMaterialId: 'RM004', date: '2025-08-20', reason: '入荷', quantity: 20000},
//   {id: 'SA005', rawMaterialId: 'RM001', date: '2025-09-05', reason: '廃棄', quantity: -50},
// ]
// const companyHolidays = [
//   `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-16`,
//   `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-23`,
// ]
// const PRODUCTION_SETTINGS = {
//   staffCount: 3,
//   workHours: 8,
// }

// // --- Icon Components ---------------------------------------------
// const Icon = ({children, ...props}) => (
//   <svg
//     {...props}
//     xmlns="http://www.w3.org/2000/svg"
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     {children}
//   </svg>
// )
// const AlertTriangleIcon = props => (
//   <Icon {...props}>
//     <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
//     <path d="M12 9v4" />
//     <path d="M12 17h.01" />
//   </Icon>
// )
// const CheckCircleIcon = props => (
//   <Icon {...props}>
//     <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
//     <polyline points="22 4 12 14.01 9 11.01" />
//   </Icon>
// )
// const TrendingUpIcon = props => (
//   <Icon {...props}>
//     <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
//     <polyline points="16 7 22 7 22 13" />
//   </Icon>
// )
// const PackageIcon = props => (
//   <Icon {...props}>
//     <path d="M16.5 9.4a4.5 4.5 0 1 1-9 0" />
//     <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
//     <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
//     <line x1="12" y1="22.08" x2="12" y2="12" />
//   </Icon>
// )
// const WrenchIcon = props => (
//   <Icon {...props}>
//     <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
//   </Icon>
// )
// const CalendarIcon = props => (
//   <Icon {...props}>
//     <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
//     <line x1="16" x2="16" y1="2" y2="6" />
//     <line x1="8" x2="8" y1="2" y2="6" />
//     <line x1="3" x2="21" y1="10" y2="10" />
//   </Icon>
// )
// const HomeIcon = props => (
//   <Icon {...props}>
//     <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
//     <polyline points="9 22 9 12 15 12 15 22" />
//   </Icon>
// )
// const BoxIcon = props => (
//   <Icon {...props}>
//     <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
//     <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
//     <line x1="12" y1="22.08" x2="12" y2="12" />
//   </Icon>
// )
// const ClipboardListIcon = props => (
//   <Icon {...props}>
//     <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
//     <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
//     <path d="M12 11h4" />
//     <path d="M12 16h4" />
//     <path d="M8 11h.01" />
//     <path d="M8 16h.01" />
//   </Icon>
// )
// const FactoryIcon = props => (
//   <Icon {...props}>
//     <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
//     <path d="M17 18h1" />
//     <path d="M12 18h1" />
//     <path d="M7 18h1" />
//   </Icon>
// )
// const MenuIcon = props => (
//   <Icon {...props}>
//     <line x1="4" x2="20" y1="12" y2="12" />
//     <line x1="4" x2="20" y1="6" y2="6" />
//     <line x1="4" x2="20" y1="18" y2="18" />
//   </Icon>
// )
// const XIcon = props => (
//   <Icon {...props}>
//     <path d="M18 6 6 18" />
//     <path d="m6 6 12 12" />
//   </Icon>
// )
// const PlusIcon = props => (
//   <Icon {...props}>
//     <line x1="12" y1="5" x2="12" y2="19" />
//     <line x1="5" y1="12" x2="19" y2="12" />
//   </Icon>
// )
// const EditIcon = props => (
//   <Icon {...props}>
//     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//     <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//   </Icon>
// )
// const Trash2Icon = props => (
//   <Icon {...props}>
//     <polyline points="3 6 5 6 21 6" />
//     <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
//     <line x1="10" y1="11" x2="10" y2="17" />
//     <line x1="14" y1="11" x2="14" y2="17" />
//   </Icon>
// )
// const HistoryIcon = props => (
//   <Icon {...props}>
//     <path d="M3 3v5h5" />
//     <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
//     <path d="M12 7v5l4 2" />
//   </Icon>
// )

// // --- Common UI Components ----------------------------------------
// const Spinner = () => <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
// const Button = ({
//   children,
//   onClick,
//   variant = 'primary',
//   className = '',
//   type = 'button',
// }: {
//   children: React.ReactNode
//   onClick: () => void
//   variant: 'primary' | 'secondary' | 'danger'
//   className: string
//   type: 'button' | 'submit' | 'reset'
// }) => {
//   const baseClasses = 'px-3 py-1.5 text-sm font-semibold rounded-md flex items-center justify-center transition-colors'
//   const variantClasses = {
//     primary: 'bg-blue-600 text-white hover:bg-blue-700',
//     secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
//     danger: 'bg-red-600 text-white hover:bg-red-700',
//   }
//   return (
//     <button onClick={onClick} type={type} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
//       {children}
//     </button>
//   )
// }
// const Modal = ({isOpen, onClose, title, children, size = 'lg'}) => {
//   if (!isOpen) return null
//   const sizeClasses = {
//     lg: 'max-w-lg',
//     xl: 'max-w-xl',
//     '2xl': 'max-w-2xl',
//     '4xl': 'max-w-4xl',
//   }
//   return (
//     <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start p-4 pt-16" onClick={onClose}>
//       <div
//         className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}
//         onClick={e => e.stopPropagation()}
//       >
//         <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-lg">
//           <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//           <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//             <XIcon className="w-6 h-6" />
//           </button>
//         </div>
//         <div className="p-4 overflow-y-auto">{children}</div>
//       </div>
//     </div>
//   )
// }
// const FormField = ({label, children}) => (
//   <div className="mb-3">
//     <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//     {children}
//   </div>
// )
// const Input = props => (
//   <input
//     {...props}
//     className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//   />
// )
// const Select = ({children, ...props}) => (
//   <select
//     {...props}
//     className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//   >
//     {children}
//   </select>
// )
// const PageHeader = ({title, actions}) => (
//   <div className="flex justify-between items-center mb-4">
//     <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
//     {actions && <div className="flex space-x-2">{actions}</div>}
//   </div>
// )

// // --- Data Management Custom Hooks --------------------------------
// const useCrudManager = initialData => {
//   const [items, setItems] = useState(initialData)
//   const addItem = item => setItems(prev => [...prev, {...item, id: `NEW_${Date.now()}`}])
//   const updateItem = updatedItem => setItems(prev => prev.map(item => (item.id === updatedItem.id ? updatedItem : item)))
//   const deleteItem = id => {
//     if (window.confirm('本当に削除しますか？')) {
//       setItems(prev => prev.filter(item => item.id !== id))
//     }
//   }
//   return {items, addItem, updateItem, deleteItem}
// }

// const useStockCalculator = (products, productions, stockAdjustments) => {
//   const calculateUsedStock = useCallback(
//     rawMaterialId => {
//       return productions
//         .filter(p => p.type === '国産')
//         .reduce((sum, p) => {
//           const product = products.find(prod => prod.id === p.productId)
//           const recipeItem = product?.recipe.find(r => r.rawMaterialId === rawMaterialId)
//           return sum + (recipeItem ? recipeItem.amount * p.quantity : 0)
//         }, 0)
//     },
//     [products, productions]
//   )

//   const calculateAdjustedStock = useCallback(
//     rawMaterialId => {
//       return stockAdjustments.filter(adj => adj.rawMaterialId === rawMaterialId).reduce((sum, adj) => sum + adj.quantity, 0)
//     },
//     [stockAdjustments]
//   )

//   const calculateCurrentStock = useCallback(
//     rawMaterialId => {
//       const totalAdjusted = calculateAdjustedStock(rawMaterialId)
//       const totalUsed = calculateUsedStock(rawMaterialId)
//       return totalAdjusted - totalUsed
//     },
//     [calculateAdjustedStock, calculateUsedStock]
//   )

//   return {calculateCurrentStock, calculateUsedStock, calculateAdjustedStock}
// }

// // --- Dashboard Page Components -----------------------------------
// const useProductionDashboard = (products, rawMaterials, orders, productions, stockAdjustments, dailyStaffAssignments) => {
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const {calculateCurrentStock} = useStockCalculator(products, productions, stockAdjustments)
//   const today = new Date()
//   const currentYear = today.getFullYear()
//   const currentMonth = today.getMonth() + 1
//   const currentDate = today.getDate()
//   const todayString = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDate).padStart(2, '0')}`

//   const dashboardData = useMemo(() => {
//     try {
//       const productStockStatus = products.map(product => {
//         const totalProduction = productions.filter(p => p.productId === product.id).reduce((sum, p) => sum + p.quantity, 0)
//         const totalOrders = orders.filter(o => o.productId === product.id).reduce((sum, o) => sum + o.quantity, 0)
//         const currentStock = totalProduction - totalOrders
//         return {...product, currentStock, isAlert: currentStock < product.allowanceStock}
//       })

//       const rawMaterialStockStatus = rawMaterials.map(rm => {
//         const currentStock = calculateCurrentStock(rm.id)
//         return {...rm, currentStock, isAlert: currentStock < rm.safetyStock}
//       })

//       const monthlyPlans = products.map(product => {
//         const pastOrders = orders.filter(
//           o =>
//             o.productId === product.id &&
//             new Date(o.orderDate).getMonth() + 1 === currentMonth &&
//             new Date(o.orderDate).getFullYear() < currentYear
//         )
//         const demandForecast = pastOrders.length > 0 ? Math.ceil(pastOrders.reduce((sum, o) => sum + o.quantity, 0) / 3) : 30
//         return {
//           ...product,
//           monthlyProductionTarget: demandForecast + product.allowanceStock,
//         }
//       })

//       const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay()
//       const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
//       const calendarDays: any[] = []
//       for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push({day: null})

//       for (let day = 1; day <= daysInMonth; day++) {
//         const date = new Date(currentYear, currentMonth - 1, day)
//         const dateString = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
//         const dayOfWeek = date.getDay()
//         const isHoliday = dayOfWeek === 0 || dayOfWeek === 6 || companyHolidays.includes(dateString)
//         const isPast = day < currentDate

//         let dailyPlans = []
//         if (!isHoliday) {
//           const businessDaysRemaining = Array.from({length: daysInMonth - day + 1}, (_, i) => day + i).filter(d => {
//             const dt = new Date(currentYear, currentMonth - 1, d)
//             const dStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
//             const dw = dt.getDay()
//             return dw !== 0 && dw !== 6 && !companyHolidays.includes(dStr)
//           }).length

//           dailyPlans = monthlyPlans.map(product => {
//             const productionsUpToDay = productions
//               .filter(p => p.productId === product.id && new Date(p.productionDate) < date)
//               .reduce((sum, p) => sum + p.quantity, 0)

//             const remainingTarget = product.monthlyProductionTarget - productionsUpToDay
//             const dailyTarget = businessDaysRemaining > 0 ? Math.max(0, Math.ceil(remainingTarget / businessDaysRemaining)) : 0

//             const staffCountForDay = dailyStaffAssignments[dateString]?.[product.id] || PRODUCTION_SETTINGS.staffCount
//             const dailyCapacity = staffCountForDay * PRODUCTION_SETTINGS.workHours * product.productionCapacity

//             const productionsOnDate = productions
//               .filter(p => p.productId === product.id && p.productionDate === dateString)
//               .reduce((sum, p) => sum + p.quantity, 0)

//             return {
//               ...product,
//               dailyTarget,
//               dailyCapacity,
//               isRisky: dailyTarget > dailyCapacity,
//               monthlyProductionTarget: product.monthlyProductionTarget,
//               cumulativeProduction: productionsUpToDay,
//               businessDaysRemaining,
//               staffCount: staffCountForDay,
//               actualProduction: productionsOnDate,
//             }
//           })
//         }

//         calendarDays.push({
//           day,
//           dateString,
//           isCurrentMonth: true,
//           isToday: day === currentDate,
//           isHoliday,
//           isPast,
//           plans: dailyPlans,
//         })
//       }

//       return {
//         todayPlan: calendarDays.find(d => d.dateString === todayString)?.plans || [],
//         productStockStatus,
//         rawMaterialStockStatus,
//         calendarData: {year: currentYear, month: currentMonth, days: calendarDays},
//       }
//     } catch (e) {
//       console.error(e)
//       setError('データの計算中にエラーが発生しました。')
//       return {
//         todayPlan: [],
//         productStockStatus: [],
//         rawMaterialStockStatus: [],
//         calendarData: {year: currentYear, month: currentMonth, days: []},
//       }
//     }
//   }, [
//     products,
//     rawMaterials,
//     orders,
//     productions,
//     calculateCurrentStock,
//     currentYear,
//     currentMonth,
//     currentDate,
//     dailyStaffAssignments,
//     todayString,
//   ])

//   useEffect(() => {
//     const timer = setTimeout(() => setLoading(false), 500)
//     return () => clearTimeout(timer)
//   }, [])
//   return {loading, error, ...dashboardData}
// }

// const DashboardCard = ({title, children, className = ''}) => (
//   <div className={`bg-white border border-gray-200 rounded-lg p-2 md:p-4 shadow-sm ${className}`}>
//     <div className="flex items-center mb-2">
//       <h2 className="text-sm md:text-base font-semibold text-gray-700 ml-2">{title}</h2>
//     </div>
//     <div className="text-gray-600">{children}</div>
//   </div>
// )

// const InventoryStatus = ({items, title, thresholdKey}) => (
//   <DashboardCard title={title}>
//     <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
//       {items.map(item => (
//         <div
//           key={item.id}
//           className={`flex justify-between items-center p-1.5 rounded-md text-xs md:text-sm ${item.isAlert ? 'bg-red-100' : ''}`}
//         >
//           <span className="truncate pr-2 text-gray-800">
//             {item.name}
//             {item.color ? ` (${item.color})` : ''}
//           </span>
//           <div className="text-right">
//             <span className={`font-bold ${item.isAlert ? 'text-red-600' : 'text-gray-800'}`}>
//               {item.currentStock.toLocaleString()}
//             </span>
//             <span className="text-xs text-gray-500">
//               {' '}
//               / {item[thresholdKey].toLocaleString()}
//               {item.unit || '枚'}
//             </span>
//           </div>
//         </div>
//       ))}
//     </div>
//   </DashboardCard>
// )
// const DailyDetailModal = ({isOpen, onClose, dateString, plans, onUpdateStaff}) => {
//   if (!isOpen) return null
//   const [localStaffCounts, setLocalStaffCounts] = useState(() => {
//     const counts = {}
//     plans.forEach(p => {
//       counts[p.id] = p.staffCount
//     })
//     return counts
//   })

//   const handleStaffChange = (productId, count) => {
//     const newCount = parseInt(count, 10)
//     if (isNaN(newCount) || newCount < 0) return
//     setLocalStaffCounts(prev => ({...prev, [productId]: newCount}))
//     onUpdateStaff(dateString, productId, newCount)
//   }

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} title={`${dateString} 生産計画詳細`} size="4xl">
//       <div className="space-y-4">
//         {plans.map(plan => (
//           <div key={plan.id} className="bg-gray-50 p-3 rounded-lg border">
//             <h4 className="font-bold text-md text-gray-800 mb-2">
//               {plan.name} ({plan.color})
//             </h4>
//             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
//               <div className="bg-white p-2 rounded border">
//                 <p className="text-xs text-gray-500">月間生産目標</p>
//                 <p className="font-semibold">{plan.monthlyProductionTarget.toLocaleString()} 枚</p>
//               </div>
//               <div className="bg-white p-2 rounded border">
//                 <p className="text-xs text-gray-500">累計生産実績</p>
//                 <p className="font-semibold">{plan.cumulativeProduction.toLocaleString()} 枚</p>
//               </div>
//               <div className="bg-white p-2 rounded border">
//                 <p className="text-xs text-gray-500">残稼働日</p>
//                 <p className="font-semibold">{plan.businessDaysRemaining} 日</p>
//               </div>
//               <div className="bg-white p-2 rounded border">
//                 <p className="text-xs text-gray-500">日次生産目標</p>
//                 <p className="font-semibold text-blue-600">{plan.dailyTarget.toLocaleString()} 枚</p>
//               </div>
//               <div className="bg-white p-2 rounded border">
//                 <p className="text-xs text-gray-500">日次生産能力</p>
//                 <p className="font-semibold">{plan.dailyCapacity.toLocaleString()} 枚</p>
//               </div>
//               <div className={`p-2 rounded border ${plan.isRisky ? 'bg-red-100' : 'bg-green-100'}`}>
//                 <p className="text-xs text-gray-500">安全度</p>
//                 <p className={`font-semibold ${plan.isRisky ? 'text-red-600' : 'text-green-700'}`}>
//                   {plan.isRisky ? '危険' : '安全'}
//                 </p>
//               </div>
//             </div>
//             <div className="mt-3">
//               <FormField label="稼働人数設定">
//                 <Input
//                   type="number"
//                   value={localStaffCounts[plan.id] || ''}
//                   onChange={e => handleStaffChange(plan.id, e.target.value)}
//                   className="w-24"
//                 />
//               </FormField>
//             </div>
//           </div>
//         ))}
//       </div>
//     </Modal>
//   )
// }
// const ProductionCalendar = ({calendarData, onDayClick}) => (
//   <DashboardCard title="月間生産スケジュール" className="col-span-1 lg:col-span-2">
//     <h3 className="text-lg font-bold text-gray-800 mb-2">
//       {calendarData.year}年 {calendarData.month}月
//     </h3>
//     <div className="grid grid-cols-7 gap-1 text-center text-xs">
//       {['日', '月', '火', '水', '木', '金', '土'].map(day => (
//         <div key={day} className="font-semibold text-gray-500 p-1">
//           {day}
//         </div>
//       ))}
//       {calendarData.days.map((day, index) => (
//         <div
//           key={index}
//           onClick={() => day.day && !day.isHoliday && onDayClick(day.dateString, day.plans)}
//           className={`rounded p-1 min-h-[100px] flex flex-col ${!day.isCurrentMonth ? 'opacity-30' : ''} ${day.isToday ? 'bg-blue-100 border border-blue-500' : day.isHoliday ? 'bg-gray-100' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}
//         >
//           <span className={`font-medium ${day.isToday ? 'text-blue-700' : 'text-gray-700'}`}>{day.day}</span>
//           {!day.isHoliday && day.day && (
//             <div className="text-xxs flex-grow overflow-y-auto space-y-0.5 mt-1 text-left">
//               {day.isPast
//                 ? day.plans
//                     .filter(p => p.actualProduction > 0)
//                     .map(plan => (
//                       <div key={plan.id} className="flex items-center bg-gray-200 px-1 py-0.5 rounded-sm">
//                         <span className="truncate flex-1">
//                           {plan.name}({plan.color})
//                         </span>{' '}
//                         <span className="font-semibold ml-1">{plan.actualProduction}</span>
//                       </div>
//                     ))
//                 : day.plans.map(plan => (
//                     <div key={plan.id} className="flex items-center">
//                       {plan.isRisky && <AlertTriangleIcon className="w-3 h-3 text-red-500 mr-1 flex-shrink-0" />}
//                       <span className="truncate">
//                         {plan.name}({plan.color})
//                       </span>
//                     </div>
//                   ))}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   </DashboardCard>
// )
// const ProductionDashboardPage = ({appData, onUpdateStaff}) => {
//   const {products, rawMaterials, orders, productions, stockAdjustments, dailyStaffAssignments} = appData
//   const {loading, error, productStockStatus, rawMaterialStockStatus, calendarData} = useProductionDashboard(
//     products,
//     rawMaterials,
//     orders,
//     productions,
//     stockAdjustments,
//     dailyStaffAssignments
//   )

//   const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
//   const [selectedDate, setSelectedDate] = useState(null)
//   const [selectedPlans, setSelectedPlans] = useState([])

//   const handleDayClick = (dateString, plans) => {
//     setSelectedDate(dateString)
//     setSelectedPlans(plans)
//     setIsDetailModalOpen(true)
//   }
//   const handleCloseDetailModal = () => setIsDetailModalOpen(false)

//   if (loading)
//     return (
//       <div className="w-full flex items-center justify-center p-8">
//         <Spinner />
//       </div>
//     )
//   if (error)
//     return (
//       <div className="w-full flex flex-col items-center justify-center p-8 text-red-600">
//         <AlertTriangleIcon className="w-12 h-12 mb-4" />
//         <h2>エラー発生</h2>
//         <p>{error}</p>
//       </div>
//     )

//   return (
//     <>
//       <PageHeader title="生産管理ダッシュボード" />
//       <div className="grid grid-cols-1 gap-4">
//         <ProductionCalendar calendarData={calendarData} onDayClick={handleDayClick} />
//         <InventoryStatus items={rawMaterialStockStatus} title="原材料在庫状況" thresholdKey="safetyStock" />
//       </div>
//       <DailyDetailModal
//         isOpen={isDetailModalOpen}
//         onClose={handleCloseDetailModal}
//         dateString={selectedDate}
//         plans={selectedPlans}
//         onUpdateStaff={onUpdateStaff}
//       />
//     </>
//   )
// }

// // --- Product Master Page Components ------------------------------
// const ProductForm = ({product, onSave, onCancel, rawMaterials}) => {
//   const [formData, setFormData] = useState(
//     product || {name: '', color: '', cost: 0, productionCapacity: 0, allowanceStock: 0, recipe: []}
//   )
//   const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value})
//   const handleRecipeChange = (index, field, value) => {
//     const newRecipe = [...formData.recipe]
//     newRecipe[index][field] = value
//     setFormData({...formData, recipe: newRecipe})
//   }
//   const addRecipeItem = () => setFormData({...formData, recipe: [...formData.recipe, {rawMaterialId: '', amount: 0}]})
//   const removeRecipeItem = index => setFormData({...formData, recipe: formData.recipe.filter((_, i) => i !== index)})
//   const handleSubmit = e => {
//     e.preventDefault()
//     onSave(formData)
//   }
//   return (
//     <form onSubmit={handleSubmit}>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <FormField label="商品名">
//           <Input name="name" value={formData.name} onChange={handleChange} required />
//         </FormField>
//         <FormField label="カラー">
//           <Input name="color" value={formData.color} onChange={handleChange} />
//         </FormField>
//         <FormField label="コスト（税抜）">
//           <Input type="number" name="cost" value={formData.cost} onChange={handleChange} required />
//         </FormField>
//         <FormField label="生産能力(枚/人·時)">
//           <Input type="number" name="productionCapacity" value={formData.productionCapacity} onChange={handleChange} required />
//         </FormField>
//         <FormField label="余裕在庫数(枚)">
//           <Input type="number" name="allowanceStock" value={formData.allowanceStock} onChange={handleChange} required />
//         </FormField>
//       </div>
//       <div className="mt-4">
//         <h4 className="text-md font-semibold text-gray-800 mb-2">原材料レシピ</h4>
//         {formData.recipe.map((item, index) => (
//           <div key={index} className="flex items-center space-x-2 mb-2">
//             <Select
//               value={item.rawMaterialId}
//               onChange={e => handleRecipeChange(index, 'rawMaterialId', e.target.value)}
//               className="flex-1"
//             >
//               <option value="">原材料を選択</option>
//               {rawMaterials.map(rm => (
//                 <option key={rm.id} value={rm.id}>
//                   {rm.name}
//                 </option>
//               ))}
//             </Select>
//             <Input
//               type="number"
//               value={item.amount}
//               onChange={e => handleRecipeChange(index, 'amount', e.target.value)}
//               className="w-24"
//               placeholder="使用量"
//             />
//             <Button variant="danger" onClick={() => removeRecipeItem(index)}>
//               <Trash2Icon className="w-4 h-4" />
//             </Button>
//           </div>
//         ))}
//         <Button variant="secondary" onClick={addRecipeItem}>
//           <PlusIcon className="w-4 h-4 mr-1" />
//           レシピ追加
//         </Button>
//       </div>
//       <div className="flex justify-end space-x-2 mt-6">
//         <Button variant="secondary" onClick={onCancel}>
//           キャンセル
//         </Button>
//         <Button type="submit" variant="primary">
//           保存
//         </Button>
//       </div>
//     </form>
//   )
// }
// const ProductMasterPage = ({appData}) => {
//   const {products, rawMaterials, productHandlers} = appData
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [editingProduct, setEditingProduct] = useState(null)
//   const handleOpenModal = (product = null) => {
//     setEditingProduct(product)
//     setIsModalOpen(true)
//   }
//   const handleCloseModal = () => {
//     setIsModalOpen(false)
//     setEditingProduct(null)
//   }
//   const handleSave = product => {
//     if (product.id) {
//       productHandlers.update(product)
//     } else {
//       productHandlers.add(product)
//     }
//     handleCloseModal()
//   }
//   return (
//     <>
//       <PageHeader
//         title="商品マスター"
//         actions={
//           <Button onClick={() => handleOpenModal()}>
//             <PlusIcon className="w-4 h-4 mr-1" />
//             新規登録
//           </Button>
//         }
//       />
//       <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
//         <table className="w-full text-sm text-left text-gray-600">
//           <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
//             <tr>
//               {['商品名', 'カラー', 'コスト', '生産能力', '余裕在庫', '操作'].map(h => (
//                 <th key={h} className="px-4 py-2">
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {products.map(p => (
//               <tr key={p.id} className="border-b hover:bg-gray-50">
//                 <td className="px-4 py-2 font-medium text-gray-900">{p.name}</td>
//                 <td className="px-4 py-2">{p.color}</td>
//                 <td className="px-4 py-2">¥{p.cost.toLocaleString()}</td>
//                 <td className="px-4 py-2">{p.productionCapacity}枚</td>
//                 <td className="px-4 py-2">{p.allowanceStock}枚</td>
//                 <td className="px-4 py-2">
//                   <div className="flex space-x-2">
//                     <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:text-blue-800">
//                       <EditIcon className="w-4 h-4" />
//                     </button>
//                     <button onClick={() => productHandlers.delete(p.id)} className="text-red-600 hover:text-red-800">
//                       <Trash2Icon className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? '商品編集' : '商品登録'}>
//         <ProductForm product={editingProduct} onSave={handleSave} onCancel={handleCloseModal} rawMaterials={rawMaterials} />
//       </Modal>
//     </>
//   )
// }

// // --- Raw Material Master Page Components -------------------------
// const StockHistoryModal = ({isOpen, onClose, material, history, onAddHistory, used}) => {
//   const [formData, setFormData] = useState({date: new Date().toISOString().slice(0, 10), reason: '入荷', quantity: ''})
//   if (!isOpen) return null

//   const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value})
//   const handleSubmit = e => {
//     e.preventDefault()
//     const quantity = parseInt(formData.quantity, 10)
//     if (isNaN(quantity) || quantity === 0) return
//     onAddHistory({
//       rawMaterialId: material.id,
//       date: formData.date,
//       reason: formData.reason,
//       quantity: formData.reason === '入荷' ? quantity : -quantity,
//     })
//     setFormData({date: new Date().toISOString().slice(0, 10), reason: '入荷', quantity: ''})
//   }

//   const combinedHistory = [
//     ...history.map(h => ({...h, type: 'adjustment'})),
//     {date: '期間中合計', reason: '生産消費', quantity: -used, type: 'production'},
//   ].sort((a, b) => new Date(b.date) - new Date(a.date))

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} title={`在庫増減履歴: ${material.name}`} size="2xl">
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="md:col-span-2">
//           <h4 className="font-semibold mb-2">履歴一覧</h4>
//           <div className="border rounded-lg max-h-96 overflow-y-auto">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50 sticky top-0">
//                 <tr>
//                   {['日付', '理由', '変動量'].map(h => (
//                     <th key={h} className="px-3 py-2 text-left">
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {combinedHistory.map((item, i) => (
//                   <tr key={item.id || `prod-${i}`} className="border-b">
//                     <td className="px-3 py-2">{item.date}</td>
//                     <td className="px-3 py-2">{item.reason}</td>
//                     <td className={`px-3 py-2 font-semibold ${item.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                       {item.quantity > 0 ? `+${item.quantity.toLocaleString()}` : item.quantity.toLocaleString()} {material.unit}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//         <div>
//           <h4 className="font-semibold mb-2">在庫の手動登録</h4>
//           <form onSubmit={handleSubmit} className="bg-gray-50 p-3 rounded-lg border">
//             <FormField label="日付">
//               <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
//             </FormField>
//             <FormField label="理由">
//               <Select name="reason" value={formData.reason} onChange={handleChange}>
//                 <option>入荷</option>
//                 <option>廃棄</option>
//                 <option>サンプル使用</option>
//                 <option>棚卸差異</option>
//               </Select>
//             </FormField>
//             <FormField label="数量">
//               <Input
//                 type="number"
//                 name="quantity"
//                 value={formData.quantity}
//                 onChange={handleChange}
//                 required
//                 placeholder="入荷は正、その他は負で入力"
//               />
//             </FormField>
//             <Button type="submit" variant="primary" className="w-full mt-2">
//               履歴を登録
//             </Button>
//           </form>
//         </div>
//       </div>
//     </Modal>
//   )
// }

// const RawMaterialForm = ({material, onSave, onCancel}) => {
//   const [formData, setFormData] = useState(material || {name: '', category: '', unit: 'g', cost: 0, safetyStock: 0})
//   const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value})
//   const handleSubmit = e => {
//     e.preventDefault()
//     onSave(formData)
//   }
//   return (
//     <form onSubmit={handleSubmit}>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <FormField label="名称">
//           <Input name="name" value={formData.name} onChange={handleChange} required />
//         </FormField>
//         <FormField label="カテゴリ">
//           <Input name="category" value={formData.category} onChange={handleChange} />
//         </FormField>
//         <FormField label="単位">
//           <Select name="unit" value={formData.unit} onChange={handleChange}>
//             <option>g</option>
//             <option>個</option>
//           </Select>
//         </FormField>
//         <FormField label="コスト（税抜）">
//           <Input type="number" name="cost" value={formData.cost} onChange={handleChange} required />
//         </FormField>
//         <FormField label="安全在庫数">
//           <Input type="number" name="safetyStock" value={formData.safetyStock} onChange={handleChange} required />
//         </FormField>
//       </div>
//       <div className="flex justify-end space-x-2 mt-6">
//         <Button variant="secondary" onClick={onCancel}>
//           キャンセル
//         </Button>
//         <Button type="submit" variant="primary">
//           保存
//         </Button>
//       </div>
//     </form>
//   )
// }
// const RawMaterialMasterPage = ({appData}) => {
//   const {products, productions, rawMaterials, stockAdjustments, materialHandlers, adjustmentHandlers} = appData
//   const {calculateCurrentStock, calculateUsedStock} = useStockCalculator(products, productions, stockAdjustments)
//   const [isFormModalOpen, setIsFormModalOpen] = useState(false)
//   const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
//   const [selectedMaterial, setSelectedMaterial] = useState(null)

//   const handleOpenFormModal = (material = null) => {
//     setSelectedMaterial(material)
//     setIsFormModalOpen(true)
//   }
//   const handleCloseFormModal = () => {
//     setSelectedMaterial(null)
//     setIsFormModalOpen(false)
//   }
//   const handleOpenHistoryModal = material => {
//     setSelectedMaterial(material)
//     setIsHistoryModalOpen(true)
//   }
//   const handleCloseHistoryModal = () => {
//     setSelectedMaterial(null)
//     setIsHistoryModalOpen(false)
//   }

//   const handleSave = material => {
//     if (material.id) {
//       materialHandlers.update(material)
//     } else {
//       materialHandlers.add(material)
//     }
//     handleCloseFormModal()
//   }

//   return (
//     <>
//       <PageHeader
//         title="原材料マスター"
//         actions={
//           <Button onClick={() => handleOpenFormModal()}>
//             <PlusIcon className="w-4 h-4 mr-1" />
//             新規登録
//           </Button>
//         }
//       />
//       <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
//         <table className="w-full text-sm text-left text-gray-600">
//           <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
//             <tr>
//               {['名称', 'カテゴリ', '安全在庫', '現在庫', '危険度', '操作'].map(h => (
//                 <th key={h} className="px-4 py-2">
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {rawMaterials.map(m => {
//               const currentStock = calculateCurrentStock(m.id)
//               const isAlert = currentStock < m.safetyStock
//               return (
//                 <tr key={m.id} className="border-b hover:bg-gray-50">
//                   <td className="px-4 py-2 font-medium text-gray-900">{m.name}</td>
//                   <td className="px-4 py-2">{m.category}</td>
//                   <td className="px-4 py-2">
//                     {m.safetyStock.toLocaleString()} {m.unit}
//                   </td>
//                   <td className={`px-4 py-2 font-semibold ${isAlert ? 'text-red-600' : 'text-gray-800'}`}>
//                     {currentStock.toLocaleString()} {m.unit}
//                   </td>
//                   <td className="px-4 py-2">
//                     {isAlert ? (
//                       <span className="flex items-center text-red-600">
//                         <AlertTriangleIcon className="w-4 h-4 mr-1" />
//                         危険
//                       </span>
//                     ) : (
//                       <span className="flex items-center text-green-600">
//                         <CheckCircleIcon className="w-4 h-4 mr-1" />
//                         安全
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-4 py-2">
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => handleOpenHistoryModal(m)}
//                         className="text-gray-500 hover:text-blue-600"
//                         title="在庫増減履歴"
//                       >
//                         <HistoryIcon className="w-4 h-4" />
//                       </button>
//                       <button onClick={() => handleOpenFormModal(m)} className="text-gray-500 hover:text-blue-600" title="編集">
//                         <EditIcon className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={() => materialHandlers.delete(m.id)}
//                         className="text-gray-500 hover:text-red-600"
//                         title="削除"
//                       >
//                         <Trash2Icon className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               )
//             })}
//           </tbody>
//         </table>
//       </div>
//       <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={selectedMaterial ? '原材料編集' : '原材料登録'}>
//         <RawMaterialForm material={selectedMaterial} onSave={handleSave} onCancel={handleCloseFormModal} />
//       </Modal>
//       {selectedMaterial && (
//         <StockHistoryModal
//           isOpen={isHistoryModalOpen}
//           onClose={handleCloseHistoryModal}
//           material={selectedMaterial}
//           history={stockAdjustments.filter(h => h.rawMaterialId === selectedMaterial.id)}
//           onAddHistory={adjustmentHandlers.add}
//           used={calculateUsedStock(selectedMaterial.id)}
//         />
//       )}
//     </>
//   )
// }

// // --- Order Data Page Components ----------------------------------
// const OrderForm = ({order, onSave, onCancel, products}) => {
//   const [formData, setFormData] = useState(
//     order || {orderDate: new Date().toISOString().slice(0, 10), productId: '', quantity: 0}
//   )
//   const amount = useMemo(() => {
//     const product = products.find(p => p.id === formData.productId)
//     return product ? product.cost * formData.quantity : 0
//   }, [formData.productId, formData.quantity, products])
//   const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value})
//   const handleSubmit = e => {
//     e.preventDefault()
//     onSave({...formData, amount})
//   }
//   return (
//     <form onSubmit={handleSubmit}>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <FormField label="受注日">
//           <Input type="date" name="orderDate" value={formData.orderDate} onChange={handleChange} required />
//         </FormField>
//         <FormField label="商品">
//           <Select name="productId" value={formData.productId} onChange={handleChange} required>
//             <option value="">商品を選択</option>
//             {products.map(p => (
//               <option key={p.id} value={p.id}>
//                 {p.name} ({p.color})
//               </option>
//             ))}
//           </Select>
//         </FormField>
//         <FormField label="受注枚数">
//           <Input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" />
//         </FormField>
//         <FormField label="売上金額">
//           <div className="px-2 py-1.5 bg-gray-100 rounded-md text-gray-700">¥{amount.toLocaleString()}</div>
//         </FormField>
//       </div>
//       <div className="flex justify-end space-x-2 mt-6">
//         <Button variant="secondary" onClick={onCancel}>
//           キャンセル
//         </Button>
//         <Button type="submit" variant="primary">
//           保存
//         </Button>
//       </div>
//     </form>
//   )
// }
// const OrderDataPage = ({appData}) => {
//   const {orders, products, orderHandlers} = appData
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [editingOrder, setEditingOrder] = useState(null)
//   const handleOpenModal = (order = null) => {
//     setEditingOrder(order)
//     setIsModalOpen(true)
//   }
//   const handleCloseModal = () => {
//     setIsModalOpen(false)
//     setEditingOrder(null)
//   }
//   const handleSave = order => {
//     if (order.id) {
//       orderHandlers.update(order)
//     } else {
//       orderHandlers.add(order)
//     }
//     handleCloseModal()
//   }
//   const getProductDisplayName = id => {
//     const product = products.find(p => p.id === id)
//     return product ? `${product.name} (${product.color})` : 'N/A'
//   }
//   return (
//     <>
//       <PageHeader
//         title="受注データ"
//         actions={
//           <Button onClick={() => handleOpenModal()}>
//             <PlusIcon className="w-4 h-4 mr-1" />
//             新規登録
//           </Button>
//         }
//       />
//       <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
//         <table className="w-full text-sm text-left text-gray-600">
//           <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
//             <tr>
//               {['受注日', '商品名', '枚数', '金額', '操作'].map(h => (
//                 <th key={h} className="px-4 py-2">
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map(o => (
//               <tr key={o.id} className="border-b hover:bg-gray-50">
//                 <td className="px-4 py-2">{o.orderDate}</td>
//                 <td className="px-4 py-2 font-medium text-gray-900">{getProductDisplayName(o.productId)}</td>
//                 <td className="px-4 py-2">{o.quantity.toLocaleString()}枚</td>
//                 <td className="px-4 py-2">¥{o.amount.toLocaleString()}</td>
//                 <td className="px-4 py-2">
//                   <div className="flex space-x-2">
//                     <button onClick={() => handleOpenModal(o)} className="text-blue-600 hover:text-blue-800">
//                       <EditIcon className="w-4 h-4" />
//                     </button>
//                     <button onClick={() => orderHandlers.delete(o.id)} className="text-red-600 hover:text-red-800">
//                       <Trash2Icon className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingOrder ? '受注編集' : '受注登録'}>
//         <OrderForm order={editingOrder} onSave={handleSave} onCancel={handleCloseModal} products={products} />
//       </Modal>
//     </>
//   )
// }

// // --- Production Data Page Components -----------------------------
// const ProductionForm = ({production, onSave, onCancel, products}) => {
//   const [formData, setFormData] = useState(
//     production || {productionDate: new Date().toISOString().slice(0, 10), productId: '', quantity: 0, type: '国産'}
//   )
//   const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value})
//   const handleSubmit = e => {
//     e.preventDefault()
//     onSave(formData)
//   }
//   return (
//     <form onSubmit={handleSubmit}>
//       <div className="space-y-3">
//         <FormField label="生産日">
//           <Input type="date" name="productionDate" value={formData.productionDate} onChange={handleChange} required />
//         </FormField>
//         <FormField label="商品">
//           <Select name="productId" value={formData.productId} onChange={handleChange} required>
//             <option value="">商品を選択</option>
//             {products.map(p => (
//               <option key={p.id} value={p.id}>
//                 {p.name} ({p.color})
//               </option>
//             ))}
//           </Select>
//         </FormField>
//         <FormField label="生産枚数">
//           <Input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" />
//         </FormField>
//         <FormField label="生産区分">
//           <div className="flex space-x-4">
//             <label>
//               <input type="radio" name="type" value="国産" checked={formData.type === '国産'} onChange={handleChange} /> 国産
//             </label>
//             <label>
//               <input type="radio" name="type" value="中国産" checked={formData.type === '中国産'} onChange={handleChange} />{' '}
//               中国産
//             </label>
//           </div>
//         </FormField>
//       </div>
//       <div className="flex justify-end space-x-2 mt-6">
//         <Button variant="secondary" onClick={onCancel}>
//           キャンセル
//         </Button>
//         <Button type="submit" variant="primary">
//           保存
//         </Button>
//       </div>
//     </form>
//   )
// }
// const ProductionDataPage = ({appData}) => {
//   const {productions, products, productionHandlers} = appData
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [editingProduction, setEditingProduction] = useState(null)
//   const handleOpenModal = (prod = null) => {
//     setEditingProduction(prod)
//     setIsModalOpen(true)
//   }
//   const handleCloseModal = () => {
//     setIsModalOpen(false)
//     setEditingProduction(null)
//   }
//   const handleSave = prod => {
//     if (prod.id) {
//       productionHandlers.update(prod)
//     } else {
//       productionHandlers.add(prod)
//     }
//     handleCloseModal()
//   }
//   const getProductDisplayName = id => {
//     const product = products.find(p => p.id === id)
//     return product ? `${product.name} (${product.color})` : 'N/A'
//   }
//   return (
//     <>
//       <PageHeader
//         title="生産データ"
//         actions={
//           <Button onClick={() => handleOpenModal()}>
//             <PlusIcon className="w-4 h-4 mr-1" />
//             新規登録
//           </Button>
//         }
//       />
//       <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
//         <table className="w-full text-sm text-left text-gray-600">
//           <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
//             <tr>
//               {['生産日', '商品名', '枚数', '区分', '操作'].map(h => (
//                 <th key={h} className="px-4 py-2">
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {productions.map(p => (
//               <tr key={p.id} className="border-b hover:bg-gray-50">
//                 <td className="px-4 py-2">{p.productionDate}</td>
//                 <td className="px-4 py-2 font-medium text-gray-900">{getProductDisplayName(p.productId)}</td>
//                 <td className="px-4 py-2">{p.quantity.toLocaleString()}枚</td>
//                 <td className="px-4 py-2">
//                   <span
//                     className={`px-2 py-0.5 text-xs rounded-full ${p.type === '国産' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
//                   >
//                     {p.type}
//                   </span>
//                 </td>
//                 <td className="px-4 py-2">
//                   <div className="flex space-x-2">
//                     <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:text-blue-800">
//                       <EditIcon className="w-4 h-4" />
//                     </button>
//                     <button onClick={() => productionHandlers.delete(p.id)} className="text-red-600 hover:text-red-800">
//                       <Trash2Icon className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduction ? '生産実績編集' : '生産実績登録'}>
//         <ProductionForm production={editingProduction} onSave={handleSave} onCancel={handleCloseModal} products={products} />
//       </Modal>
//     </>
//   )
// }

// // --- Navigation and Layout Components ----------------------------
// const navItems = [
//   {name: 'ダッシュボード', icon: HomeIcon, page: 'dashboard'},
//   {name: '商品マスター', icon: BoxIcon, page: 'products'},
//   {name: '原材料マスター', icon: WrenchIcon, page: 'materials'},
//   {name: '受注データ', icon: ClipboardListIcon, page: 'orders'},
//   {name: '生産データ', icon: FactoryIcon, page: 'productions'},
// ]
// const Header = ({activePage, setActivePage}) => {
//   const [isOpen, setIsOpen] = useState(false)
//   return (
//     <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
//       <div className="container mx-auto px-2 md:px-4">
//         <div className="flex justify-between items-center h-14">
//           <div className="flex items-center">
//             <FactoryIcon className="w-6 h-6 text-blue-600 mr-2" />
//             <h1 className="text-lg font-bold text-blue-600">生産管理システム</h1>
//           </div>
//           <nav className="hidden md:flex space-x-1">
//             {navItems.map(item => (
//               <button
//                 key={item.name}
//                 onClick={() => setActivePage(item.page)}
//                 className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${activePage === item.page ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
//               >
//                 <item.icon className="w-5 h-5 mr-2" />
//                 <span>{item.name}</span>
//               </button>
//             ))}
//           </nav>
//           <div className="md:hidden">
//             <button onClick={() => setIsOpen(!isOpen)} className="p-2">
//               <MenuIcon className="w-6 h-6 text-gray-700" />
//             </button>
//           </div>
//         </div>
//       </div>
//       {isOpen && (
//         <div className="md:hidden border-t border-gray-200">
//           <nav className="p-2 flex flex-col space-y-1">
//             {navItems.map(item => (
//               <button
//                 key={item.name}
//                 onClick={() => {
//                   setActivePage(item.page)
//                   setIsOpen(false)
//                 }}
//                 className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${activePage === item.page ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
//               >
//                 <item.icon className="w-5 h-5 mr-2" />
//                 <span>{item.name}</span>
//               </button>
//             ))}
//           </nav>
//         </div>
//       )}
//     </header>
//   )
// }

// // --- Main App Component ------------------------------------------
// export default function App() {
//   const [activePage, setActivePage] = useState('dashboard')

//   const {
//     items: products,
//     addItem: addProduct,
//     updateItem: updateProduct,
//     deleteItem: deleteProduct,
//   } = useCrudManager(initialProducts)
//   const {
//     items: rawMaterials,
//     addItem: addMaterial,
//     updateItem: updateMaterial,
//     deleteItem: deleteMaterial,
//   } = useCrudManager(initialRawMaterials)
//   const {items: orders, addItem: addOrder, updateItem: updateOrder, deleteItem: deleteOrder} = useCrudManager(initialOrders)
//   const {
//     items: productions,
//     addItem: addProduction,
//     updateItem: updateProduction,
//     deleteItem: deleteProduction,
//   } = useCrudManager(initialProductions)
//   const {
//     items: stockAdjustments,
//     addItem: addAdjustment,
//     updateItem: updateAdjustment,
//     deleteItem: deleteAdjustment,
//   } = useCrudManager(initialStockAdjustments)
//   const [dailyStaffAssignments, setDailyStaffAssignments] = useState({})

//   const handleUpdateStaff = (dateString, productId, count) => {
//     setDailyStaffAssignments(prev => {
//       const newAssignments = {...prev}
//       if (!newAssignments[dateString]) {
//         newAssignments[dateString] = {}
//       }
//       newAssignments[dateString][productId] = count
//       return newAssignments
//     })
//   }

//   const appData = {
//     products,
//     rawMaterials,
//     orders,
//     productions,
//     stockAdjustments,
//     dailyStaffAssignments,
//     productHandlers: {add: addProduct, update: updateProduct, delete: deleteProduct},
//     materialHandlers: {add: addMaterial, update: updateMaterial, delete: deleteMaterial},
//     orderHandlers: {add: addOrder, update: updateOrder, delete: deleteOrder},
//     productionHandlers: {add: addProduction, update: updateProduction, delete: deleteProduction},
//     adjustmentHandlers: {add: addAdjustment, update: updateAdjustment, delete: deleteAdjustment},
//   }

//   const renderPage = () => {
//     switch (activePage) {
//       case 'dashboard':
//         return <ProductionDashboardPage appData={appData} onUpdateStaff={handleUpdateStaff} />
//       case 'products':
//         return <ProductMasterPage appData={appData} />
//       case 'materials':
//         return <RawMaterialMasterPage appData={appData} />
//       case 'orders':
//         return <OrderDataPage appData={appData} />
//       case 'productions':
//         return <ProductionDataPage appData={appData} />
//       default:
//         return <ProductionDashboardPage appData={appData} onUpdateStaff={handleUpdateStaff} />
//     }
//   }
//   return (
//     <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
//       <Header activePage={activePage} setActivePage={setActivePage} />
//       <main className="p-2 md:p-4 container mx-auto">{renderPage()}</main>
//     </div>
//   )
// }
