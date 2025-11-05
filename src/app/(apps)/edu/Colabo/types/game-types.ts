/**
 * Colaboゲーム実施中の型定義
 */

// スライドモード
export type SlideMode = 'view' | 'answer' | 'result'

// ロール
export type UserRole = 'teacher' | 'student'

// ゲーム状態
export interface GameState {
  gameId: number
  currentSlideId: number | null
  slideMode: SlideMode | null
  totalStudents: number
  connectedStudents: number
}

// スライドデータ
export interface SlideData {
  id: number
  gameId: number
  templateType: string
  sortOrder: number
  contentData: SlideContentData
}

// スライドコンテンツデータ
export interface SlideContentData {
  title?: string
  blocks?: SlideBlock[] // 互換性のため残す（後方互換）
  rows?: SlideRow[] // 新しいグリッドレイアウト構造
  question?: string
  choices?: Choice[]
}

// スライド行（グリッドレイアウト）
export interface SlideRow {
  id: string
  columns: number // 1-6の列数
  blocks: SlideBlock[]
}

// ブロック
export interface SlideBlock {
  id: string
  blockType: 'text' | 'image' | 'link' | 'quiz_question' | 'choice_option'
  content?: string
  imageUrl?: string
  linkUrl?: string
  alignment?: 'left' | 'center' | 'right'
  textColor?: string
  backgroundColor?: string
  fontWeight?: string
  textDecoration?: string
  fontSize?: number // 8-100pxのフォントサイズ
  sortOrder: number
}

// 選択肢
export interface Choice {
  id: string
  text: string
  isCorrect: boolean
  sortOrder: number
}

// 回答データ
export interface AnswerData {
  type: 'choice' | 'freetext' | 'psycho' | 'summary'
  choiceIndex?: number
  textAnswer?: string
  psychoData?: PsychoAnswerData
  summaryData?: SummaryAnswerData
}

// 心理アンケート回答
export interface PsychoAnswerData {
  [key: string]: number | string
}

// まとめアンケート回答
export interface SummaryAnswerData {
  lessonImpression?: string
  lessonSatisfaction?: number
  [key: string]: any
}

// 回答エンティティ（DB）
export interface SlideAnswer {
  id: number
  slideId: number
  studentId: number
  gameId: number
  answerData: AnswerData
  isShared: boolean
  isAnonymous: boolean
  createdAt: Date
  updatedAt?: Date

  Student?: {
    id: number
    name: string
    attendanceNumber?: number
  }
}

// 回答統計
export interface AnswerStats {
  totalCount: number
  answerCount: number
  submittedStudentIds: number[]
}

// 共有回答
export interface SharedAnswer {
  answerId: number
  content: string
  isAnonymous: boolean
  studentName?: string
}

// 教師ビューのProps
export interface TeacherViewProps {
  game: GameData
  slides: SlideData[]
  initialSlideIndex?: number
  initialMode?: SlideMode | null
}

// 生徒ビューのProps
export interface StudentViewProps {
  game: GameData
  student: StudentData
  slides: SlideData[]
}

// ゲームデータ
export interface GameData {
  id: number
  name: string
  date: Date
  secretKey: string
  currentSlideId: number | null
  slideMode: SlideMode | null
  School?: {
    id: number
    name: string
  }
  Teacher?: {
    id: number
    name: string
  }
  SubjectNameMaster?: {
    id: number
    name: string
  }
  GameStudent?: GameStudent[]
  Slide?: SlideData[]
}

// ゲーム参加生徒
export interface GameStudent {
  id: number
  gameId: number
  studentId: number
  sortOrder: number
  Student: StudentData
}

// 生徒データ
export interface StudentData {
  id: number
  name: string
  kana?: string
  attendanceNumber?: number
}
