import React from 'react'

export default function TopPage() {
  return <div>TopPage</div>
}

// 'use client'

// import React, {useState} from 'react'
// import {
//   BarChart2,
//   Users,
//   Package,
//   Calendar as CalendarIcon,
//   Printer,
//   Map,
//   Star,
//   Menu,
//   ChevronDown,
//   Users2,
//   Database,
//   Clock,
// } from 'lucide-react'
// import {useIsMobile} from '@cm/shadcn/hooks/use-mobile'
// import DashboardPage from './dashboard/page'
// import ReservationPage from './reservations/ReservationClient'

// import DeliveryRoutePage from './delivery-route/page'

// // メインアプリケーション
// export default function SBMApp() {
//   const isMobile = useIsMobile()
//   const [currentView, setCurrentView] = useState('dashboard')
//   const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

//   const changeView = (view: string) => {
//     setCurrentView(view)
//     setMobileMenuOpen(false)
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gray-100 font-sans">
//       <Header
//         currentView={currentView}
//         changeView={changeView}
//         isMobileMenuOpen={isMobileMenuOpen}
//         setMobileMenuOpen={setMobileMenuOpen}
//       />
//       <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
//         <div className="max-w-7xl mx-auto">
//           {currentView === 'dashboard' && <DashboardPage />}
//           {currentView === 'reservations' && <ReservationPage />}

//           {currentView === 'delivery_route' && <DeliveryRoutePage />}
//           {currentView === 'rfm' && <div>RFM分析（実装予定）</div>}
//           {currentView === 'invoices' && <div>伝票印刷（実装予定）</div>}
//           {currentView === 'customers' && <div>顧客マスタ（実装予定）</div>}
//           {currentView === 'products' && <div>商品マスタ（実装予定）</div>}
//           {currentView === 'history' && React.createElement(React.lazy(() => import('./history/page')))}
//           {currentView === 'users' && <div>ユーザーマスタ（実装予定）</div>}
//         </div>
//       </main>
//     </div>
//   )
// }

// // ヘッダーコンポーネント
// const Header = ({
//   currentView,
//   changeView,
//   isMobileMenuOpen,
//   setMobileMenuOpen,
// }: {
//   currentView: string
//   changeView: (view: string) => void
//   isMobileMenuOpen: boolean
//   setMobileMenuOpen: (open: boolean) => void
// }) => {
//   const isMobile = useIsMobile()

//   const navItems = [
//     {name: 'dashboard', label: 'ダッシュボード', icon: <BarChart2 size={20} />},
//     {name: 'reservations', label: '予約管理', icon: <CalendarIcon size={20} />},
//     {name: 'delivery_route', label: '配達ルート', icon: <Map size={20} />},
//     {name: 'rfm', label: '顧客分析', icon: <Star size={20} />},
//     {name: 'invoices', label: '伝票印刷', icon: <Printer size={20} />},
//   ]

//   const masterDataItems = [
//     {name: 'customers', label: '顧客マスタ', icon: <Users size={20} />},
//     {name: 'products', label: '商品マスタ', icon: <Package size={20} />},
//     {name: 'users', label: 'ユーザーマスタ', icon: <Users2 size={20} />},
//     {name: 'seed', label: 'データ管理', icon: <Database size={20} />},
//     {name: 'history', label: '変更履歴', icon: <Clock size={20} />},
//   ]

//   const NavLink = ({item}: {item: {name: string; label: string; icon: React.ReactNode}}) => (
//     <button
//       onClick={() => changeView(item.name)}
//       className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//         currentView === item.name ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
//       } ${isMobile ? 'w-full justify-start' : ''}`}
//     >
//       {item.icon} <span className="ml-2">{item.label}</span>
//     </button>
//   )

//   return (
//     <header className="bg-white shadow-md sticky top-0 z-30">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="flex justify-between items-center h-16">
//           <div className="flex items-center">
//             <h1 className="text-xl font-bold text-blue-600">弁当予約Pro</h1>
//           </div>

//           <div className="hidden md:flex items-center space-x-2">
//             {navItems.map(item => (
//               <NavLink key={item.name} item={item} />
//             ))}
//             <div className="relative group">
//               <button className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200">
//                 <Users2 size={20} /> <span className="ml-2">マスタ管理</span> <ChevronDown size={16} className="ml-1" />
//               </button>
//               <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
//                 {masterDataItems.map(item => (
//                   <button
//                     key={item.name}
//                     onClick={() => changeView(item.name)}
//                     className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   >
//                     {item.icon}
//                     <span className="ml-2">{item.label}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="md:hidden">
//             <button
//               onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
//               className="p-2 rounded-md text-gray-700 hover:bg-gray-200"
//             >
//               <Menu size={24} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {isMobileMenuOpen && (
//         <div className="md:hidden bg-white border-t">
//           <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//             {navItems.map(item => (
//               <NavLink key={item.name} item={item} />
//             ))}
//             <div className="border-t my-2"></div>
//             <h3 className="px-3 pt-2 text-xs font-semibold text-gray-500 uppercase">マスタ管理</h3>
//             {masterDataItems.map(item => (
//               <NavLink key={item.name} item={item} />
//             ))}
//           </div>
//         </div>
//       )}
//     </header>
//   )
// }
