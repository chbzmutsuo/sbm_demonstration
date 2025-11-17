import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('トレーニングデータのシーディングを開始します...')

  // テスト用ユーザーID（既存のユーザーを使用するか、新規作成）
  const userId = 1

  try {
    // 種目マスタの作成
    console.log('種目マスタを作成中...')
    const exerciseMasters = await Promise.all([
      // 胸
      prisma.exerciseMaster.create({
        data: {
          userId,
          part: '胸',
          name: 'ベンチプレス',
          unit: 'kg',
        },
      }),
      prisma.exerciseMaster.create({
        data: {
          userId,
          part: '胸',
          name: 'ダンベルフライ',
          unit: 'kg',
        },
      }),
      prisma.exerciseMaster.create({
        data: {
          userId,
          part: '胸',
          name: 'プッシュアップ',
          unit: '回',
        },
      }),

      // 背中
      prisma.exerciseMaster.create({
        data: {
          userId,
          part: '背中',
          name: 'デッドリフト',
          unit: 'kg',
        },
      }),
      prisma.exerciseMaster.create({
        data: {
          userId,
          part: '背中',
          name: 'ラットプルダウン',
          unit: 'kg',
        },
      }),
      prisma.exerciseMaster.create({
        data: {
          userId,
          part: '背中',
          name: 'バーベルロウ',
          unit: 'kg',
        },
      }),

      // 肩
      prisma.exerciseMaster.create({
        data: {
          userId,
          part: '肩',
          name: 'ショルダープレス',
          unit: 'kg',
        },
      }),
      prisma.exerciseMaster.create({
        data: {
          userId,
          part: '肩',
          name: 'サイドレイズ',
          unit: 'kg',
        },
      }),

      // 腕
      prisma.exerciseMaster.create({
        data: {
          userId,
          part: '腕',
          name: 'バーベルカール',
          unit: 'kg',
        },
      }),
      prisma.exerciseMaster.create({
        data: {
          userId,
          part: '腕',
          name: 'トライセップスエクステンション',
          unit: 'kg',
        },
      }),

      // 足
      prisma.exerciseMaster.create({
        data: {
          userId,
          part: '足',
          name: 'スクワット',
          unit: 'kg',
        },
      }),
      prisma.exerciseMaster.create({
        data: {
          userId,
          part: '足',
          name: 'レッグプレス',
          unit: 'kg',
        },
      }),

      // 有酸素
      prisma.exerciseMaster.create({
        data: {
          userId,
          part: '有酸素',
          name: 'ランニング',
          unit: 'km',
        },
      }),
      prisma.exerciseMaster.create({
        data: {
          userId,
          part: '有酸素',
          name: 'サイクリング',
          unit: 'min',
        },
      }),
    ])

    console.log(`${exerciseMasters.length}個の種目マスタを作成しました`)

    // ワークアウトログの作成（過去3ヶ月分のサンプルデータ）
    console.log('ワークアウトログを作成中...')
    const workoutlogList: any[] = []

    // 過去3ヶ月分のデータを生成
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const baseDate = new Date()
      baseDate.setMonth(baseDate.getMonth() - monthOffset)

      // 各月に3-5回のトレーニング日を設定
      const trainingDaysInMonth = Math.floor(Math.random() * 3) + 3

      for (let day = 0; day < trainingDaysInMonth; day++) {
        const trainingDate = toUtc(baseDate)
        trainingDate.setDate(Math.floor(Math.random() * 28) + 1)

        // 各トレーニング日に2-4種目の記録を作成
        const exercisesPerDay = Math.floor(Math.random() * 3) + 2
        const selectedExercises = exerciseMasters.sort(() => Math.random() - 0.5).slice(0, exercisesPerDay)

        for (const exercise of selectedExercises) {
          // 種目に応じた適切な強度と回数を設定
          let strength, reps

          if (exercise.unit === 'kg') {
            // 重量系種目
            if (exercise.name.includes('ベンチプレス') || exercise.name.includes('デッドリフト')) {
              strength = Math.floor(Math.random() * 40) + 60 // 60-100kg
              reps = Math.floor(Math.random() * 8) + 3 // 3-10回
            } else if (exercise.name.includes('スクワット')) {
              strength = Math.floor(Math.random() * 30) + 50 // 50-80kg
              reps = Math.floor(Math.random() * 8) + 3 // 3-10回
            } else {
              strength = Math.floor(Math.random() * 20) + 10 // 10-30kg
              reps = Math.floor(Math.random() * 12) + 8 // 8-20回
            }
          } else if (exercise.unit === '回') {
            // 自重系種目
            strength = 0
            reps = Math.floor(Math.random() * 15) + 10 // 10-25回
          } else if (exercise.unit === 'km') {
            // 距離系種目
            strength = Math.floor(Math.random() * 5) + 3 // 3-8km
            reps = 1
          } else if (exercise.unit === 'min') {
            // 時間系種目
            strength = Math.floor(Math.random() * 30) + 20 // 20-50分
            reps = 1
          } else {
            // その他
            strength = Math.floor(Math.random() * 20) + 10
            reps = Math.floor(Math.random() * 10) + 5
          }

          // セット数（1-3セット）
          const sets = Math.floor(Math.random() * 3) + 1

          for (let set = 0; set < sets; set++) {
            // セットごとに少し強度を変動させる
            const setStrength = strength + (set === 0 ? 0 : Math.floor(Math.random() * 5) - 2)
            const setReps = reps + (set === 0 ? 0 : Math.floor(Math.random() * 3) - 1)

            workoutlogList.push({
              userId,
              exerciseId: exercise.id,
              date: trainingDate,
              strength: Math.max(0, setStrength),
              reps: Math.max(1, setReps),
            })
          }
        }
      }
    }

    // ワークアウトログを一括作成
    const createdlogList = await prisma.workoutLog.createMany({
      data: workoutlogList,
    })

    console.log(`${createdlogList.count}件のワークアウトログを作成しました`)

    console.log('✅ トレーニングデータのシーディングが完了しました！')
    console.log(`📊 作成されたデータ:`)
    console.log(`   - 種目マスタ: ${exerciseMasters.length}個`)
    console.log(`   - ワークアウトログ: ${createdlogList.count}件`)
    console.log(`   - 対象期間: 過去3ヶ月`)
    console.log(`   - ユーザーID: ${userId}`)
  } catch (error) {
    console.error('❌ シーディング中にエラーが発生しました:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
