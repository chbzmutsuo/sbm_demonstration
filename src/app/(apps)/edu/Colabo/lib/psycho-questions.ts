/**
 * Colabo心理アンケート質問定義
 * Groupingアプリと互換性のある質問セット
 */

export interface PsychoQuestion {
  label: string
  type: 'curiocity' | 'efficacy'
}

export interface PsychoQuestionCategory {
  key: 'curiocity' | 'efficacy'
  label: string
  questions: PsychoQuestion[]
}

/**
 * 心理アンケートの質問セット
 * - curiocity: 課題への好奇心（5問）
 * - efficacy: 課題への効力感（5問）
 */
export const PSYCHO_QUESTIONS: PsychoQuestionCategory[] = [
  {
    key: 'curiocity',
    label: '課題への好奇心',
    questions: [
      {
        label: 'この授業（じゅぎょう）の課題（かだい）をさらに深（ふか）めたいと思（おも）う',
        type: 'curiocity',
      },
      {
        label: 'この授業（じゅぎょう）の課題（かだい）についてもっとしらべたいと思（おも）う',
        type: 'curiocity',
      },
      {
        label: 'この授業（じゅぎょう）の課題（かだい）について興味（きょうみ）をもってとりくむことができる',
        type: 'curiocity',
      },
      {
        label: 'この授業（じゅぎょう）の課題（かだい）にとりくんでいて、おもしろいと感じ（かんじ）る',
        type: 'curiocity',
      },
      {
        label: 'この授業（じゅぎょう）の課題（かだい）にとりくんでいて満足感（まんぞくかん）がえられると思（おも）う',
        type: 'curiocity',
      },
    ],
  },
  {
    key: 'efficacy',
    label: '課題への効力感',
    questions: [
      {
        label: '自分（じぶん）はこの授業（じゅぎょう）の課題（かだい）は努力（どりょく）しなくてもやっていける',
        type: 'efficacy',
      },
      {
        label: '自分（じぶん）はこの授業（じゅぎょう）の課題（かだい）をうまくやる自信（じしん）がある',
        type: 'efficacy',
      },
      {
        label: '自分（じぶん）はこの授業（じゅぎょう）の課題（かだい）を達成（たっせい）できる力がある',
        type: 'efficacy',
      },
      {
        label: '自分（じぶん）はこの授業（じゅぎょう）の課題（かだい）をあきらめずにとりくめる',
        type: 'efficacy',
      },
      {
        label:
          '自分（じぶん）はこのレベルの課題（かだい）を達成（たっせい）するのに時間（じかん）はあまりかからないと思（おも）う',
        type: 'efficacy',
      },
    ],
  },
]

/**
 * 質問を平坦化した配列を返す（ランダムソート可能）
 */
export function flattenQuestions(shouldShuffle = true): Array<PsychoQuestion & {questionKey: string}> {
  const flattened: Array<PsychoQuestion & {questionKey: string}> = []

  PSYCHO_QUESTIONS.forEach(category => {
    category.questions.forEach((q, idx) => {
      const questionKey = `${q.type}${idx + 1}`
      flattened.push({
        ...q,
        questionKey,
      })
    })
  })

  if (shouldShuffle) {
    // ランダムにシャッフル
    return flattened.sort(() => Math.random() - 0.5)
  }

  return flattened
}

/**
 * 好奇心と効力感のスコアを計算
 */
export function calculateScores(answerData: any): {curiocity: number; efficacy: number} {
  let curiocity = 0
  let efficacy = 0

  for (let i = 1; i <= 5; i++) {
    curiocity += answerData?.[`curiocity${i}`] ?? 0
    efficacy += answerData?.[`efficacy${i}`] ?? 0
  }

  return {curiocity, efficacy}
}

/**
 * 回答の評価ラベルを取得
 */
export const RATING_LABELS = [
  'まったくそう思わない',
  'あまりそう思わない',
  'どちらともいえない',
  'ややそう思う',
  'とてもそう思う',
]

/**
 * 回答値（1-5）を取得
 */
export const RATING_VALUES = [1, 2, 3, 4, 5]

