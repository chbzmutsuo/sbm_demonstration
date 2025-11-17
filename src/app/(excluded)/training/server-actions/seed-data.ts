'use server'

import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

/**
 * トレーニングアプリのテストデータを生成するサーバーアクション
 * @param userId ユーザーID
 * @returns 生成結果
 */
export async function seedTrainingData(userId: number) {
  if (!userId) {
    throw new Error('ユーザーIDが指定されていません')
  }

  try {
    console.log(`ユーザーID ${userId} のトレーニングデータシーディングを開始します...`)

    // 既存データの確認
    const existingMasters = await doStandardPrisma('exerciseMaster', 'findMany', {
      where: {userId},
      select: {id: true},
    })

    const existinglogList = await doStandardPrisma('workoutLog', 'findMany', {
      where: {userId},
      select: {id: true},
    })

    console.log(
      `既存データ: 種目マスタ ${existingMasters.result?.length || 0}件, ワークアウトログ ${existinglogList.result?.length || 0}件`
    )

    // 種目マスタの作成
    const exerciseMastersData = [
      // 胸
      {userId, part: '胸', name: 'ベンチプレス', unit: 'kg'},
      {userId, part: '胸', name: 'ダンベルフライ', unit: 'kg'},
      {userId, part: '胸', name: 'プッシュアップ', unit: '回'},

      // 背中
      {userId, part: '背中', name: 'デッドリフト', unit: 'kg'},
      {userId, part: '背中', name: 'ラットプルダウン', unit: 'kg'},
      {userId, part: '背中', name: 'バーベルロウ', unit: 'kg'},

      // 肩
      {userId, part: '肩', name: 'ショルダープレス', unit: 'kg'},
      {userId, part: '肩', name: 'サイドレイズ', unit: 'kg'},

      // 腕
      {userId, part: '腕', name: 'バーベルカール', unit: 'kg'},
      {userId, part: '腕', name: 'トライセップスエクステンション', unit: 'kg'},

      // 足
      {userId, part: '足', name: 'スクワット', unit: 'kg'},
      {userId, part: '足', name: 'レッグプレス', unit: 'kg'},

      // 有酸素
      {userId, part: '有酸素', name: 'ランニング', unit: 'km'},
      {userId, part: '有酸素', name: 'サイクリング', unit: 'min'},
    ]

    // 種目マスタを一括作成
    const createdMasters = await doStandardPrisma('exerciseMaster', 'createMany', {
      data: exerciseMastersData,
      skipDuplicates: true,
    })

    // 作成された種目マスタを取得
    const masters = await doStandardPrisma('exerciseMaster', 'findMany', {
      where: {userId},
    })

    if (!masters.result || masters.result.length === 0) {
      throw new Error('種目マスタの作成に失敗しました')
    }

    // ワークアウトログの作成（過去3ヶ月分のサンプルデータ）
    const workoutlogList: Array<{
      userId: number
      exerciseId: number
      date: Date
      strength: number
      reps: number
    }> = []

    // 過去3ヶ月分のデータを生成
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const baseDate = new Date()
      baseDate.setMonth(baseDate.getMonth() - monthOffset)

      // 各月に3-5回のトレーニング日を設定
      const trainingDaysInMonth = Math.floor(Math.random() * 3) + 3

      for (let day = 0; day < trainingDaysInMonth; day++) {
        const randomDay = Math.floor(Math.random() * 28) + 1
        const trainingDate = toUtc(new Date(Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), randomDay, 0, 0, 0, 0)))

        // 各トレーニング日に2-4種目の記録を作成
        const exercisesPerDay = Math.floor(Math.random() * 3) + 2
        const selectedExercises = masters.result.sort(() => Math.random() - 0.5).slice(0, exercisesPerDay)

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
    const createdlogList = await doStandardPrisma('workoutLog', 'createMany', {
      data: workoutlogList,
    })

    return {
      success: true,
      message: 'トレーニングデータのシーディングが完了しました',
      data: {
        mastersCreated: createdMasters.result?.count || 0,
        logListCreated: createdlogList.result?.count || 0,
        totalMasters: masters.result?.length || 0,
        totallogList: (existinglogList.result?.length || 0) + (createdlogList.result?.count || 0),
      },
    }
  } catch (error) {
    console.error('シーディング中にエラーが発生しました:', error)
    return {
      success: false,
      message: `エラーが発生しました: ${error.message}`,
      error,
    }
  }
}
