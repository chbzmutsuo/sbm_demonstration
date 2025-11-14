'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Plus, ChevronRight, Loader2, AlertCircle} from 'lucide-react'

import {
  createSite,
  updateSite,
  deleteSite,
  createStaff,
  updateStaff,
  deleteStaff,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getSites,
} from '@app/(apps)/aidocument/actions/site-actions'
import SiteList from '@app/(apps)/aidocument/components/sites/SiteList'
import SiteForm from '@app/(apps)/aidocument/components/sites/SiteForm'
import {Button} from '@cm/components/styles/common-components/Button'
import {CompanyWithSites, SiteWithRelations} from '@app/(apps)/aidocument/types'

interface SitesClientProps {
  client: CompanyWithSites
  initialSites: SiteWithRelations[]
}

export default function SitesClient({client, initialSites}: SitesClientProps) {
  const router = useRouter()
  const [sites, setSites] = useState<SiteWithRelations[]>(initialSites)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<SiteWithRelations | null>(null)

  const handleOpenModal = (site: SiteWithRelations | null = null) => {
    setEditingSite(site)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingSite(null)
    setIsModalOpen(false)
  }

  const handleSave = async (data: {
    id?: number
    name: string
    address?: string
    amount?: number
    startDate?: Date
    endDate?: Date
    staff?: Array<{id?: number; name: string; age?: number; gender?: string; term?: string}>
    vehicles?: Array<{id?: number; plate: string; term?: string}>
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      let siteId: number

      // 1. 現場の保存
      if (data.id) {
        const result = await updateSite(data.id, {
          name: data.name,
          address: data.address,
          amount: data.amount,
          startDate: data.startDate,
          endDate: data.endDate,
        })
        if (!result.success || !result.result) {
          setError(result.message)
          return
        }
        siteId = data.id

        // 2. スタッフのCRUD処理
        if (data.staff) {
          const currentSite = sites.find(s => s.id === siteId)
          const existingStaff = currentSite?.Staff || []
          const existingStaffIds = existingStaff.map(s => s.id)
          const newStaffIds = data.staff.filter(s => s.id !== undefined).map(s => s.id!)

          // 削除: 既存にあって新しいリストにないもの
          const toDelete = existingStaff.filter(s => !newStaffIds.includes(s.id))
          for (const staff of toDelete) {
            await deleteStaff(staff.id)
          }

          // 更新・作成
          for (const staffData of data.staff) {
            if (staffData.id && existingStaffIds.includes(staffData.id)) {
              // 更新
              await updateStaff(staffData.id, {
                name: staffData.name,
                age: staffData.age,
                gender: staffData.gender,
                term: staffData.term,
              })
            } else if (staffData.name) {
              // 新規作成（名前が入力されている場合のみ）
              await createStaff({
                siteId,
                name: staffData.name,
                age: staffData.age,
                gender: staffData.gender,
                term: staffData.term,
              })
            }
          }
        }

        // 3. 車両のCRUD処理
        if (data.vehicles) {
          const currentSite = sites.find(s => s.id === siteId)
          const existingVehicles = currentSite?.aidocumentVehicles || []
          const existingVehicleIds = existingVehicles.map(v => v.id)
          const newVehicleIds = data.vehicles.filter(v => v.id !== undefined).map(v => v.id!)

          // 削除: 既存にあって新しいリストにないもの
          const toDelete = existingVehicles.filter(v => !newVehicleIds.includes(v.id))
          for (const vehicle of toDelete) {
            await deleteVehicle(vehicle.id)
          }

          // 更新・作成
          for (const vehicleData of data.vehicles) {
            if (vehicleData.id && existingVehicleIds.includes(vehicleData.id)) {
              // 更新
              await updateVehicle(vehicleData.id, {
                plate: vehicleData.plate,
                term: vehicleData.term,
              })
            } else if (vehicleData.plate) {
              // 新規作成（プレート番号が入力されている場合のみ）
              await createVehicle({
                siteId,
                plate: vehicleData.plate,
                term: vehicleData.term,
              })
            }
          }
        }

        // 最新データを取得してステートを更新
        const refreshResult = await getSites({where: {clientId: client.id}})
        if (refreshResult.success && refreshResult.result) {
          setSites(refreshResult.result)
        }
      } else {
        // 新規作成
        const result = await createSite({
          clientId: client.id,
          name: data.name,
          address: data.address,
          amount: data.amount,
          startDate: data.startDate,
          endDate: data.endDate,
        })
        if (!result.success || !result.result) {
          setError(result.message)
          return
        }
        siteId = result.result.id

        // スタッフと車両の作成
        if (data.staff) {
          for (const staffData of data.staff) {
            if (staffData.name && staffData.name.trim()) {
              await createStaff({
                siteId,
                name: staffData.name,
                age: staffData.age,
                gender: staffData.gender,
                term: staffData.term,
              })
            }
          }
        }

        if (data.vehicles) {
          for (const vehicleData of data.vehicles) {
            if (vehicleData.plate && vehicleData.plate.trim()) {
              await createVehicle({
                siteId,
                plate: vehicleData.plate,
                term: vehicleData.term,
              })
            }
          }
        }

        // 最新データを取得してステートを更新
        const refreshResult = await getSites({where: {clientId: client.id}})
        if (refreshResult.success && refreshResult.result) {
          setSites(refreshResult.result)
        }
      }

      handleCloseModal()
    } catch (err) {
      setError('保存に失敗しました')
      console.error('保存エラー:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (siteId: number) => {
    if (!window.confirm('この現場を削除しますか？関連する書類も削除されます。')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await deleteSite(siteId)
      if (result.success) {
        setSites(prev => prev.filter(s => s.id !== siteId))
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('削除に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
        <span onClick={() => router.push('/aidocument/clients')} className="hover:underline cursor-pointer text-blue-600">
          取引先マスタ
        </span>
        <ChevronRight className="w-3 h-3" />
        <span className="font-medium text-gray-800 truncate">{client.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">現場管理</h1>
          <p className="text-sm text-gray-600">{client.name} に関連する現場一覧</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2 inline-block" />
          新規現場を登録
        </Button>
      </div>

      {/* Status */}
      {isLoading && (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-700">読み込み中...</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md flex items-center mb-3">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Site List */}
      {!isLoading && (
        <SiteList
          sites={sites}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onNavigateToDocuments={siteId => router.push(`/aidocument/sites/${siteId}/documents`)}
        />
      )}

      {/* 現場 編集・新規作成モーダル */}
      <SiteForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editingSite}
        clientId={client.id}
      />
    </div>
  )
}
