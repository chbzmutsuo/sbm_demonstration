'use client'

import {GripVertical} from 'lucide-react'
import {useDraggable} from '@dnd-kit/core'
import {SiteWithRelations, Component} from '../../types'
import useSWR from 'swr'

interface ComponentSidebarProps {
  site: SiteWithRelations
}

function DraggableComponent({component}: {component: Component}) {
  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id: component.id,
    data: {component},
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-1.5 p-1.5 bg-gray-50 border border-gray-200 rounded-md cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 bg-blue-50' : ''
      }`}
    >
      <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
      <div className="truncate">
        <span className="text-xs font-medium text-gray-800 block truncate">{component.label}</span>
        <span className="text-xs text-gray-500 block truncate">{component.value || '(値なし)'}</span>
      </div>
    </div>
  )
}

export default function ComponentSidebar({site}: ComponentSidebarProps) {
  const {data: components = []} = useSWR(JSON.stringify(site), async () => await generateComponentsFromSite(site))

  const componentGroups = components.reduce((acc: Record<string, Component[]>, comp) => {
    const group = comp.group || 'その他'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(comp)
    return acc
  }, {})

  return (
    <aside className="w-64 bg-white border-r border-gray-300 flex flex-col">
      <div className="p-2 border-b">
        <h3 className="text-sm font-semibold text-gray-700">【部品】リスト</h3>
        <p className="text-xs text-gray-500">現場マスタから部品をドラッグ＆ドロップできます。</p>
      </div>

      <div className="flex-grow overflow-y-auto p-2 space-y-3">
        {Object.entries(componentGroups).map(([groupName, comps]) => (
          <div key={groupName}>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">{groupName}</h4>
            <div className="space-y-1">
              {comps.map(comp => (
                <DraggableComponent key={comp.id} component={comp} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

function generateComponentsFromSite(site: SiteWithRelations | null | undefined): Component[] {
  if (!site) return []

  const components: Component[] = [
    {id: 's_name', label: '現場名', value: site.name, group: '基本情報'},
    {id: 's_address', label: '住所', value: site.address || '', group: '基本情報'},
    {id: 's_amount', label: '金額', value: site.amount ? `${site.amount.toLocaleString()} 円` : '', group: '基本情報'},
    {
      id: 's_startDate',
      label: '開始日',
      value: site.startDate ? new Date(site.startDate).toLocaleDateString('ja-JP') : '',
      group: '基本情報',
    },
    {
      id: 's_endDate',
      label: '終了日',
      value: site.endDate ? new Date(site.endDate).toLocaleDateString('ja-JP') : '',
      group: '基本情報',
    },
  ]

  // 自社情報を追加
  if (site.Company) {
    const company = site.Company
    components.push({id: 'c_name', label: '自社名', value: company.name, group: '自社情報'})
    components.push({
      id: 'c_representativeName',
      label: '代表者名',
      value: company.representativeName || '',
      group: '自社情報',
    })
    components.push({id: 'c_address', label: '自社住所', value: company.address || '', group: '自社情報'})
    components.push({id: 'c_phone', label: '電話番号', value: company.phone || '', group: '自社情報'})

    // 建設業許可情報
    if (company.constructionLicense && Array.isArray(company.constructionLicense)) {
      const licenses = company.constructionLicense as Array<{type: string; number: string; date: string}>
      licenses.forEach((license, index) => {
        components.push({
          id: `c_license_${index}_type`,
          label: `建設業許可種別${index + 1}`,
          value: license.type || '',
          group: '自社情報',
        })
        components.push({
          id: `c_license_${index}_number`,
          label: `建設業許可番号${index + 1}`,
          value: license.number || '',
          group: '自社情報',
        })
        components.push({
          id: `c_license_${index}_date`,
          label: `建設業許可日${index + 1}`,
          value: license.date || '',
          group: '自社情報',
        })
      })
    }

    // 社会保険情報
    if (company.socialInsurance && typeof company.socialInsurance === 'object') {
      const socialInsurance = company.socialInsurance as {
        health?: string
        pension?: string
        employment?: string
        officeName?: string
        officeCode?: string
      }
      if (socialInsurance.officeName) {
        components.push({
          id: 'c_social_officeName',
          label: '社会保険事務所名',
          value: socialInsurance.officeName,
          group: '自社情報',
        })
      }
      if (socialInsurance.officeCode) {
        components.push({
          id: 'c_social_officeCode',
          label: '社会保険事務所コード',
          value: socialInsurance.officeCode,
          group: '自社情報',
        })
      }
    }
  }

  ;(site.Staff || []).forEach(s => {
    components.push({id: `s_${s.id}_name`, label: `[ス] ${s.name} (氏名)`, value: s.name, group: '担当スタッフ'})
    components.push({id: `s_${s.id}_age`, label: `[ス] ${s.name} (年齢)`, value: s.age?.toString() || '', group: '担当スタッフ'})
    components.push({
      id: `s_${s.id}_gender`,
      label: `[ス] ${s.name} (性別)`,
      value: s.gender || '',
      group: '担当スタッフ',
    })
    components.push({id: `s_${s.id}_term`, label: `[ス] ${s.name} (期間)`, value: s.term || '', group: '担当スタッフ'})
  })
  ;(site.aidocumentVehicles || []).forEach(v => {
    components.push({id: `v_${v.id}_plate`, label: `[車] ${v.plate} (番号)`, value: v.plate, group: '利用車両'})
    components.push({id: `v_${v.id}_term`, label: `[車] ${v.plate} (期間)`, value: v.term || '', group: '利用車両'})
  })

  return components
}
