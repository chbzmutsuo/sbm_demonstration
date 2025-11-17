'use client'

import React, {useState, useEffect} from 'react'
import {Plus, Edit3, Trash2, Users, Calendar, Clock, MapPin, CheckCircle, AlertCircle, Route, ExternalLink} from 'lucide-react'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {
  getDeliveryGroups,
  createDeliveryGroup,
  updateDeliveryGroup,
  deleteDeliveryGroup,
} from '@app/(excluded)/sbm/(builders)/deliveryActions'
import useModal, {useModalReturn} from '@cm/components/utils/modal/useModal'

interface DeliveryGroupManagerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  onGroupSelect: (group: DeliveryGroupType | null) => void
  selectedGroup: DeliveryGroupType | null
}

export const DeliveryGroupManager: React.FC<DeliveryGroupManagerProps> = ({
  selectedDate,
  onDateChange,
  onGroupSelect,
  selectedGroup,
}) => {
  const [groups, setGroups] = useState<DeliveryGroupType[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 選択日の配達グループを取得
  useEffect(() => {
    loadGroups()
  }, [selectedDate])

  const loadGroups = async () => {
    setIsLoading(true)
    try {
      const groups = await getDeliveryGroups(selectedDate)
      setGroups(groups as unknown as DeliveryGroupType[])
    } catch (error) {
      console.error('配達グループの取得に失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const GrpupCreateModalReturn = useModal()
  const handleCreateGroup = () => {
    GrpupCreateModalReturn.handleOpen({
      group: {
        deliveryDate: selectedDate,
        status: 'planning',
        totalReservations: 0,
        completedReservations: 0,
      },
    })
  }

  const handleEditGroup = (group: DeliveryGroupType) => {
    GrpupCreateModalReturn.handleOpen({group})
  }

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('この配達グループを削除しますか？')) return

    try {
      await deleteDeliveryGroup(groupId)
      if (selectedGroup?.id === groupId) {
        onGroupSelect(null)
      }
      loadGroups()
    } catch (error) {
      console.error('配達グループの削除に失敗:', error)
      alert('配達グループの削除に失敗しました')
    }
  }

  const getStatusColor = (status: DeliveryGroupType['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'route_generated':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: DeliveryGroupType['status']) => {
    switch (status) {
      case 'planning':
        return '計画中'
      case 'route_generated':
        return 'ルート生成済み'
      case 'in_progress':
        return '配達中'
      case 'completed':
        return '完了'
      default:
        return '不明'
    }
  }

  const getStatusIcon = (status: DeliveryGroupType['status']) => {
    switch (status) {
      case 'planning':
        return <Edit3 size={16} />
      case 'route_generated':
        return <Route size={16} />
      case 'in_progress':
        return <Clock size={16} />
      case 'completed':
        return <CheckCircle size={16} />
      default:
        return <AlertCircle size={16} />
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <Users className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">配達グループ管理</h2>
        </div>
        <div className="flex items-center space-x-3">
          {/* 日付選択 */}
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-500" />
            <input
              type="date"
              value={formatDate(selectedDate, 'YYYY-MM-DD')}
              onChange={e => onDateChange(new Date(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* グループ作成ボタン */}
          <button
            onClick={handleCreateGroup}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            グループ作成
          </button>
        </div>
      </div>

      {/* グループ一覧 */}
      <div className="bg-white rounded-lg shadow-sm border">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">配達グループがありません</h3>
            <p className="text-gray-500 mb-4">{formatDate(selectedDate, 'YYYY年MM月DD日')} の配達グループを作成してください</p>
            <button
              onClick={handleCreateGroup}
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              グループ作成
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {groups.map(group => (
              <div
                key={group.id}
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedGroup?.id === group.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => onGroupSelect(group)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}
                      >
                        {getStatusIcon(group.status)}
                        <span className="ml-1">{getStatusText(group.status)}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Users size={16} />
                        <span>担当: {group.userName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} />
                        <span>
                          配達先: {group.completedReservations}/{group.totalReservations}件
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={16} />
                        <span>予想時間: {group.estimatedDuration}分</span>
                      </div>
                    </div>

                    {group.routeUrl && (
                      <div className="mt-3">
                        <a
                          href={group.routeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink size={16} className="mr-1" />
                          配達ルートを表示
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleEditGroup(group)
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="編集"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleDeleteGroup(group.id!)
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* グループ作成・編集モーダル */}
      <p>
        <DeliveryGroupModal
          GrpupCreateModalReturn={GrpupCreateModalReturn}
          deliveryDate={selectedDate}
          onSave={async group => {
            try {
              if (GrpupCreateModalReturn.open?.group?.id) {
                await updateDeliveryGroup(group)
              } else {
                await createDeliveryGroup(group)
              }
              GrpupCreateModalReturn.handleClose()
              loadGroups()
            } catch (error) {
              console.error('グループの保存に失敗:', error)
              alert('グループの保存に失敗しました')
            }
          }}
          onClose={() => GrpupCreateModalReturn.handleClose()}
        />
      </p>
    </div>
  )
}

// グループ作成・編集モーダル
interface DeliveryGroupModalProps {
  GrpupCreateModalReturn: useModalReturn

  deliveryDate: Date
  onSave: (group: DeliveryGroupType) => void
  onClose: () => void
}

const DeliveryGroupModal: React.FC<DeliveryGroupModalProps> = ({
  GrpupCreateModalReturn,

  deliveryDate,
  onSave,
  onClose,
}) => {
  const group = GrpupCreateModalReturn.open?.group
  const [formData, setFormData] = useState({
    name: group?.name || '',
    userId: group?.userId || 1,
    userName: group?.userName || '',
    notes: group?.notes || '',
  })

  const [users] = useState([
    {id: 1, name: '田中太郎'},
    {id: 2, name: '佐藤花子'},
    {id: 3, name: '鈴木一郎'},
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedUser = users.find(u => u.id === formData.userId)

    if (!selectedUser) return alert('担当者を選択してください')

    const groupData: DeliveryGroupType = {
      ...group,
      name: formData.name,
      deliveryDate,
      userId: formData.userId,
      userName: selectedUser.name,
      status: group?.status || 'planning',
      totalReservations: group?.totalReservations || 0,
      completedReservations: group?.completedReservations || 0,
      notes: formData.notes,
      updatedAt: new Date(),
      createdAt: group?.createdAt || new Date(),
    }

    onSave(groupData)
  }

  return (
    <GrpupCreateModalReturn.Modal>
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{group ? '配達グループ編集' : '配達グループ作成'}</h3>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">グループ名 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 配達グループA"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">担当者 *</label>
            <select
              value={formData.userId}
              onChange={e => {
                const userId = parseInt(e.target.value)
                const user = users.find(u => u.id === userId)
                setFormData({...formData, userId, userName: user?.name || ''})
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">担当者を選択</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">配達日</label>
            <input
              type="date"
              value={formatDate(deliveryDate, 'YYYY-MM-DD')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="配達に関する特記事項があれば入力してください"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            {group ? '更新' : '作成'}
          </button>
        </div>
      </form>
    </GrpupCreateModalReturn.Modal>
  )
}

export default DeliveryGroupManager
