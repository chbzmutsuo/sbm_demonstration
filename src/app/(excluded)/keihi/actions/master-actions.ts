'use server'

import {KeihiOptionMaster} from '@prisma/client'

import prisma from 'src/lib/prisma'

export interface OptionMaster extends KeihiOptionMaster {}

export interface CreateOptionData {
  category: string
  value: string
  label: string
  description?: string
  sortOrder?: number
  color?: string
}

export interface UpdateOptionData {
  value?: string
  label?: string
  description?: string
  isActive?: boolean
  sortOrder?: number
  color?: string
}

// 指定カテゴリの選択肢一覧を取得
export async function getOptionsByCategory(category: string): Promise<{
  success: boolean
  data?: OptionMaster[]
  error?: string
}> {
  try {
    const options = await prisma.keihiOptionMaster.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: [{sortOrder: 'asc'}, {label: 'asc'}],
    })

    return {
      success: true,
      data: options,
    }
  } catch (error) {
    console.error('選択肢取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '選択肢の取得に失敗しました',
    }
  }
}

// 全選択肢を取得（管理画面用）
export async function getAllOptions(): Promise<{
  success: boolean
  data?: OptionMaster[]
  error?: string
}> {
  try {
    const options = await prisma.keihiOptionMaster.findMany({
      orderBy: [{category: 'asc'}, {sortOrder: 'asc'}, {label: 'asc'}],
    })

    return {
      success: true,
      data: options,
    }
  } catch (error) {
    console.error('全選択肢取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '選択肢の取得に失敗しました',
    }
  }
}

// 選択肢を作成
export async function createOption(data: CreateOptionData): Promise<{
  success: boolean
  data?: OptionMaster
  error?: string
}> {
  try {
    // 同じカテゴリ・値の組み合わせが既に存在するかチェック
    const existing = await prisma.keihiOptionMaster.findUnique({
      where: {
        category_value_unique: {
          category: data.category,
          value: data.value,
        },
      },
    })

    if (existing) {
      return {
        success: false,
        error: 'この値は既に存在します',
      }
    }

    const option = await prisma.keihiOptionMaster.create({
      data: {
        category: data.category,
        value: data.value,
        label: data.label,
        description: data.description,
        sortOrder: data.sortOrder || 0,
        color: data.color,
      },
    })

    return {
      success: true,
      data: option,
    }
  } catch (error) {
    console.error('選択肢作成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '選択肢の作成に失敗しました',
    }
  }
}

// 選択肢を更新
export async function updateOption(
  id: string,
  data: UpdateOptionData
): Promise<{
  success: boolean
  data?: OptionMaster
  error?: string
}> {
  try {
    const option = await prisma.keihiOptionMaster.update({
      where: {id},
      data,
    })

    return {
      success: true,
      data: option,
    }
  } catch (error) {
    console.error('選択肢更新エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '選択肢の更新に失敗しました',
    }
  }
}

// 選択肢を削除（論理削除）
export async function deleteOption(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await prisma.keihiOptionMaster.update({
      where: {id},
      data: {isActive: false},
    })

    return {success: true}
  } catch (error) {
    console.error('選択肢削除エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '選択肢の削除に失敗しました',
    }
  }
}

// 選択肢の並び順を更新
export async function updateOptionOrder(updates: Array<{id: string; sortOrder: number}>): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await prisma.$transaction(
      updates.map(update =>
        prisma.keihiOptionMaster.update({
          where: {id: update.id},
          data: {sortOrder: update.sortOrder},
        })
      )
    )

    return {success: true}
  } catch (error) {
    console.error('並び順更新エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '並び順の更新に失敗しました',
    }
  }
}

// 初期データ投入
export async function seedDefaultOptions(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const defaultData = [
      // 科目
      {category: 'subjects', value: '旅費交通費', label: '旅費交通費', sortOrder: 1},
      {category: 'subjects', value: '接待交際費', label: '接待交際費', sortOrder: 2},
      {category: 'subjects', value: '通信費', label: '通信費', sortOrder: 3},
      {category: 'subjects', value: '消耗品費', label: '消耗品費', sortOrder: 4},
      {category: 'subjects', value: '広告宣伝費', label: '広告宣伝費', sortOrder: 5},
      {category: 'subjects', value: '会議費', label: '会議費', sortOrder: 6},
      {category: 'subjects', value: '新聞図書費', label: '新聞図書費', sortOrder: 7},
      {category: 'subjects', value: '支払手数料', label: '支払手数料', sortOrder: 8},
      {category: 'subjects', value: '地代家賃', label: '地代家賃', sortOrder: 9},
      {category: 'subjects', value: '水道光熱費', label: '水道光熱費', sortOrder: 10},
      {category: 'subjects', value: '修繕費', label: '修繕費', sortOrder: 11},
      {category: 'subjects', value: '租税公課', label: '租税公課', sortOrder: 12},

      // 業種
      {category: 'industries', value: 'IT・ソフトウェア', label: 'IT・ソフトウェア', sortOrder: 1},
      {category: 'industries', value: '製造業', label: '製造業', sortOrder: 2},
      {category: 'industries', value: '金融・保険', label: '金融・保険', sortOrder: 3},
      {category: 'industries', value: '不動産', label: '不動産', sortOrder: 4},
      {category: 'industries', value: '小売・卸売', label: '小売・卸売', sortOrder: 5},
      {category: 'industries', value: '飲食・宿泊', label: '飲食・宿泊', sortOrder: 6},
      {category: 'industries', value: '医療・福祉', label: '医療・福祉', sortOrder: 7},
      {category: 'industries', value: '教育', label: '教育', sortOrder: 8},
      {category: 'industries', value: 'コンサルティング', label: 'コンサルティング', sortOrder: 9},
      {category: 'industries', value: 'その他', label: 'その他', sortOrder: 10},

      // 目的
      {category: 'purposes', value: '営業・商談', label: '営業・商談', sortOrder: 1},
      {category: 'purposes', value: '開発相談', label: '開発相談', sortOrder: 2},
      {category: 'purposes', value: '業務報告', label: '業務報告', sortOrder: 3},
      {category: 'purposes', value: '情報交換', label: '情報交換', sortOrder: 4},
      {category: 'purposes', value: '研修・セミナー', label: '研修・セミナー', sortOrder: 5},
      {category: 'purposes', value: '会議・打ち合わせ', label: '会議・打ち合わせ', sortOrder: 6},
      {category: 'purposes', value: 'その他', label: 'その他', sortOrder: 7},
    ]

    // 既存データをチェックして、存在しないもののみ作成
    for (const item of defaultData) {
      const existing = await prisma.keihiOptionMaster.findUnique({
        where: {
          category_value_unique: {
            category: item.category,
            value: item.value,
          },
        },
      })

      if (!existing) {
        await prisma.keihiOptionMaster.create({
          data: item,
        })
      }
    }

    return {success: true}
  } catch (error) {
    console.error('初期データ投入エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '初期データの投入に失敗しました',
    }
  }
}

// 完全版勘定科目マスタデータ投入
export async function seedFullAccountMaster(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // CSVファイルから抽出した完全な勘定科目マスタデータ（一部抜粋）
    const fullAccountMasterData = [
      // 貸借対照表 - 現金及び預金
      {
        category: '貸借対照表',
        classification: '現金及び預金',
        balanceSheet: '現金',
        account: '現金',
        subAccount: '',
        taxCategory: '対象外',
        searchKey: '',
        isActive: true,
        sortOrder: 1,
      },
      {
        category: '貸借対照表',
        classification: '現金及び預金',
        balanceSheet: '普通預金',
        account: '普通預金',
        subAccount: '',
        taxCategory: '対象外',
        searchKey: '',
        isActive: true,
        sortOrder: 4,
      },
      // 損益計算書 - 売上高
      {
        category: '損益計算書',
        classification: '売上高',
        balanceSheet: '売上高',
        account: '売上高',
        subAccount: '',
        taxCategory: '課税売上',
        searchKey: '',
        isActive: true,
        sortOrder: 100,
      },
      // 損益計算書 - 売上原価
      {
        category: '損益計算書',
        classification: '売上原価',
        balanceSheet: '売上原価',
        account: '売上原価',
        subAccount: '',
        taxCategory: '課税仕入',
        searchKey: '',
        isActive: true,
        sortOrder: 110,
      },
      // 損益計算書 - 販売費及び一般管理費
      {
        category: '損益計算書',
        classification: '販売費及び一般管理費',
        balanceSheet: '旅費交通費',
        account: '旅費交通費',
        subAccount: '',
        taxCategory: '課税仕入',
        searchKey: '',
        isActive: true,
        sortOrder: 120,
      },
      {
        category: '損益計算書',
        classification: '販売費及び一般管理費',
        balanceSheet: '接待交際費',
        account: '接待交際費',
        subAccount: '',
        taxCategory: '課税仕入',
        searchKey: '',
        isActive: true,
        sortOrder: 121,
      },
      {
        category: '損益計算書',
        classification: '販売費及び一般管理費',
        balanceSheet: '通信費',
        account: '通信費',
        subAccount: '',
        taxCategory: '課税仕入',
        searchKey: '',
        isActive: true,
        sortOrder: 122,
      },
      {
        category: '損益計算書',
        classification: '販売費及び一般管理費',
        balanceSheet: '消耗品費',
        account: '消耗品費',
        subAccount: '',
        taxCategory: '課税仕入',
        searchKey: '',
        isActive: true,
        sortOrder: 123,
      },
      {
        category: '損益計算書',
        classification: '販売費及び一般管理費',
        balanceSheet: '広告宣伝費',
        account: '広告宣伝費',
        subAccount: '',
        taxCategory: '課税仕入',
        searchKey: '',
        isActive: true,
        sortOrder: 124,
      },
      {
        category: '損益計算書',
        classification: '販売費及び一般管理費',
        balanceSheet: '会議費',
        account: '会議費',
        subAccount: '',
        taxCategory: '課税仕入',
        searchKey: '',
        isActive: true,
        sortOrder: 125,
      },
    ]

    // 既存データをチェックして、存在しないもののみ作成
    for (const item of fullAccountMasterData) {
      const existing = await prisma.keihiAccountMaster.findFirst({
        where: {
          account: item.account,
          subAccount: item.subAccount,
        },
      })

      if (!existing) {
        await prisma.keihiAccountMaster.create({
          data: item,
        })
      }
    }

    return {success: true}
  } catch (error) {
    console.error('完全版勘定科目マスタ投入エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '完全版勘定科目マスタの投入に失敗しました',
    }
  }
}

// 完全版選択肢マスタデータ投入
export async function seedFullOptionMaster(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const fullOptionMasterData = [
      // 科目（経費でよく使われる勘定科目）
      {category: 'subjects', value: '旅費交通費', label: '旅費交通費', sortOrder: 1, color: '#3B82F6'},
      {category: 'subjects', value: '接待交際費', label: '接待交際費', sortOrder: 2, color: '#EF4444'},
      {category: 'subjects', value: '通信費', label: '通信費', sortOrder: 3, color: '#10B981'},
      {category: 'subjects', value: '消耗品費', label: '消耗品費', sortOrder: 4, color: '#F59E0B'},
      {category: 'subjects', value: '広告宣伝費', label: '広告宣伝費', sortOrder: 5, color: '#8B5CF6'},
      {category: 'subjects', value: '会議費', label: '会議費', sortOrder: 6, color: '#06B6D4'},
      {category: 'subjects', value: '新聞図書費', label: '新聞図書費', sortOrder: 7, color: '#84CC16'},
      {category: 'subjects', value: '支払手数料', label: '支払手数料', sortOrder: 8, color: '#F97316'},
      {category: 'subjects', value: '地代家賃', label: '地代家賃', sortOrder: 9, color: '#EC4899'},
      {category: 'subjects', value: '水道光熱費', label: '水道光熱費', sortOrder: 10, color: '#14B8A6'},
      {category: 'subjects', value: '修繕費', label: '修繕費', sortOrder: 11, color: '#6366F1'},
      {category: 'subjects', value: '租税公課', label: '租税公課', sortOrder: 12, color: '#DC2626'},
      {category: 'subjects', value: '研修費', label: '研修費', sortOrder: 13, color: '#059669'},
      {category: 'subjects', value: '福利厚生費', label: '福利厚生費', sortOrder: 14, color: '#7C3AED'},
      {category: 'subjects', value: '外注費', label: '外注費', sortOrder: 15, color: '#DB2777'},

      // 業種（より詳細な業種分類）
      {category: 'industries', value: 'IT・ソフトウェア', label: 'IT・ソフトウェア', sortOrder: 1, color: '#3B82F6'},
      {
        category: 'industries',
        value: 'Webサービス・アプリ開発',
        label: 'Webサービス・アプリ開発',
        sortOrder: 2,
        color: '#1D4ED8',
      },
      {category: 'industries', value: 'システム開発・SIer', label: 'システム開発・SIer', sortOrder: 3, color: '#2563EB'},
      {category: 'industries', value: '製造業', label: '製造業', sortOrder: 4, color: '#059669'},
      {category: 'industries', value: '金融・保険', label: '金融・保険', sortOrder: 5, color: '#DC2626'},
      {category: 'industries', value: '不動産', label: '不動産', sortOrder: 6, color: '#7C2D12'},
      {category: 'industries', value: '小売・卸売', label: '小売・卸売', sortOrder: 7, color: '#EA580C'},
      {category: 'industries', value: 'EC・通販', label: 'EC・通販', sortOrder: 8, color: '#F97316'},
      {category: 'industries', value: '飲食・宿泊', label: '飲食・宿泊', sortOrder: 9, color: '#EAB308'},
      {category: 'industries', value: '医療・福祉', label: '医療・福祉', sortOrder: 10, color: '#22C55E'},
      {category: 'industries', value: '教育', label: '教育', sortOrder: 11, color: '#06B6D4'},
      {category: 'industries', value: 'コンサルティング', label: 'コンサルティング', sortOrder: 12, color: '#8B5CF6'},
      {category: 'industries', value: '広告・マーケティング', label: '広告・マーケティング', sortOrder: 13, color: '#EC4899'},
      {category: 'industries', value: '建設・建築', label: '建設・建築', sortOrder: 14, color: '#6B7280'},
      {category: 'industries', value: 'その他', label: 'その他', sortOrder: 15, color: '#9CA3AF'},

      // 目的（より詳細な目的分類）
      {category: 'purposes', value: '営業・商談', label: '営業・商談', sortOrder: 1, color: '#EF4444'},
      {category: 'purposes', value: '新規開拓', label: '新規開拓', sortOrder: 2, color: '#DC2626'},
      {category: 'purposes', value: '既存顧客フォロー', label: '既存顧客フォロー', sortOrder: 3, color: '#B91C1C'},
      {category: 'purposes', value: '開発相談', label: '開発相談', sortOrder: 4, color: '#3B82F6'},
      {category: 'purposes', value: '技術検討', label: '技術検討', sortOrder: 5, color: '#2563EB'},
      {category: 'purposes', value: '業務報告', label: '業務報告', sortOrder: 6, color: '#059669'},
      {category: 'purposes', value: '情報交換', label: '情報交換', sortOrder: 7, color: '#0891B2'},
      {category: 'purposes', value: '研修・セミナー', label: '研修・セミナー', sortOrder: 8, color: '#7C3AED'},
      {category: 'purposes', value: '会議・打ち合わせ', label: '会議・打ち合わせ', sortOrder: 9, color: '#C2410C'},
      {category: 'purposes', value: '社内会議', label: '社内会議', sortOrder: 10, color: '#EA580C'},
      {category: 'purposes', value: '顧客会議', label: '顧客会議', sortOrder: 11, color: '#F97316'},
      {category: 'purposes', value: 'パートナー会議', label: 'パートナー会議', sortOrder: 12, color: '#F59E0B'},
      {category: 'purposes', value: 'その他', label: 'その他', sortOrder: 13, color: '#6B7280'},
    ]

    // 既存データをチェックして、存在しないもののみ作成
    for (const item of fullOptionMasterData) {
      const existing = await prisma.keihiOptionMaster.findUnique({
        where: {
          category_value_unique: {
            category: item.category,
            value: item.value,
          },
        },
      })

      if (!existing) {
        await prisma.keihiOptionMaster.create({
          data: item,
        })
      }
    }

    return {success: true}
  } catch (error) {
    console.error('完全版選択肢マスタ投入エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '完全版選択肢マスタの投入に失敗しました',
    }
  }
}
