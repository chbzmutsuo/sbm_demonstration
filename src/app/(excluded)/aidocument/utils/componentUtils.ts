'use server'

import {Component, SiteWithRelations} from '../types'

/**
 * 現場マスタデータからD&D用の「部品」リストを生成する
 * ComponentSidebar.tsxと同じロジックを使用
 */
export async function generateComponentsFromSite(siteData: SiteWithRelations | null | undefined): Promise<Component[]> {
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

  // 自社情報を追加
  if (siteData.Company) {
    const company = siteData.Company
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
