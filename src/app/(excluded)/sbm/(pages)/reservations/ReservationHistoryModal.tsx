// 'use client'

// import React from 'react'
// import {X} from 'lucide-react'
// import {ReservationHistoryViewer} from '../../components/ReservationHistoryViewer'

// type ReservationHistoryModalProps = {
//   reservationId: number
//   onClose: () => void
// }

// export const ReservationHistoryModal: React.FC<ReservationHistoryModalProps> = ({reservationId, onClose}) => {
//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
//         <div className="flex justify-between items-center p-4 border-b">
//           <h2 className="text-lg font-semibold text-gray-900">予約変更履歴</h2>
//           <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
//             <X size={20} />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-4">
//           <ReservationHistoryViewer reservationId={reservationId} />
//         </div>

//         <div className="border-t p-4 flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
//           >
//             閉じる
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // 使用例
// /*
// import { useState } from 'react'
// import { ReservationHistoryModal } from './ReservationHistoryModal'

// const ReservationDetailPage = () => {
//   const [showHistoryModal, setShowHistoryModal] = useState(false)
//   const reservationId = 123 // 実際の予約ID

//   return (
//     <div>
//       <button
//         onClick={() => setShowHistoryModal(true)}
//         className="px-4 py-2 bg-blue-600 text-white rounded-md"
//       >
//         変更履歴を表示
//       </button>

//       {showHistoryModal && (
//         <ReservationHistoryModal
//           reservationId={reservationId}
//           onClose={() => setShowHistoryModal(false)}
//         />
//       )}
//     </div>
//   )
// }
// */
