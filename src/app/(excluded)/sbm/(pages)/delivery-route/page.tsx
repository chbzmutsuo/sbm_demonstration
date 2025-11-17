'use client'

import React, {useState, useEffect} from 'react'

import {Truck, Calendar, Plus, Clock, MapPin} from 'lucide-react'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Days} from '@cm/class/Days/Days'
import {FilterSection, useFilterForm} from '@cm/components/utils/FilterSection'
import {getReservations} from '../../actions'
import {
  getDeliveryGroupsByDate,
  createDeliveryGroup,
  createMultipleDeliveryGroups,
  assignReservationToGroup,
  assignMultipleReservationsToGroup,
  moveReservationToGroup,
  sortGroupReservationsByDeliveryTime,
  generateGroupGoogleMapUrl,
  changeReservationOrder,
  moveReservationUp,
  moveReservationDown,
} from '../../(builders)/deliveryTeamActions'

import useModal from '@cm/components/utils/modal/useModal'
import {formatPhoneNumber} from '../../utils/phoneUtils'
import DeliveryRouteMap from '../../components/DeliveryRouteMap'
import TravelTimeCalculator from '../../components/TravelTimeCalculator'
import {toast, ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@shadcn/ui/select'
import {Button} from '@shadcn/ui/button'
import {Input} from '@shadcn/ui/input'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {Card} from '@cm/shadcn/ui/card'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

export default function DeliveryRoutePage() {
  const [reservations, setReservations] = useState<ReservationType[]>([])
  const [deliveryGroups, setDeliveryGroups] = useState<DeliveryGroupType[]>([])
  const [unassignedReservations, setUnassignedReservations] = useState<ReservationType[]>([])

  const [loading, setLoading] = useState(true)
  const [teamName, setTeamName] = useState('')
  const [selectedReservations, setSelectedReservations] = useState<number[]>([])
  const [movingReservation, setMovingReservation] = useState<{
    reservationId: number
    fromGroupId: number
    reservation: ReservationType
  } | null>(null)
  const [targetGroupId, setTargetGroupId] = useState<number | null>(null)

  // フィルターフォームの状態管理
  const defaultFilters = {
    date: formatDate(new Date()),
  }

  const {
    formValues: filterValues,
    setFormValues: setFilterValues,
    resetForm: resetFilterForm,
    handleInputChange: handleFilterInputChange,
  } = useFilterForm(defaultFilters)

  // 現在適用されているフィルター
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)

  // 新規追加のステート
  const [teamCount, setTeamCount] = useState<number>(1) // チーム一括作成用
  const [reservationAssignments, setReservationAssignments] = useState<{[reservationId: number]: number}>({}) // 予約ID -> グループID のマッピング
  const [teamReservationAssignments, setTeamReservationAssignments] = useState<{[reservationId: number]: number}>({}) // チーム内予約の移動用マッピング
  const [editingDeliveryOrder, setEditingDeliveryOrder] = useState<{
    reservationId: number
    groupId: number
    currentOrder: number
    newOrder: number
  } | null>(null)

  const MapModalReturn = useModal()
  const TeamModalReturn = useModal()
  const MoveModalReturn = useModal()
  const BulkTeamModalReturn = useModal() // 一括チーム作成モーダル
  const OrderModalReturn = useModal() // 順序変更モーダル

  const {session} = useGlobal()

  useEffect(() => {
    loadData()
  }, [appliedFilters])

  const loadData = async () => {
    setLoading(true)
    try {
      // 予約データを取得
      const selectedDate = new Date(appliedFilters.date)
      const nextDay = Days.day.add(selectedDate, 1)

      const reservationData = await getReservations({
        deliveryDate: {
          gte: toUtc(formatDate(selectedDate)),
          lt: toUtc(formatDate(nextDay)),
        },
      })
      setReservations(reservationData as unknown as ReservationType[])

      // 配達グループを取得
      const groupData = await getDeliveryGroupsByDate(appliedFilters.date)
      setDeliveryGroups(groupData as DeliveryGroupType[])

      // 未割り当ての予約を特定
      updateUnassignedReservations(reservationData as unknown as ReservationType[], groupData as DeliveryGroupType[])
    } catch (error) {
      console.error('データの取得に失敗しました:', error)
      toast.error('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 未割り当ての予約を特定する関数
  const updateUnassignedReservations = (allReservations: ReservationType[], groups: DeliveryGroupType[]) => {
    // すべての割り当て済み予約IDを取得
    const assignedIds = new Set<number>()
    groups.forEach(group => {
      group.groupReservations?.forEach(gr => {
        assignedIds.add(gr.sbmReservationId || 0)
      })
    })

    // 割り当てられていない予約をフィルタリング
    const unassigned = allReservations.filter(r => !assignedIds.has(r.id || 0))
    setUnassignedReservations(unassigned)
  }

  const handleCreateTeam = async () => {
    if (!teamName) {
      toast.error('チーム名を入力してください')
      return
    }

    try {
      // チーム作成処理
      const result = await createDeliveryGroup(teamName, new Date(appliedFilters.date), session?.id || 0, session?.name || '不明')

      if (result.success && result.group) {
        toast.success('チームを作成しました')

        // 新しいチームをリストに追加
        setDeliveryGroups([...deliveryGroups, result.group as DeliveryGroupType])
        setTeamName('')
        TeamModalReturn.handleClose()

        // 選択された予約があれば割り当て
        if (selectedReservations.length > 0) {
          for (const reservationId of selectedReservations) {
            await assignReservationToGroup(result?.group?.id || 0, reservationId)
          }

          // データを再読み込み
          loadData()
        }
      } else {
        toast.error(result.error || 'チームの作成に失敗しました')
      }
    } catch (error) {
      console.error('チーム作成エラー:', error)
      toast.error('チームの作成に失敗しました')
    }
  }

  // 複数チームを一括作成する処理
  const handleCreateMultipleTeams = async () => {
    if (teamCount < 1 || teamCount > 4) {
      toast.error('チーム数は1〜4の間で指定してください')
      return
    }

    try {
      // 複数チーム作成処理
      const result = await createMultipleDeliveryGroups(
        teamCount,
        new Date(appliedFilters.date),
        session?.id || 0,
        session?.name || '不明'
      )

      if (result.success && result.groups) {
        toast.success(`${teamCount}チームを作成しました`)

        // 新しいチームをリストに追加
        setDeliveryGroups([...deliveryGroups, ...result.groups])
        BulkTeamModalReturn.handleClose()

        // データを再読み込み
        loadData()
      } else {
        toast.error(result.error || 'チームの一括作成に失敗しました')
      }
    } catch (error) {
      console.error('チーム一括作成エラー:', error)
      toast.error('チームの一括作成に失敗しました')
    }
  }

  // 予約のチーム割り当てを一時的に保存（DB更新なし）
  const handleTempAssignReservation = (reservationId: number, groupId: number) => {
    setReservationAssignments(prev => ({
      ...prev,
      [reservationId]: groupId,
    }))
  }

  // チーム内予約のチーム割り当てを一時的に保存（DB更新なし）
  const handleTempTeamReservationAssignment = (reservationId: number, groupId: number) => {
    setTeamReservationAssignments(prev => ({
      ...prev,
      [reservationId]: groupId,
    }))
  }

  // 一時保存された予約割り当てを一括で確定
  const handleConfirmAssignments = async () => {
    const assignments: {[groupId: number]: number[]} = {}

    // グループIDごとに予約IDをグループ化
    Object.entries(reservationAssignments).forEach(([reservationId, groupId]) => {
      if (!assignments[groupId]) {
        assignments[groupId] = []
      }
      assignments[groupId].push(parseInt(reservationId))
    })

    try {
      // 各グループに対して一括割り当て処理
      for (const [groupId, reservationIds] of Object.entries(assignments)) {
        if (reservationIds.length > 0) {
          const result = await assignMultipleReservationsToGroup(parseInt(groupId), reservationIds)

          if (!result.success) {
            toast.error(`グループID ${groupId} への割り当てに失敗: ${result.error}`)
          }
        }
      }

      toast.success('予約の割り当てを確定しました')
      setReservationAssignments({}) // 割り当て情報をクリア

      // データを再読み込み
      loadData()
    } catch (error) {
      console.error('予約一括割り当てエラー:', error)
      toast.error('予約の一括割り当てに失敗しました')
    }
  }

  // チーム内予約の割り当て変更を一括で確定
  const handleConfirmTeamReservationAssignments = async () => {
    if (Object.keys(teamReservationAssignments).length === 0) {
      toast.info('変更する予約がありません')
      return
    }

    try {
      // 各予約を処理
      for (const [reservationIdStr, toGroupId] of Object.entries(teamReservationAssignments)) {
        const reservationId = parseInt(reservationIdStr)

        // 現在の割り当てを取得
        const currentGroup = deliveryGroups.find(group =>
          group.groupReservations?.some(gr => gr.sbmReservationId === reservationId)
        )

        if (currentGroup && currentGroup.id !== toGroupId) {
          // 別のグループに移動
          const result = await moveReservationToGroup(reservationId, currentGroup.id || 0, toGroupId)

          if (!result.success) {
            toast.error(`予約ID ${reservationId} の移動に失敗: ${result.error}`)
          }
        }
      }

      toast.success('予約の割り当てを変更しました')
      setTeamReservationAssignments({}) // 割り当て情報をクリア

      // データを再読み込み
      loadData()
    } catch (error) {
      console.error('予約移動エラー:', error)
      toast.error('予約の移動に失敗しました')
    }
  }

  const handleMoveReservation = async () => {
    if (!movingReservation || !targetGroupId) {
      toast.error('移動先のチームを選択してください')
      return
    }

    try {
      const result = await moveReservationToGroup(movingReservation.reservationId, movingReservation.fromGroupId, targetGroupId)

      if (result.success) {
        toast.success('予約を移動しました')

        // モーダルを閉じる
        MoveModalReturn.handleClose()
        setMovingReservation(null)
        setTargetGroupId(null)

        // データを再読み込み
        loadData()
      } else {
        toast.error(result.error || '予約の移動に失敗しました')
      }
    } catch (error) {
      console.error('予約移動エラー:', error)
      toast.error('予約の移動に失敗しました')
    }
  }

  const handleSortByDeliveryTime = async (groupId: number) => {
    try {
      const result = await sortGroupReservationsByDeliveryTime(groupId)

      if (result.success) {
        toast.success('納品時間順に並べ替えました')

        // データを再読み込み
        loadData()
      } else {
        toast.error(result.error || '並べ替えに失敗しました')
      }
    } catch (error) {
      console.error('並べ替えエラー:', error)
      toast.error('並べ替えに失敗しました')
    }
  }

  // 予約を上に移動
  const handleMoveReservationUp = async (groupId: number, reservationId: number) => {
    try {
      const result = await moveReservationUp(groupId, reservationId)

      if (result.success) {
        // データを再読み込み
        loadData()
      } else if (result.error) {
        toast.info(result.error)
      }
    } catch (error) {
      console.error('予約上移動エラー:', error)
      toast.error('予約の移動に失敗しました')
    }
  }

  // 予約を下に移動
  const handleMoveReservationDown = async (groupId: number, reservationId: number) => {
    try {
      const result = await moveReservationDown(groupId, reservationId)

      if (result.success) {
        // データを再読み込み
        loadData()
      } else if (result.error) {
        toast.info(result.error)
      }
    } catch (error) {
      console.error('予約下移動エラー:', error)
      toast.error('予約の移動に失敗しました')
    }
  }

  // 予約の順序を指定して変更
  const handleChangeReservationOrder = async () => {
    if (!editingDeliveryOrder) return

    const {groupId, reservationId, newOrder} = editingDeliveryOrder

    try {
      const result = await changeReservationOrder(groupId, reservationId, newOrder)

      if (result.success) {
        toast.success('予約の順序を変更しました')
        OrderModalReturn.handleClose()
        setEditingDeliveryOrder(null)

        // データを再読み込み
        loadData()
      } else {
        toast.error(result.error || '順序の変更に失敗しました')
      }
    } catch (error) {
      console.error('予約順序変更エラー:', error)
      toast.error('予約の順序変更に失敗しました')
    }
  }

  // 順序変更モーダルを開く
  const openOrderChangeModal = (reservationId: number, groupId: number, currentOrder: number) => {
    setEditingDeliveryOrder({
      reservationId,
      groupId,
      currentOrder,
      newOrder: currentOrder,
    })
    OrderModalReturn.handleOpen()
  }

  const handleGenerateMapUrl = async (groupId: number) => {
    try {
      const result = await generateGroupGoogleMapUrl(groupId)

      if (result.success && result.url) {
        // 新しいタブでURLを開く
        window.open(result.url, '_blank')

        toast.success('Google Mapを開きました')
      } else {
        toast.error(result.error || 'マップURLの生成に失敗しました')
      }
    } catch (error) {
      console.error('マップURL生成エラー:', error)
      toast.error('マップURLの生成に失敗しました')
    }
  }

  const getReservationById = (id: number): ReservationType | undefined => {
    return reservations.find(r => r.id === id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="space-y-6 p-4">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">配達ルート管理</h1>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => TeamModalReturn.handleOpen()} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-1" size={16} /> 新規チーム作成
            </Button>
            <Button onClick={() => BulkTeamModalReturn.handleOpen()} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-1" size={16} /> チーム一括作成
            </Button>
          </div>
        </div>

        {/* フィルター */}
        <FilterSection
          onApply={() => setAppliedFilters({...filterValues})}
          onClear={() => {
            resetFilterForm()
            setAppliedFilters(defaultFilters)
          }}
          title="配達日検索"
        >
          <div className="flex justify-center">
            <div className="w-64">
              <label className="block text-xs font-medium text-gray-700 mb-1">配達日</label>
              <input
                type="date"
                name="date"
                value={filterValues.date}
                onChange={handleFilterInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </FilterSection>

        <C_Stack className={` `}>
          {/* 未割り当ての予約リスト */}
          <Card>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="mr-2" size={20} />
                未割り当ての予約 ({unassignedReservations.length}件)
              </h2>
            </div>

            <div className="overflow-x-auto">
              {unassignedReservations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">未割り当ての予約はありません</div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4 px-4 py-2 bg-gray-100 rounded">
                    <div className="text-sm font-medium">
                      {Object.keys(reservationAssignments).length > 0 && (
                        <span>{Object.keys(reservationAssignments).length}件の予約が選択中</span>
                      )}
                    </div>
                    <Button
                      onClick={handleConfirmAssignments}
                      disabled={Object.keys(reservationAssignments).length === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      割り振り確定
                    </Button>
                  </div>

                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時間</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          顧客情報
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">住所</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          チーム選択
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {unassignedReservations.map(reservation => (
                        <tr key={reservation.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(reservation.deliveryDate, 'HH:mm')}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{reservation.customerName}</div>
                            <div className="text-xs text-gray-500">{formatPhoneNumber(reservation.phoneNumber || '')}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {reservation.prefecture}
                              {reservation.city}
                              {reservation.street}
                            </div>
                            {reservation.building && <div className="text-xs text-gray-500">{reservation.building}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {reservation.items?.map((item, index) => (
                                <div key={index} className="text-sm">
                                  {item.productName} x{item.quantity}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {deliveryGroups.length > 0 && (
                              <div className="flex flex-col space-y-2">
                                {deliveryGroups.map(group => (
                                  <label key={group.id} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`team-${reservation.id}`}
                                      value={group.id}
                                      checked={reservationAssignments[reservation.id || 0] === group.id}
                                      onChange={() => handleTempAssignReservation(reservation.id || 0, group.id || 0)}
                                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{group.name}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              onClick={() => MapModalReturn.handleOpen({reservationId: reservation.id})}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              地図
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </Card>
          {/* 配達チームリスト */}
          <AutoGridContainer
            {...{
              className: 'gap-4 mx-auto',
              maxCols: {
                sm: 2,
                // md: 2,
                // lg: 2,
                // xl: 2,
                // '2xl': 2,
              },
            }}
          >
            {deliveryGroups.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                この日の配達チームはありません。新規チームを作成してください。
              </div>
            ) : (
              deliveryGroups.map(group => (
                <Card key={group.id} className={`border-2 border-black w-[700px]`}>
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Truck className="mr-2" size={20} />
                      {group.name} ({group.groupReservations?.length || 0}件)
                    </h2>
                    <div className="flex gap-2">
                      <Button onClick={() => handleSortByDeliveryTime(group.id || 0)} variant="outline" size="sm">
                        <Clock className="mr-1" size={14} /> 納品時間順設定
                      </Button>
                      <Button onClick={() => handleGenerateMapUrl(group.id || 0)} variant="outline" size="sm">
                        <MapPin className="mr-1" size={14} /> 地図表示
                      </Button>
                    </div>
                  </div>

                  {/* チーム割り振り確定ボタン */}
                  {Object.keys(teamReservationAssignments).length > 0 &&
                    Object.values(teamReservationAssignments).some(
                      groupId =>
                        groupId !== group.id &&
                        Object.entries(teamReservationAssignments).some(([resId]) =>
                          group.groupReservations?.some(gr => gr.sbmReservationId === parseInt(resId))
                        )
                    ) && (
                      <div className="flex justify-between items-center mb-4 px-4 py-2 mt-2 bg-green-50 rounded">
                        <div className="text-sm font-medium">
                          <span>
                            {
                              Object.entries(teamReservationAssignments).filter(([resId]) =>
                                group.groupReservations?.some(gr => gr.sbmReservationId === parseInt(resId))
                              ).length
                            }
                            件の予約のチーム変更が選択中
                          </span>
                        </div>
                        <Button onClick={handleConfirmTeamReservationAssignments} className="bg-green-600 hover:bg-green-700">
                          チーム変更を確定
                        </Button>
                      </div>
                    )}

                  {/* チームに割り当てられた予約リスト */}
                  <div className="overflow-x-auto">
                    {/* 予約リスト */}
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">割り当て済み予約</h4>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              順序
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              時間
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              顧客情報
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              住所
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              チーム選択
                            </th>
                            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {group.groupReservations?.map(gr => {
                            const reservation = getReservationById(gr.sbmReservationId || 0)
                            if (!reservation) return null

                            return (
                              <tr key={gr.id} className="hover:bg-gray-50">
                                <td className="px-2 py-2 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900 mr-2">{gr.deliveryOrder}</span>
                                    <div className="flex flex-col">
                                      <button
                                        onClick={() => handleMoveReservationUp(group.id || 0, reservation.id || 0)}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        ▲
                                      </button>
                                      <button
                                        onClick={() => handleMoveReservationDown(group.id || 0, reservation.id || 0)}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        ▼
                                      </button>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatDate(reservation.deliveryDate, 'HH:mm')}
                                  </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{reservation.customerName}</div>
                                  <div className="text-xs text-gray-500">{formatPhoneNumber(reservation.phoneNumber || '')}</div>
                                </td>
                                <td className="px-2 py-2">
                                  <div className="text-sm text-gray-900">
                                    {reservation.prefecture}
                                    {reservation.city}
                                    {reservation.street}
                                  </div>
                                </td>
                                <td className="px-2 py-2">
                                  {/* チーム選択用ラジオボタン */}
                                  {deliveryGroups.length > 1 && (
                                    <div className="flex flex-col space-y-2 mb-2">
                                      {deliveryGroups.map(targetGroup => (
                                        <label key={targetGroup.id} className="flex items-center space-x-2 cursor-pointer">
                                          <input
                                            type="radio"
                                            name={`team-change-${reservation.id}`}
                                            value={targetGroup.id}
                                            checked={
                                              teamReservationAssignments[reservation.id || 0] === targetGroup.id ||
                                              (!teamReservationAssignments[reservation.id || 0] && group.id === targetGroup.id)
                                            }
                                            onChange={() =>
                                              handleTempTeamReservationAssignment(reservation.id || 0, targetGroup.id || 0)
                                            }
                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                          />
                                          <span className="text-sm font-medium text-gray-700">{targetGroup.name}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-right text-sm font-medium">
                                  <Button
                                    onClick={() =>
                                      openOrderChangeModal(reservation.id || 0, group.id || 0, gr.deliveryOrder || 0)
                                    }
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    順序変更
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* 配達順路間の所要時間表示 */}
                    <div className="mt-4 p-4 border-t">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">配達順路間の所要時間</h4>
                      <TravelTimeCalculator
                        reservations={
                          (group?.groupReservations ?? [])
                            .map(gr => getReservationById(gr.sbmReservationId || 0))
                            .filter(Boolean) as ReservationType[]
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </AutoGridContainer>
        </C_Stack>

        {/* チーム作成モーダル */}
        <TeamModalReturn.Modal>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">新規チーム作成</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                    チーム名
                  </label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder="チーム名を入力"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={TeamModalReturn.handleClose}>
                  キャンセル
                </Button>
                <Button onClick={handleCreateTeam}>作成</Button>
              </div>
            </div>
          </div>
        </TeamModalReturn.Modal>

        {/* チーム一括作成モーダル */}
        <BulkTeamModalReturn.Modal>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">チーム一括作成</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="teamCount" className="block text-sm font-medium text-gray-700">
                    作成するチーム数
                  </label>
                  <Select value={teamCount.toString()} onValueChange={value => setTeamCount(parseInt(value))}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="チーム数を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1チーム</SelectItem>
                      <SelectItem value="2">2チーム</SelectItem>
                      <SelectItem value="3">3チーム</SelectItem>
                      <SelectItem value="4">4チーム</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">チーム名は「チーム1」「チーム2」のように自動的に設定されます</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={BulkTeamModalReturn.handleClose}>
                  キャンセル
                </Button>
                <Button onClick={handleCreateMultipleTeams} className="bg-green-600 hover:bg-green-700">
                  一括作成
                </Button>
              </div>
            </div>
          </div>
        </BulkTeamModalReturn.Modal>

        {/* 予約移動モーダル */}
        <MoveModalReturn.Modal>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">予約の移動</h3>
              {movingReservation && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{movingReservation.reservation.customerName}</span>{' '}
                      の予約を別のチームに移動します
                    </p>
                  </div>
                  <div>
                    <label htmlFor="targetTeam" className="block text-sm font-medium text-gray-700">
                      移動先チーム
                    </label>
                    <Select onValueChange={value => setTargetGroupId(parseInt(value || '0'))}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="チームを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryGroups
                          .filter(group => group.id !== movingReservation.fromGroupId)
                          .map(group => (
                            <SelectItem key={group.id} value={group.id?.toString() || ''}>
                              {group.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-gray-500">※移動した予約は移動先チームの最後尾に配置されます</p>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={MoveModalReturn.handleClose}>
                  キャンセル
                </Button>
                <Button
                  className={`bg-blue-600 hover:bg-blue-700 text-white`}
                  onClick={handleMoveReservation}
                  disabled={!targetGroupId}
                >
                  移動
                </Button>
              </div>
            </div>
          </div>
        </MoveModalReturn.Modal>

        {/* 順序変更モーダル */}
        <OrderModalReturn.Modal>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">配達順序の変更</h3>
              {editingDeliveryOrder && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newOrder" className="block text-sm font-medium text-gray-700">
                      新しい配達順序
                    </label>
                    <Input
                      id="newOrder"
                      type="number"
                      min={1}
                      value={editingDeliveryOrder.newOrder}
                      onChange={e =>
                        setEditingDeliveryOrder({
                          ...editingDeliveryOrder,
                          newOrder: parseInt(e.target.value) || editingDeliveryOrder.currentOrder,
                        })
                      }
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">現在の順序: {editingDeliveryOrder.currentOrder}</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    OrderModalReturn.handleClose()
                    setEditingDeliveryOrder(null)
                  }}
                >
                  キャンセル
                </Button>
                <Button onClick={handleChangeReservationOrder}>変更</Button>
              </div>
            </div>
          </div>
        </OrderModalReturn.Modal>

        {/* 地図モーダル */}
        <MapModalReturn.Modal>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">配達ルート</h3>
              {MapModalReturn.open?.groupId ? (
                // チームの配達ルート表示
                <DeliveryRouteMap
                  reservations={
                    deliveryGroups
                      .find(g => g.id === MapModalReturn.open?.groupId)
                      ?.groupReservations?.map(gr => {
                        const reservation = getReservationById(gr.sbmReservationId || 0)
                        return reservation as ReservationType
                      })
                      .filter(Boolean) || []
                  }
                  teamId={MapModalReturn.open.groupId}
                  optimizeRoute={false}
                />
              ) : MapModalReturn.open?.reservationId ? (
                // 単一予約の地図表示
                <DeliveryRouteMap reservations={reservations.filter(r => r.id === MapModalReturn.open?.reservationId)} />
              ) : (
                // 全予約の地図表示
                <DeliveryRouteMap reservations={reservations} optimizeRoute={false} />
              )}
              <div className="flex justify-end mt-4">
                <Button onClick={MapModalReturn.handleClose} variant="outline">
                  閉じる
                </Button>
              </div>
            </div>
          </div>
        </MapModalReturn.Modal>
      </div>
    </>
  )
}
