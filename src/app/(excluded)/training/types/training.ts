// 種目マスター
export interface ExerciseMaster {
  id: number
  name: string
  part: string
  userId: number
  isPublic?: boolean
  createdAt: Date
  updatedAt: Date
  sortOrder?: number
  color?: string | null
  unit?: string
}

// トレーニングログの入力データ
export interface WorkoutLogInput {
  exerciseId: number
  strength: number
  reps: number
}

// トレーニングログ（マスターデータ含む）
export interface WorkoutLogWithMaster {
  id: number
  exerciseId: number
  userId: number
  strength: number
  reps: number
  date: Date
  createdAt: Date
  updatedAt: Date
  exercise?: ExerciseMaster
  ExerciseMaster?: ExerciseMaster
}
