import React from 'react'

export default function Page() {
  return <div>Page</div>
}

// 'use client'

// import React, {useState, useEffect} from 'react'
// import {Search, PlusCircle, Edit, Trash2, X, Users2, Shield, Crown, UserIcon} from 'lucide-react'
// import {getAllUsers} from '../../(builders)/serverActions'

// import {formatDate} from '@cm/class/Days/date-utils/formatters'

// export default function UsersPage() {
//   const [users, setUsers] = useState<User[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchKeyword, setSearchKeyword] = useState('')
//   const [roleFilter, setRoleFilter] = useState('')
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [editingUser, setEditingUser] = useState<User | null>(null)
//   const [deletingId, setDeletingId] = useState<number | null>(null)

//   useEffect(() => {
//     loadUsers()
//   }, [])

//   const loadUsers = async () => {
//     setLoading(true)
//     try {
//       const data = await getAllUsers()
//       setUsers(data)
//     } catch (error) {
//       console.error('ユーザーデータの取得に失敗しました:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchKeyword(e.target.value)
//   }

//   const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setRoleFilter(e.target.value)
//   }

//   const filteredUsers = users.filter(user => {
//     const keyword = searchKeyword.toLowerCase()
//     const matchesKeyword =
//       user.name?.toLowerCase().includes(keyword) ||
//       user.username?.toLowerCase().includes(keyword) ||
//       user.email?.toLowerCase().includes(keyword)

//     const matchesRole = !roleFilter || user.role === roleFilter

//     return matchesKeyword && matchesRole
//   })

//   const openModal = (user: User | null = null) => {
//     setEditingUser(user)
//     setIsModalOpen(true)
//   }

//   const closeModal = () => {
//     setIsModalOpen(false)
//     setEditingUser(null)
//   }

//   const handleSave = async (userData: Partial<User>) => {
//     try {
//       // 注意: 実際のユーザー管理機能は未実装のため、ダミー処理
//       console.log('ユーザー保存（未実装）:', userData)
//       alert('ユーザー管理機能は未実装です')
//       closeModal()
//     } catch (error) {
//       console.error('保存エラー:', error)
//       alert('保存中にエラーが発生しました')
//     }
//   }

//   const handleDelete = async () => {
//     try {
//       // 注意: 実際のユーザー削除機能は未実装のため、ダミー処理
//       console.log('ユーザー削除（未実装）:', deletingId)
//       alert('ユーザー管理機能は未実装です')
//       setDeletingId(null)
//     } catch (error) {
//       console.error('削除エラー:', error)
//       alert('削除中にエラーが発生しました')
//     }
//   }

//   const getRoleIcon = (role: string) => {
//     switch (role) {
//       case 'admin':
//         return <Crown className="text-yellow-600" size={18} />
//       case 'manager':
//         return <Shield className="text-blue-600" size={18} />
//       case 'staff':
//         return <UserIcon className="text-gray-600" size={18} />
//       default:
//         return <UserIcon className="text-gray-400" size={18} />
//     }
//   }

//   const getRoleLabel = (role: string) => {
//     switch (role) {
//       case 'admin':
//         return '管理者'
//       case 'manager':
//         return 'マネージャー'
//       case 'staff':
//         return 'スタッフ'
//       default:
//         return '不明'
//     }
//   }

//   const getRoleBadgeClass = (role: string) => {
//     switch (role) {
//       case 'admin':
//         return 'bg-yellow-100 text-yellow-800'
//       case 'manager':
//         return 'bg-blue-100 text-blue-800'
//       case 'staff':
//         return 'bg-gray-100 text-gray-800'
//       default:
//         return 'bg-gray-100 text-gray-600'
//     }
//   }

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
//             <Users2 className="text-blue-600" size={32} />
//             <h1 className="text-3xl font-bold text-gray-900">ユーザーマスタ</h1>
//           </div>
//           <button
//             onClick={() => openModal()}
//             className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             <PlusCircle size={20} />
//             <span>新規ユーザー追加</span>
//           </button>
//         </div>

//         {/* 注意メッセージ */}
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
//           <div className="flex">
//             <div className="flex-shrink-0">
//               <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
//                 <path
//                   fillRule="evenodd"
//                   d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//             </div>
//             <div className="ml-3">
//               <p className="text-sm text-yellow-700">
//                 <strong>注意:</strong> ユーザー管理機能は現在未実装です。表示のみとなっており、作成・編集・削除は機能しません。
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* 検索・フィルター */}
//         <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">検索</label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//                 <input
//                   type="text"
//                   value={searchKeyword}
//                   onChange={handleSearchChange}
//                   placeholder="ユーザー名、ログインID、メールアドレスで検索..."
//                   className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">権限</label>
//               <select
//                 value={roleFilter}
//                 onChange={handleRoleFilterChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">すべての権限</option>
//                 <option value="admin">管理者</option>
//                 <option value="manager">マネージャー</option>
//                 <option value="staff">スタッフ</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* ユーザー一覧 */}
//         <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//           <div className="px-6 py-4 border-b">
//             <h2 className="text-lg font-semibold text-gray-900">ユーザー一覧 ({filteredUsers.length}件)</h2>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ログインID</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     メールアドレス
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">権限</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">登録日</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredUsers.map(user => (
//                   <tr key={user.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="flex-shrink-0 h-10 w-10">
//                           <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
//                             <Users2 className="text-gray-500" size={20} />
//                           </div>
//                         </div>
//                         <div className="ml-4">
//                           <div className="text-sm font-medium text-gray-900">{user.name}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-gray-900">{user.username}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-gray-900">{user.email}</td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center space-x-2">
//                         {getRoleIcon(user.role!)}
//                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClass(user.role!)}`}>
//                           {getRoleLabel(user.role!)}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`px-2 py-1 text-xs font-semibold rounded-full ${
//                           user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                         }`}
//                       >
//                         {user.isActive ? 'アクティブ' : '無効'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-gray-500">
//                       {user.createdAt ? formatDate(user.createdAt) : '-'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center space-x-3">
//                         <button
//                           onClick={() => openModal(user)}
//                           className="text-blue-600 hover:text-blue-800 opacity-50 cursor-not-allowed"
//                           title="編集（未実装）"
//                           disabled
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button
//                           onClick={() => setDeletingId(user.id!)}
//                           className="text-red-600 hover:text-red-800 opacity-50 cursor-not-allowed"
//                           title="削除（未実装）"
//                           disabled
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {filteredUsers.length === 0 && (
//             <div className="text-center py-8">
//               <Users2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//               <p className="text-gray-500">
//                 {searchKeyword || roleFilter ? '検索条件に一致するユーザーが見つかりません' : 'ユーザーデータがありません'}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ユーザーフォームモーダル（未実装） */}
//       {isModalOpen && <UserModal user={editingUser} onSave={handleSave} onClose={closeModal} />}

//       {/* 削除確認モーダル（未実装） */}
//       {deletingId && (
//         <ConfirmModal
//           title="ユーザー削除確認"
//           message="このユーザーを削除してもよろしいですか？この操作は元に戻せません。"
//           onConfirm={handleDelete}
//           onClose={() => setDeletingId(null)}
//         />
//       )}
//     </div>
//   )
// }

// // ユーザーフォームモーダル（未実装）
// const UserModal = ({
//   user,
//   onSave,
//   onClose,
// }: {
//   user: User | null
//   onSave: (userData: Partial<User>) => void
//   onClose: () => void
// }) => {
//   const [formData, setFormData] = useState<Partial<User>>({
//     name: user?.name || '',
//     username: user?.username || '',
//     email: user?.email || '',
//     role: user?.role || 'staff',
//     isActive: user?.isActive ?? true,
//   })

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const {name, value, type} = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
//     }))
//   }

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()

//     // バリデーション
//     if (!formData.name || !formData.username || !formData.email) {
//       alert('ユーザー名、ログインID、メールアドレスは必須です')
//       return
//     }

//     onSave(formData)
//   }

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//         <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

//         <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg sm:max-w-lg">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-gray-900">{user ? 'ユーザー編集' : '新規ユーザー登録'}</h2>
//             <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//               <X size={24} />
//             </button>
//           </div>

//           {/* 未実装メッセージ */}
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
//             <p className="text-sm text-yellow-700">この機能は未実装です。実際の保存は行われません。</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">ユーザー名 *</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name || ''}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">ログインID *</label>
//               <input
//                 type="text"
//                 name="username"
//                 value={formData.username || ''}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス *</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email || ''}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">権限 *</label>
//               <select
//                 name="role"
//                 value={formData.role || 'staff'}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="staff">スタッフ</option>
//                 <option value="manager">マネージャー</option>
//                 <option value="admin">管理者</option>
//               </select>
//             </div>

//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 name="isActive"
//                 checked={formData.isActive ?? true}
//                 onChange={handleInputChange}
//                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//               />
//               <label className="ml-2 block text-sm text-gray-700">アクティブ（ログイン可能）</label>
//             </div>

//             <div className="flex justify-end space-x-3 pt-4">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
//               >
//                 キャンセル
//               </button>
//               <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
//                 保存
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

// // 確認モーダル
// const ConfirmModal = ({
//   title,
//   message,
//   onConfirm,
//   onClose,
// }: {
//   title: string
//   message: string
//   onConfirm: () => void
//   onClose: () => void
// }) => (
//   <div className="fixed inset-0 z-50 overflow-y-auto">
//     <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//       <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

//       <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
//         <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
//         <p className="text-gray-600 mb-6">{message}</p>
//         <div className="flex justify-end space-x-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
//           >
//             キャンセル
//           </button>
//           <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
//             削除
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// )
