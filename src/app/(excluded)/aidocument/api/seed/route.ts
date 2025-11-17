import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {Prisma, AidocumentSite, AidocumentStaff, AidocumentVehicle} from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    console.log('aidocumentシーディングを開始...')

    // 1. 「テスト企業」（自社）をupsert
    console.log('テスト企業をupsert中...')
    const testCompanyData = {
      name: 'テスト企業',
      type: 'self',
      representativeName: '山田太郎',
      address: '〒100-0001 東京都千代田区千代田1-1-1',
      phone: '03-1234-5678',
      constructionLicense: [
        {
          type: '一般建設業',
          number: '許可(般-1)第12345号',
          date: '2020-04-01',
        },
        {
          type: '特定建設業',
          number: '許可(特-1)第67890号',
          date: '2021-04-01',
        },
      ] as Prisma.JsonArray,
      socialInsurance: {
        health: '全国健康保険協会',
        pension: '日本年金機構',
        employment: '厚生労働省',
        officeName: '東京事務所',
        officeCode: '13100',
      } as Prisma.JsonObject,
      sortOrder: 1,
    }

    const existingTestCompany = await prisma.aidocumentCompany.findFirst({
      where: {
        name: 'テスト企業',
        type: 'self',
      },
    })

    const testCompany = existingTestCompany
      ? await prisma.aidocumentCompany.update({
          where: {id: existingTestCompany.id},
          data: testCompanyData,
        })
      : await prisma.aidocumentCompany.create({
          data: testCompanyData,
        })
    console.log(`テスト企業を${existingTestCompany ? '更新' : '作成'}しました (ID: ${testCompany.id})`)

    // 2. 「取引先A」（発注者）をupsert
    console.log('取引先Aをupsert中...')
    const clientCompanyData = {
      name: '取引先A',
      type: 'client',
      representativeName: '佐藤花子',
      address: '〒150-0001 東京都渋谷区神宮前1-2-3',
      phone: '03-9876-5432',
      constructionLicense: [
        {
          type: '一般建設業',
          number: '許可(般-1)第11111号',
          date: '2019-03-15',
        },
      ] as Prisma.JsonArray,
      socialInsurance: {
        health: '全国健康保険協会',
        pension: '日本年金機構',
        employment: '厚生労働省',
        officeName: '渋谷事務所',
        officeCode: '13103',
      } as Prisma.JsonObject,
      sortOrder: 2,
    }

    const existingClientCompany = await prisma.aidocumentCompany.findFirst({
      where: {
        name: '取引先A',
        type: 'client',
      },
    })

    const clientCompany = existingClientCompany
      ? await prisma.aidocumentCompany.update({
          where: {id: existingClientCompany.id},
          data: clientCompanyData,
        })
      : await prisma.aidocumentCompany.create({
          data: clientCompanyData,
        })
    console.log(`取引先Aを${existingClientCompany ? '更新' : '作成'}しました (ID: ${clientCompany.id})`)

    // 3. 「現場1」〜「現場3」をupsert
    const sites = [
      {
        name: '現場1',
        address: '〒100-0002 東京都千代田区皇居外苑1-1',
        contractDate: new Date('2024-04-01'),
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        amount: 50000000,
        costBreakdown: {
          directCost: 35000000,
          commonTemporaryCost: 5000000,
          siteManagementCost: 5000000,
          generalManagementCost: 3000000,
          subtotal: 48000000,
          tax: 2000000,
        },
        siteAgent: {
          name: '田中一郎',
          qualification: '一級建築士',
          authority: '現場における一切の業務を統括管理する権限',
        },
        chiefEngineer: {
          name: '鈴木二郎',
          type: '主任技術者',
          qualification: '一級建築士',
          qNumber: '建第123456号',
          qDate: '2020-05-15',
        },
        safetyManager: '高橋三郎',
        safetyPromoter: '伊藤四郎',
        sortOrder: 1,
      },
      {
        name: '現場2',
        address: '〒100-0003 東京都千代田区一ツ橋1-2-1',
        contractDate: new Date('2024-05-01'),
        startDate: new Date('2024-05-01'),
        endDate: new Date('2025-04-30'),
        amount: 75000000,
        costBreakdown: {
          directCost: 52500000,
          commonTemporaryCost: 7500000,
          siteManagementCost: 7500000,
          generalManagementCost: 4500000,
          subtotal: 72000000,
          tax: 3000000,
        },
        siteAgent: {
          name: '渡辺五郎',
          qualification: '一級建築士',
          authority: '現場における一切の業務を統括管理する権限',
        },
        chiefEngineer: {
          name: '中村六郎',
          type: '監理技術者',
          qualification: '一級建築士',
          qNumber: '建第234567号',
          qDate: '2019-08-20',
        },
        safetyManager: '小林七郎',
        safetyPromoter: '加藤八郎',
        sortOrder: 2,
      },
      {
        name: '現場3',
        address: '〒100-0004 東京都千代田区大手町1-1-1',
        contractDate: new Date('2024-06-01'),
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-05-31'),
        amount: 100000000,
        costBreakdown: {
          directCost: 70000000,
          commonTemporaryCost: 10000000,
          siteManagementCost: 10000000,
          generalManagementCost: 6000000,
          subtotal: 96000000,
          tax: 4000000,
        },
        siteAgent: {
          name: '吉田九郎',
          qualification: '一級建築士',
          authority: '現場における一切の業務を統括管理する権限',
        },
        chiefEngineer: {
          name: '山本十郎',
          type: '主任技術者',
          qualification: '一級建築士',
          qNumber: '建第345678号',
          qDate: '2021-03-10',
        },
        safetyManager: '松本十一郎',
        safetyPromoter: '井上十二郎',
        sortOrder: 3,
      },
    ]

    const createdSites: AidocumentSite[] = []
    for (const siteData of sites) {
      console.log(`${siteData.name}をupsert中...`)
      const existingSite = await prisma.aidocumentSite.findFirst({
        where: {
          name: siteData.name,
          clientId: clientCompany.id,
          companyId: testCompany.id,
        },
      })

      const siteDataToUpsert = {
        clientId: clientCompany.id,
        companyId: testCompany.id,
        name: siteData.name,
        address: siteData.address,
        contractDate: siteData.contractDate,
        startDate: siteData.startDate,
        endDate: siteData.endDate,
        amount: siteData.amount,
        costBreakdown: siteData.costBreakdown as Prisma.JsonObject,
        siteAgent: siteData.siteAgent as Prisma.JsonObject,
        chiefEngineer: siteData.chiefEngineer as Prisma.JsonObject,
        safetyManager: siteData.safetyManager,
        safetyPromoter: siteData.safetyPromoter,
        sortOrder: siteData.sortOrder,
      }

      const site = existingSite
        ? await prisma.aidocumentSite.update({
            where: {id: existingSite.id},
            data: siteDataToUpsert,
          })
        : await prisma.aidocumentSite.create({
            data: siteDataToUpsert,
          })
      createdSites.push(site)
      console.log(`${siteData.name}を${existingSite ? '更新' : '作成'}しました (ID: ${site.id})`)
    }

    // 4. 各現場にスタッフをupsert
    const staffDataBySite: Record<string, Array<Omit<AidocumentStaff, 'id' | 'createdAt' | 'updatedAt' | 'siteId'>>> = {
      現場1: [
        {
          name: '専門技術者A',
          role: '専門技術者',
          qualification: '一級建築士',
          workContent: '構造設計・施工管理',
          age: 35,
          gender: '男性',
          term: '2024-04-01~2025-03-31',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 1,
        },
        {
          name: '専門技術者B',
          role: '専門技術者',
          qualification: '一級建築施工管理技士',
          workContent: '施工管理・品質管理',
          age: 32,
          gender: '女性',
          term: '2024-04-01~2025-03-31',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 2,
        },
        {
          name: '作業員A',
          role: '作業員',
          qualification: 'とび技能士2級',
          workContent: '足場組立・解体作業',
          age: 28,
          gender: '男性',
          term: '2024-04-01~2025-03-31',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 3,
        },
        {
          name: '作業員B',
          role: '作業員',
          qualification: '型枠技能士2級',
          workContent: '型枠工事',
          age: 25,
          gender: '男性',
          term: '2024-04-01~2025-03-31',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 4,
        },
        {
          name: '作業員C',
          role: '作業員',
          qualification: '鉄筋技能士2級',
          workContent: '鉄筋工事',
          age: 30,
          gender: '男性',
          term: '2024-04-01~2025-03-31',
          isForeigner: true,
          isTrainee: false,
          sortOrder: 5,
        },
      ],
      現場2: [
        {
          name: '専門技術者C',
          role: '専門技術者',
          qualification: '一級建築士',
          workContent: '構造設計・施工管理',
          age: 40,
          gender: '男性',
          term: '2024-05-01~2025-04-30',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 1,
        },
        {
          name: '専門技術者D',
          role: '専門技術者',
          qualification: '一級建築施工管理技士',
          workContent: '施工管理・安全管理',
          age: 38,
          gender: '男性',
          term: '2024-05-01~2025-04-30',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 2,
        },
        {
          name: '作業員D',
          role: '作業員',
          qualification: 'とび技能士1級',
          workContent: '足場組立・解体作業',
          age: 45,
          gender: '男性',
          term: '2024-05-01~2025-04-30',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 3,
        },
        {
          name: '作業員E',
          role: '作業員',
          qualification: '型枠技能士1級',
          workContent: '型枠工事',
          age: 33,
          gender: '男性',
          term: '2024-05-01~2025-04-30',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 4,
        },
        {
          name: '作業員F',
          role: '作業員',
          qualification: '鉄筋技能士1級',
          workContent: '鉄筋工事',
          age: 29,
          gender: '女性',
          term: '2024-05-01~2025-04-30',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 5,
        },
        {
          name: '作業員G',
          role: '作業員',
          qualification: 'コンクリート技能士2級',
          workContent: 'コンクリート打設',
          age: 27,
          gender: '男性',
          term: '2024-05-01~2025-04-30',
          isForeigner: true,
          isTrainee: true,
          sortOrder: 6,
        },
      ],
      現場3: [
        {
          name: '専門技術者E',
          role: '専門技術者',
          qualification: '一級建築士',
          workContent: '構造設計・施工管理',
          age: 42,
          gender: '男性',
          term: '2024-06-01~2025-05-31',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 1,
        },
        {
          name: '専門技術者F',
          role: '専門技術者',
          qualification: '一級建築施工管理技士',
          workContent: '施工管理・品質管理',
          age: 36,
          gender: '女性',
          term: '2024-06-01~2025-05-31',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 2,
        },
        {
          name: '専門技術者G',
          role: '専門技術者',
          qualification: '一級建築施工管理技士',
          workContent: '安全管理・環境管理',
          age: 34,
          gender: '男性',
          term: '2024-06-01~2025-05-31',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 3,
        },
        {
          name: '作業員H',
          role: '作業員',
          qualification: 'とび技能士1級',
          workContent: '足場組立・解体作業',
          age: 39,
          gender: '男性',
          term: '2024-06-01~2025-05-31',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 4,
        },
        {
          name: '作業員I',
          role: '作業員',
          qualification: '型枠技能士1級',
          workContent: '型枠工事',
          age: 31,
          gender: '男性',
          term: '2024-06-01~2025-05-31',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 5,
        },
        {
          name: '作業員J',
          role: '作業員',
          qualification: '鉄筋技能士1級',
          workContent: '鉄筋工事',
          age: 26,
          gender: '男性',
          term: '2024-06-01~2025-05-31',
          isForeigner: false,
          isTrainee: false,
          sortOrder: 6,
        },
        {
          name: '作業員K',
          role: '作業員',
          qualification: 'コンクリート技能士1級',
          workContent: 'コンクリート打設',
          age: 24,
          gender: '男性',
          term: '2024-06-01~2025-05-31',
          isForeigner: true,
          isTrainee: false,
          sortOrder: 7,
        },
        {
          name: '作業員L',
          role: '作業員',
          qualification: '左官技能士2級',
          workContent: '左官工事',
          age: 22,
          gender: '男性',
          term: '2024-06-01~2025-05-31',
          isForeigner: true,
          isTrainee: true,
          sortOrder: 8,
        },
      ],
    }

    const createdStaff: AidocumentStaff[] = []
    for (const site of createdSites) {
      const staffData = staffDataBySite[site.name] || []
      for (const staffItem of staffData) {
        console.log(`${site.name}のスタッフ「${staffItem.name}」をupsert中...`)
        const existingStaff = await prisma.aidocumentStaff.findFirst({
          where: {
            siteId: site.id,
            name: staffItem.name,
          },
        })

        const staff = existingStaff
          ? await prisma.aidocumentStaff.update({
              where: {id: existingStaff.id},
              data: {
                ...staffItem,
                siteId: site.id,
              },
            })
          : await prisma.aidocumentStaff.create({
              data: {
                ...staffItem,
                siteId: site.id,
              },
            })
        createdStaff.push(staff)
        console.log(`${site.name}のスタッフ「${staffItem.name}」を${existingStaff ? '更新' : '作成'}しました (ID: ${staff.id})`)
      }
    }

    // 5. 各現場に車両をupsert
    const vehicleDataBySite: Record<string, Array<Omit<AidocumentVehicle, 'id' | 'createdAt' | 'updatedAt' | 'siteId'>>> = {
      現場1: [
        {
          plate: '品川 500 あ 1234',
          term: '2024-04-01~2025-03-31',
          sortOrder: 1,
        },
        {
          plate: '品川 500 い 5678',
          term: '2024-04-01~2025-03-31',
          sortOrder: 2,
        },
        {
          plate: '品川 500 う 9012',
          term: '2024-04-01~2025-03-31',
          sortOrder: 3,
        },
      ],
      現場2: [
        {
          plate: '品川 500 え 3456',
          term: '2024-05-01~2025-04-30',
          sortOrder: 1,
        },
        {
          plate: '品川 500 お 7890',
          term: '2024-05-01~2025-04-30',
          sortOrder: 2,
        },
        {
          plate: '品川 500 か 1357',
          term: '2024-05-01~2025-04-30',
          sortOrder: 3,
        },
        {
          plate: '品川 500 き 2468',
          term: '2024-05-01~2025-04-30',
          sortOrder: 4,
        },
      ],
      現場3: [
        {
          plate: '品川 500 く 3691',
          term: '2024-06-01~2025-05-31',
          sortOrder: 1,
        },
        {
          plate: '品川 500 け 4702',
          term: '2024-06-01~2025-05-31',
          sortOrder: 2,
        },
        {
          plate: '品川 500 こ 5813',
          term: '2024-06-01~2025-05-31',
          sortOrder: 3,
        },
        {
          plate: '品川 500 さ 6924',
          term: '2024-06-01~2025-05-31',
          sortOrder: 4,
        },
        {
          plate: '品川 500 し 7035',
          term: '2024-06-01~2025-05-31',
          sortOrder: 5,
        },
      ],
    }

    const createdVehicles: AidocumentVehicle[] = []
    for (const site of createdSites) {
      const vehicleData = vehicleDataBySite[site.name] || []
      for (const vehicleItem of vehicleData) {
        console.log(`${site.name}の車両「${vehicleItem.plate}」をupsert中...`)
        const existingVehicle = await prisma.aidocumentVehicle.findFirst({
          where: {
            siteId: site.id,
            plate: vehicleItem.plate,
          },
        })

        const vehicle = existingVehicle
          ? await prisma.aidocumentVehicle.update({
              where: {id: existingVehicle.id},
              data: {
                ...vehicleItem,
                siteId: site.id,
              },
            })
          : await prisma.aidocumentVehicle.create({
              data: {
                ...vehicleItem,
                siteId: site.id,
              },
            })
        createdVehicles.push(vehicle)
        console.log(
          `${site.name}の車両「${vehicleItem.plate}」を${existingVehicle ? '更新' : '作成'}しました (ID: ${vehicle.id})`
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'aidocumentシーディングが完了しました',
      data: {
        testCompany: {
          id: testCompany.id,
          name: testCompany.name,
          type: testCompany.type,
        },
        clientCompany: {
          id: clientCompany.id,
          name: clientCompany.name,
          type: clientCompany.type,
        },
        sites: createdSites.map(site => ({
          id: site.id,
          name: site.name,
          clientId: site.clientId,
          companyId: site.companyId,
        })),
      },
      counts: {
        companies: 2,
        sites: createdSites.length,
        staff: createdStaff.length,
        vehicles: createdVehicles.length,
      },
    })
  } catch (error) {
    console.error('aidocumentシーディングエラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'aidocumentシーディングに失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

export async function GET() {
  try {
    // 現在のテストデータ件数を取得
    const testCompanyCount = await prisma.aidocumentCompany.count({
      where: {name: 'テスト企業'},
    })
    const clientCompanyCount = await prisma.aidocumentCompany.count({
      where: {name: '取引先A'},
    })
    const sitesCount = await prisma.aidocumentSite.count({
      where: {
        OR: [{Client: {name: '取引先A'}}, {Company: {name: 'テスト企業'}}],
      },
    })

    const staffCount = await prisma.aidocumentStaff.count({
      where: {
        Site: {
          OR: [{Client: {name: '取引先A'}}, {Company: {name: 'テスト企業'}}],
        },
      },
    })

    const vehiclesCount = await prisma.aidocumentVehicle.count({
      where: {
        Site: {
          OR: [{Client: {name: '取引先A'}}, {Company: {name: 'テスト企業'}}],
        },
      },
    })

    return NextResponse.json({
      success: true,
      counts: {
        testCompany: testCompanyCount,
        clientCompany: clientCompanyCount,
        sites: sitesCount,
        staff: staffCount,
        vehicles: vehiclesCount,
      },
    })
  } catch (error) {
    console.error('データ取得エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'データ取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
