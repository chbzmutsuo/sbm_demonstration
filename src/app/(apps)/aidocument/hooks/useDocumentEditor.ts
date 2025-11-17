import {useState, useEffect, useRef} from 'react'
import {DocumentWithRelations, PlacedItem, Component} from '../types'
import {SiteWithRelations} from '../types'

/**
 * ドキュメント編集ページ（D&D）のロジック
 */
export const useDocumentEditor = (
  initialDocument: DocumentWithRelations | undefined,
  siteData: SiteWithRelations | undefined
) => {
  const [document, setDocument] = useState<DocumentWithRelations | undefined>(initialDocument)
  const [items, setItems] = useState<PlacedItem[]>([])
  const [pdfUrl, setPdfUrl] = useState<string | null>(initialDocument?.pdfTemplateUrl || null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDocument(initialDocument)
    setPdfUrl(initialDocument?.pdfTemplateUrl || null)

    // JSONからitemsを読み込む
    if (initialDocument?.items && typeof initialDocument.items === 'object') {
      try {
        const parsedItems = Array.isArray(initialDocument.items) ? initialDocument.items : []
        setItems(parsedItems as unknown as PlacedItem[])
      } catch (err) {
        console.error('Items parsing error:', err)
        setItems([])
      }
    } else {
      setItems([])
    }
  }, [initialDocument])

  // 現場マスタデータからD&D用の「部品」リストを生成
  const components = generateComponentsFromSite(siteData)

  return {
    document,
    items,
    setItems,
    pdfUrl,
    setPdfUrl,
    loading,
    aiLoading,
    setAiLoading,
    pdfRef,
    components,
  }
}

/**
 * 現場マスタデータからD&D用の「部品」リストを生成する
 */
function generateComponentsFromSite(siteData: SiteWithRelations | undefined): Component[] {
  if (!siteData) return []

  const components: Component[] = [
    {id: 's_name', label: '現場名', value: siteData.name, group: '基本情報'},
    {id: 's_address', label: '住所', value: siteData.address || '', group: '基本情報'},
    {
      id: 's_amount',
      label: '金額',
      value: siteData.amount ? `${siteData.amount.toLocaleString()} 円` : '',
      group: '基本情報',
    },
    {
      id: 's_startDate',
      label: '開始日',
      value: siteData.startDate ? new Date(siteData.startDate).toLocaleDateString('ja-JP') : '',
      group: '基本情報',
    },
    {
      id: 's_endDate',
      label: '終了日',
      value: siteData.endDate ? new Date(siteData.endDate).toLocaleDateString('ja-JP') : '',
      group: '基本情報',
    },
  ]

  ;(siteData.Staff || []).forEach(s => {
    components.push({id: `s_${s.id}_name`, label: `[ス] ${s.name} (氏名)`, value: s.name, group: '担当スタッフ'})
    components.push({
      id: `s_${s.id}_age`,
      label: `[ス] ${s.name} (年齢)`,
      value: s.age?.toString() || '',
      group: '担当スタッフ',
    })
    components.push({
      id: `s_${s.id}_gender`,
      label: `[ス] ${s.name} (性別)`,
      value: s.gender || '',
      group: '担当スタッフ',
    })
    components.push({id: `s_${s.id}_term`, label: `[ス] ${s.name} (期間)`, value: s.term || '', group: '担当スタッフ'})
  })
  ;(siteData.aidocumentVehicles || []).forEach(v => {
    components.push({id: `v_${v.id}_plate`, label: `[車] ${v.plate} (番号)`, value: v.plate, group: '利用車両'})
    components.push({id: `v_${v.id}_term`, label: `[車] ${v.plate} (期間)`, value: v.term || '', group: '利用車両'})
  })

  return components
}

/**
 * componentId からマスタの値を取得するヘルパー関数
 */
export const getComponentValue = (componentId: string, siteData: SiteWithRelations | undefined): any => {
  if (!siteData || !componentId) return ''

  const [prefix, ...rest] = componentId.split('_')
  const id = rest[0] // s_name の場合 'name'
  const field = rest[1] // s1_name の場合 'name'

  switch (prefix) {
    case 's': {
      // 現場基本情報 (s_name)
      if (rest.length === 1) {
        return (siteData as any)[id] || ''
      }
      // スタッフ (s_1_name)
      const staffId = rest[0] // s_1_name の場合 '1'
      const staff = siteData.Staff?.find(s => s.id.toString() === staffId)
      return staff ? (staff as any)[field] || '' : ''
    }

    case 'v': {
      // 車両 (v_1_plate)
      const vehicleId = rest[0] // v_1_plate の場合 '1'
      const vehicle = siteData.aidocumentVehicles?.find(v => v.id.toString() === vehicleId)
      return vehicle ? (vehicle as any)[field] || '' : ''
    }

    case 'c': {
      // 自社情報 (c_name, c_address, etc.)
      if (!siteData.Company) return ''
      const company = siteData.Company

      // 基本情報
      if (id === 'name') return company.name || ''
      if (id === 'representativeName') return company.representativeName || ''
      if (id === 'address') return company.address || ''
      if (id === 'phone') return company.phone || ''

      // 建設業許可情報 (c_license_0_type, c_license_0_number, c_license_0_date)
      if (id === 'license' && rest.length >= 3) {
        const licenseIndex = parseInt(rest[1])
        const licenseField = rest[2] // type, number, date
        if (company.constructionLicense && Array.isArray(company.constructionLicense)) {
          const licenses = company.constructionLicense as Array<{type: string; number: string; date: string}>
          const license = licenses[licenseIndex]
          if (license) {
            return (license as any)[licenseField] || ''
          }
        }
        return ''
      }

      // 社会保険情報 (c_social_officeName, c_social_officeCode)
      if (id === 'social' && rest.length >= 2) {
        const socialField = rest[1] // officeName, officeCode
        if (company.socialInsurance && typeof company.socialInsurance === 'object') {
          const socialInsurance = company.socialInsurance as {
            officeName?: string
            officeCode?: string
          }
          return (socialInsurance as any)[socialField] || ''
        }
        return ''
      }

      return ''
    }
    default:
      return ''
  }
}
