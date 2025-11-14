
export const prismaSchemaString = `
model KaizenClient {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  name                    String?
  organization            String?
  iconUrl                 String?
  bannerUrl               String?
  website                 String?
  note                    String?
  public                  Boolean?       @default(false)
  introductionRequestedAt DateTime?
  KaizenWork              KaizenWork[]
  KaizenReview            KaizenReview[]

  @@unique([name, organization], name: "unique_name_organization")
}

model KaizenReview {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  username String?
  review   String?
  platform String?

  KaizenClient   KaizenClient? @relation(fields: [kaizenClientId], references: [id], onDelete: Cascade)
  kaizenClientId Int?
}

model KaizenWork {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  uuid String? @unique @default(uuid())

  date              DateTime?
  title             String?
  subtitle          String?
  status            String?
  description       String?
  points            String?
  clientName        String?
  organization      String?
  dealPoint         Float?
  toolPoint         Float?
  impression        String?
  reply             String?
  jobCategory       String? //製造、飲食
  systemCategory    String? //GAS / アプリ
  collaborationTool String? //Freee / Insta

  KaizenWorkImage KaizenWorkImage[]
  showName        Boolean?          @default(false)

  KaizenClient   KaizenClient? @relation(fields: [kaizenClientId], references: [id], onDelete: Cascade)
  kaizenClientId Int?

  allowShowClient Boolean? @default(false)
  isPublic        Boolean? @default(false)

  correctionRequest String?

  @@unique([title, subtitle], name: "unique_title_subtitle")
}

model KaizenWorkImage {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  url String @unique

  KaizenWork   KaizenWork? @relation(fields: [kaizenWorkId], references: [id], onDelete: Cascade)
  kaizenWorkId Int?
}

model KaizenCMS {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  contactPageMsg   String?
  principlePageMsg String?
}

// ===================================================================
// カウンセリング予約管理システム - Prismaスキーマ
// ===================================================================

// 店舗マスタ
model CounselingStore {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @updatedAt
 sortOrder Float     @default(0)

 name           String // 店舗名（例：大阪店、名古屋店）
 // リレーション
 Room           CounselingRoom[]
 User           User[]
 CounselingSlot CounselingSlot[]
}

// 部屋マスタ
model CounselingRoom {
 id                Int       @id @default(autoincrement())
 createdAt         DateTime  @default(now())
 updatedAt         DateTime? @updatedAt
 sortOrder         Float     @default(0)
 name              String // 部屋名（例：510号室、Aルーム）
 counselingStoreId Int // 所属店舗ID

 // リレーション
 CounselingStore CounselingStore  @relation(fields: [counselingStoreId], references: [id], onDelete: Cascade)
 CounselingSlot  CounselingSlot[]
}

// お客様マスタ
model CounselingClient {
 id         Int       @id @default(autoincrement())
 createdAt  DateTime  @default(now())
 updatedAt  DateTime? @updatedAt
 sortOrder  Float     @default(0)
 name       String // お名前
 furigana   String? // ふりがな
 phone      String    @unique // 電話番号（一意制約）
 email      String? // メールアドレス
 gender     String? // 性別
 age        String? // 年齢（年代）
 prefecture String? // 都道府県
 address    String? // 住所（市区町村まで）

 // リレーション
 CounselingReservation CounselingReservation[]
}

// 予約情報
model CounselingReservation {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @updatedAt
 sortOrder Float     @default(0)

 status        String // ステータス（unassigned | confirmed | completed | canceled）
 preferredDate DateTime? // 希望日（YYYY-MM-DD形式）
 visitorType   String? // 来られる方（1人 | 2人）
 topics        String? // ご相談内容（JSON配列形式）
 notes         String? // 備考・その他の情報
 paymentMethod String? // 支払い方法（カード | 振込 | 現金 など）
 contactMethod String? // 連絡方法（email | phone）

 // リレーション
 CounselingClient   CounselingClient @relation(fields: [counselingClientId], references: [id], onDelete: Cascade)
 counselingClientId Int // お客様ID

 CounselingSlot   CounselingSlot? @relation(fields: [counselingSlotId], references: [id], onDelete: SetNull)
 counselingSlotId Int? // 割り当てられたスロットID（未割り当ての場合null）
}

// 提供可能枠（スロット）
model CounselingSlot {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @updatedAt
 sortOrder Float     @default(0)

 startAt DateTime // 開始日時（UTC）
 endAt   DateTime // 終了日時（UTC）

 // リレーション
 CounselingRoom   CounselingRoom @relation(fields: [counselingRoomId], references: [id], onDelete: Cascade)
 counselingRoomId Int // 部屋ID

 CounselingStore   CounselingStore @relation(fields: [counselingStoreId], references: [id], onDelete: Cascade)
 counselingStoreId Int // 店舗ID（検索の高速化のため非正規化）

 User   User? @relation(fields: [userId], references: [id], onDelete: SetNull)
 userId Int? // 担当カウンセラーID（未定の場合null）

 CounselingReservation CounselingReservation[]
}

model School {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()

  active            Boolean             @default(true)
  sortOrder         Float               @default(0)
  name              String
  Classroom         Classroom[]
  Game              Game[]
  Student           Student[]
  SubjectNameMaster SubjectNameMaster[]
  Teacher           Teacher[]
  User              User[]
}

model LearningRoleMasterOnGame {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  active    Boolean   @default(true)
  sortOrder Float     @default(0)
  name      String
  color     String?
  maxCount  Int?

  Game        Game          @relation(fields: [gameId], references: [id], onDelete: Cascade)
  gameId      Int
  StudentRole StudentRole[]
}

model SubjectNameMaster {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  active    Boolean   @default(true)
  sortOrder Float     @default(0)
  name      String
  color     String?
  schoolId  Int
  Game      Game[]
  School    School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)
}

model Teacher {
  id                   Int       @id @default(autoincrement())
  createdAt            DateTime  @default(now())
  updatedAt            DateTime? @default(now()) @updatedAt()
  active               Boolean   @default(true)
  sortOrder            Float     @default(0)
  name                 String
  kana                 String?
  schoolId             Int?
  email                String?   @unique
  password             String?
  role                 String?
  tempResetCode        String?
  tempResetCodeExpired DateTime?
  type                 String?
  Game                 Game[]

  School       School?        @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  TeacherClass TeacherClass[]
}

model Student {
  id               Int       @id @default(autoincrement())
  createdAt        DateTime  @default(now())
  updatedAt        DateTime? @default(now()) @updatedAt()
  active           Boolean   @default(true)
  sortOrder        Float     @default(0)
  name             String
  kana             String?
  gender           String?
  attendanceNumber Int?
  schoolId         Int
  classroomId      Int
  Answer           Answer[]

  Classroom   Classroom     @relation(fields: [classroomId], references: [id], onDelete: Cascade)
  School      School        @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  Squad       Squad[]       @relation("SquadToStudent")
  UnfitFellow UnfitFellow[] @relation("StudentToUnfitFellow")
  GameStudent GameStudent[]
  StudentRole StudentRole[]
  SlideAnswer SlideAnswer[]

  @@unique([schoolId, classroomId, attendanceNumber], name: "unique_schoolId_classroomId_attendanceNumber")
}

model UnfitFellow {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  active    Boolean   @default(true)
  sortOrder Float     @default(0)
  Student   Student[] @relation("StudentToUnfitFellow")
}

model Classroom {
  id           Int            @id @default(autoincrement())
  createdAt    DateTime       @default(now())
  updatedAt    DateTime?      @default(now()) @updatedAt()
  active       Boolean        @default(true)
  sortOrder    Float          @default(0)
  grade        String?
  class        String?
  schoolId     Int
  School       School         @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  Student      Student[]
  TeacherClass TeacherClass[]

  @@unique([schoolId, grade, class], name: "unique_schoolId_grade_class")
}

model TeacherClass {
  id          Int       @id @default(autoincrement())
  sortOrder   Float     @default(0)
  teacherId   Int
  classroomId Int
  Classroom   Classroom @relation(fields: [classroomId], references: [id], onDelete: Cascade)
  Teacher     Teacher   @relation(fields: [teacherId], references: [id], onDelete: Cascade)

  @@unique([teacherId, classroomId], name: "unique_teacherId_classroomId")
}

model GameStudent {
  id        Int       @id @default(autoincrement())
  sortOrder Float     @default(0)
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  gameId    Int
  studentId Int
  Game      Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
  Student   Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([gameId, studentId], name: "unique_gameId_studentId")
}

model Game {
  id                     Int       @id @default(autoincrement())
  createdAt              DateTime  @default(now())
  updatedAt              DateTime? @default(now()) @updatedAt()
  active                 Boolean   @default(true)
  sortOrder              Float     @default(0)
  name                   String
  date                   DateTime
  secretKey              String    @unique
  absentStudentIds       Int[]
  schoolId               Int
  teacherId              Int
  subjectNameMasterId    Int?
  status                 String?
  activeGroupId          Int?
  activeQuestionPromptId Int?
  nthTime                Int?
  randomTargetStudentIds Int[]
  learningContent        String?
  task                   String?
  currentSlideId         Int? // 教師が最後に表示していたスライドID
  Answer                 Answer[]

  School                   School                     @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  SubjectNameMaster        SubjectNameMaster?         @relation(fields: [subjectNameMasterId], references: [id], onDelete: Cascade)
  Teacher                  Teacher                    @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  Group                    Group[]
  QuestionPrompt           QuestionPrompt[]
  GameStudent              GameStudent[]
  LearningRoleMasterOnGame LearningRoleMasterOnGame[]
  GroupCreateConfig        GroupCreateConfig?
  Slide                    Slide[]
  SlideAnswer              SlideAnswer[]
}

model GroupCreateConfig {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  active    Boolean   @default(true)
  sortOrder Float     @default(0)

  groupCreationMode String?
  count             Int?
  criteria          String?
  genderConfig      String?

  Game   Game @relation(fields: [gameId], references: [id])
  gameId Int  @unique
}

model Group {
  id             Int             @id @default(autoincrement())
  createdAt      DateTime        @default(now())
  updatedAt      DateTime?       @default(now()) @updatedAt()
  active         Boolean         @default(true)
  sortOrder      Float           @default(0)
  name           String
  isSaved        Boolean
  Game           Game            @relation(fields: [gameId], references: [id], onDelete: Cascade)
  Squad          Squad[]
  QuestionPrompt QuestionPrompt? @relation(fields: [questionPromptId], references: [id], onDelete: Cascade)

  gameId           Int
  questionPromptId Int?
}

model Squad {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  active    Boolean   @default(true)
  sortOrder Float     @default(0)
  name      String
  groupId   Int
  Group     Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  Student   Student[] @relation("SquadToStudent")

  StudentRole StudentRole[]
}

model StudentRole {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  active    Boolean   @default(true)
  sortOrder Float     @default(0)

  Squad Squad @relation(fields: [squadId], references: [id])

  Student Student @relation(fields: [studentId], references: [id])

  LearningRoleMasterOnGame   LearningRoleMasterOnGame @relation(fields: [learningRoleMasterOnGameId], references: [id])
  studentId                  Int
  learningRoleMasterOnGameId Int
  squadId                    Int
}

model QuestionPrompt {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  active    Boolean   @default(true)
  sortOrder Float     @default(0)
  gameId    Int
  asSummary Boolean   @default(false)
  Answer    Answer[]
  Group     Group[]
  Game      Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
}

model Answer {
  id                 Int             @id @default(autoincrement())
  createdAt          DateTime        @default(now())
  updatedAt          DateTime?       @default(now()) @updatedAt()
  active             Boolean         @default(true)
  sortOrder          Float           @default(0)
  curiocity1         Int?
  curiocity2         Int?
  curiocity3         Int?
  curiocity4         Int?
  curiocity5         Int?
  efficacy1          Int?
  efficacy2          Int?
  efficacy3          Int?
  efficacy4          Int?
  efficacy5          Int?
  impression         String?
  gameId             Int
  studentId          Int
  questionPromptId   Int?
  asSummary          Boolean         @default(false)
  lessonImpression   String?
  lessonSatisfaction Int?
  Game               Game            @relation(fields: [gameId], references: [id], onDelete: Cascade)
  QuestionPrompt     QuestionPrompt? @relation(fields: [questionPromptId], references: [id], onDelete: Cascade)
  Student            Student         @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([gameId, studentId, questionPromptId], name: "unique_gameId_studentId_questionPromptId")
}

model Slide {
  id           Int           @id @default(autoincrement())
  createdAt    DateTime      @default(now())
  updatedAt    DateTime?     @updatedAt()
  active       Boolean       @default(true)
  sortOrder    Float         @default(0)
  gameId       Int
  templateType String
  contentData  Json
  mode         String? // スライドごとのモード: 'view' | 'answer' | 'result' | null
  Game         Game          @relation(fields: [gameId], references: [id], onDelete: Cascade)
  SlideAnswer  SlideAnswer[]
}

model SlideAnswer {
  id          Int       @id @default(autoincrement())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime? @updatedAt()
  active      Boolean   @default(true)
  slideId     Int
  studentId   Int
  gameId      Int
  answerData  Json
  isShared    Boolean   @default(false) // 共有されているか
  isAnonymous Boolean   @default(false) // 匿名で共有されているか
  Slide       Slide     @relation(fields: [slideId], references: [id], onDelete: Cascade)
  Student     Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  Game        Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@unique([slideId, studentId, gameId])
}

// 経費記録アプリ用スキーマ
model KeihiExpense {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 基本情報
  date                DateTime
  amount              Int
  counterparty        String? // 場所
  participants        String? // 相手名
  conversationPurpose String[] // 会話の目的（複数選択対応）
  keywords            String[] // キーワード（配列）

  // 会話記録
  summary             String? // 摘要
  conversationSummary String? // 会話内容の要約

  // AI生成情報（統合版）
  insight  String? // 統合されたインサイト
  autoTags String[] // 自動生成タグ
  // レコード状態
  status   String?  @default("未設定") // 例: "一次チェック済", "MF連携済み"

  // MoneyForward用情報（統合された科目管理）
  mfSubject     String? // 統合された科目フィールド（必須）
  mfSubAccount  String? // MF用補助科目
  mfTaxCategory String? // MF用税区分
  mfDepartment  String? // MF用部門

  // ファイル添付
  KeihiAttachment KeihiAttachment[]

  // ユーザー情報（将来的に）
  userId String?
}

model KeihiAttachment {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  filename     String
  originalName String
  mimeType     String
  size         Int
  url          String // S3 URL or local path

  keihiExpenseId String?
  KeihiExpense   KeihiExpense? @relation(fields: [keihiExpenseId], references: [id], onDelete: Cascade)
}

// 勘定科目マスタ（将来的に）
model KeihiAccountMaster {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  category       String // 帳票
  classification String // 分類
  balanceSheet   String // 決算書科目
  account        String // 勘定科目
  subAccount     String? // 補助科目
  taxCategory    String // 税区分
  searchKey      String? // 検索キー
  isActive       Boolean @default(true) // 使用
  sortOrder      Int? // 並び順
}

// 選択肢マスタ（科目、業種、目的など）
model KeihiOptionMaster {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  category    String // 'subjects', 'industries', 'purposes'
  value       String // 選択肢の値
  label       String // 表示名
  description String? // 説明
  isActive    Boolean @default(true) // 有効/無効
  sortOrder   Int     @default(0) // 並び順
  color       String? // 色（任意）

  @@unique([category, value], name: "category_value_unique")
  @@index([category, isActive, sortOrder])
}

// 生産管理システム用Prismaスキーマ
// ai-agent-direction.mdの規約に従って設計

// 製品マスター
model Product {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @updatedAt()
 sortOrder Float     @default(0)

 name               String // 商品名
 color              String // カラー
 cost               Int // コスト（税抜）
 productionCapacity Int // 生産能力（枚/人・時）
 allowanceStock     Int // 余裕在庫数（枚）

 // リレーション
 ProductRecipe        ProductRecipe[]
 Order                Order[]
 Production           Production[]
 Shipment             Shipment[]
 DailyStaffAssignment DailyStaffAssignment[]
}

// 原材料マスター
model RawMaterial {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @updatedAt()
 sortOrder Float     @default(0)

 name        String // 名称
 category    String // カテゴリ（例：カラーチップ、ヒーター線など）
 unit        String // 単位（g, 個など）
 cost        Int // コスト（税抜）
 safetyStock Int // 安全在庫数

 // リレーション
 ProductRecipe   ProductRecipe[]
 StockAdjustment StockAdjustment[]
}

// 製品レシピ（製品と原材料の関連）
model ProductRecipe {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @updatedAt()
 sortOrder Float     @default(0)

 productId     Int
 rawMaterialId Int
 amount        Int // 使用量

 // リレーション
 Product     Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
 RawMaterial RawMaterial @relation(fields: [rawMaterialId], references: [id], onDelete: Cascade)

 @@unique([productId, rawMaterialId], name: "product_rawMaterial_unique")
}

// 受注データ
model Order {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @updatedAt()
 sortOrder Float     @default(0)

 orderAt   DateTime // 受注日
 productId Int
 quantity  Int // 受注枚数
 amount    Int // 売上金額（受注日時点の商品マスターのコストに基づき自動計算）
 note      String? // 備考（フリーテキスト）

 // リレーション
 Product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

// 生産データ
model Production {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @updatedAt()
 sortOrder Float     @default(0)

 productionAt DateTime // 生産日
 productId    Int
 quantity     Int // 生産枚数
 type         String // 生産区分（国産または中国産）
 note         String? // 備考（フリーテキスト）

 // リレーション
 Product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

// 出荷データ
model Shipment {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @updatedAt()
 sortOrder Float     @default(0)

 shipmentId String // ユニークな識別子（バーコードなど）
 shipmentAt DateTime // 出荷日
 productId  Int
 quantity   Int // 出荷数
 note       String? // 備考（フリーテキスト）

 // リレーション
 Product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

// 在庫調整（原材料の入荷・廃棄など）
model StockAdjustment {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @updatedAt()
 sortOrder Float     @default(0)

 rawMaterialId Int
 adjustmentAt  DateTime // 調整日
 reason        String // 理由（入荷、廃棄、サンプル使用、棚卸差異など）
 quantity      Int // 数量（入荷は正、その他は負）

 // リレーション
 RawMaterial RawMaterial @relation(fields: [rawMaterialId], references: [id], onDelete: Cascade)
}

// 会社カレンダー（休日設定）
model CompanyHoliday {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @updatedAt()
 sortOrder Float     @default(0)

 holidayAt   DateTime @unique // 日付
 holidayType String   @default("休日") // 休日種別（休日、祝日、夏季休暇など）
 note        String? // 備考
}

// 日別人員配置（ダッシュボード用）
model DailyStaffAssignment {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @updatedAt()
 sortOrder Float     @default(0)

 assignmentAt DateTime // 配置日
 productId    Int
 staffCount   Int      @default(3) // 配置人数（デフォルト3人）

 // リレーション
 Product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

 @@unique([assignmentAt, productId], name: "assignment_product_unique")
}

// SBM - 仕出し弁当管理システム Prisma Schema

model SbmCustomer {
  id              Int     @id @default(autoincrement())
  companyName     String  @db.VarChar(200)
  contactName     String? @db.VarChar(100)
  // phoneNumber     String? @db.VarChar(20) // ユニーク制約を削除、メイン電話番号として残す
  postalCode      String? @db.VarChar(10)
  prefecture      String? @db.VarChar(50) // 都道府県
  city            String? @db.VarChar(100) // 市区町村
  street          String? @db.VarChar(200) // 町名番地
  building        String? @db.VarChar(100) // その他（建物名等）
  email           String? @db.VarChar(255)
  availablePoints Int     @default(0)
  notes           String? @db.Text

  // タイムスタンプ
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // リレーション
  SbmReservation   SbmReservation[]
  SbmCustomerPhone SbmCustomerPhone[]
}

// 顧客電話番号管理
model SbmCustomerPhone {
  id            Int    @id @default(autoincrement())
  sbmCustomerId Int
  label         String @db.VarChar(50) // '自宅', '携帯', '職場', 'FAX', 'その他'
  phoneNumber   String @db.VarChar(20)

  // タイムスタンプ
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // リレーション
  SbmCustomer SbmCustomer @relation(fields: [sbmCustomerId], references: [id], onDelete: Cascade)

  @@unique([sbmCustomerId, phoneNumber]) // 同じ顧客で同じ電話番号は重複不可
}

model SbmProduct {
  id          Int     @id @default(autoincrement())
  name        String  @db.VarChar(200)
  description String? @db.Text

  category String  @db.VarChar(100)
  isActive Boolean @default(true)

  // タイムスタンプ
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // リレーション
  SbmProductPriceHistory SbmProductPriceHistory[]
  SbmReservationItem     SbmReservationItem[]
  SbmProductIngredient   SbmProductIngredient[] // 追加: 材料との関連
}

model SbmProductPriceHistory {
  id Int @id @default(autoincrement())

  price         Int // 価格（円）
  cost          Int // 原価（円）
  effectiveDate DateTime

  // タイムスタンプ
  createdAt DateTime @default(now())

  // リレーション
  SbmProduct   SbmProduct @relation(fields: [sbmProductId], references: [id], onDelete: Cascade)
  sbmProductId Int
}

// 配達グループ
model SbmDeliveryGroup {
  id                    Int                           @id @default(autoincrement())
  name                  String
  deliveryDate          DateTime
  userId                Int
  userName              String
  status                String                        @default("planning") // planning, route_generated, in_progress, completed
  totalReservations     Int                           @default(0)
  completedReservations Int                           @default(0)
  estimatedDuration     Int?
  actualDuration        Int?
  routeUrl              String?
  notes                 String?
  createdAt             DateTime                      @default(now())
  updatedAt             DateTime                      @updatedAt
  optimizedRoute        SbmDeliveryRouteStop[]
  groupReservations     SbmDeliveryGroupReservation[]

  @@map("sbm_delivery_groups")
}

// 配達ルートの停止地点
model SbmDeliveryRouteStop {
  id                 String           @id @default(uuid())
  sbmDeliveryGroupId Int
  sbmReservationId   Int
  customerName       String
  address            String
  lat                Float?
  lng                Float?
  estimatedArrival   DateTime?
  actualArrival      DateTime?
  deliveryOrder      Int
  deliveryCompleted  Boolean          @default(false)
  recoveryCompleted  Boolean          @default(false)
  estimatedDuration  Int
  notes              String?
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt
  SbmDeliveryGroup   SbmDeliveryGroup @relation(fields: [sbmDeliveryGroupId], references: [id], onDelete: Cascade)
  SbmReservation     SbmReservation   @relation(fields: [sbmReservationId], references: [id], onDelete: Cascade)

  @@map("sbm_delivery_route_stops")
}

// 配達グループと予約の紐付け
model SbmDeliveryGroupReservation {
  id                 Int              @id @default(autoincrement())
  sbmDeliveryGroupId Int
  sbmReservationId   Int
  deliveryOrder      Int?
  isCompleted        Boolean          @default(false)
  completedAt        DateTime?
  notes              String?
  createdAt          DateTime         @default(now())
  SbmDeliveryGroup   SbmDeliveryGroup @relation(fields: [sbmDeliveryGroupId], references: [id], onDelete: Cascade)
  SbmReservation     SbmReservation   @relation(fields: [sbmReservationId], references: [id], onDelete: Cascade)

  @@unique([sbmDeliveryGroupId, sbmReservationId])
  @@map("sbm_delivery_group_reservations")
}

model SbmReservation {
  id           Int       @id @default(autoincrement())
  isCanceled   Boolean   @default(false)
  canceledAt   DateTime?
  cancelReason String?

  // 配達関連
  deliveryRouteStops          SbmDeliveryRouteStop[]
  SbmDeliveryGroupReservation SbmDeliveryGroupReservation[]
  sbmCustomerId               Int
  customerName                String                        @db.VarChar(200)
  contactName                 String?                       @db.VarChar(100)
  phoneNumber                 String                        @db.VarChar(20)

  // 配達先住所（5区分）
  postalCode String? @db.VarChar(10)
  prefecture String? @db.VarChar(50) // 都道府県
  city       String? @db.VarChar(100) // 市区町村
  street     String? @db.VarChar(200) // 町名番地
  building   String? @db.VarChar(100) // その他（建物名等）

  // 配達情報
  deliveryDate   DateTime
  pickupLocation String   @db.VarChar(50) // '配達', '店舗受取'

  // 注文情報
  purpose       String @db.VarChar(100) // '会議', '研修', '接待', 'イベント', '懇親会', 'その他'
  paymentMethod String @db.VarChar(50) // '現金', '銀行振込', '請求書', 'クレジットカード'
  orderChannel  String @db.VarChar(50) // '電話', 'FAX', 'メール', 'Web', '営業', 'その他'

  // 金額情報
  totalAmount Int // 合計金額（円）
  pointsUsed  Int @default(0)
  finalAmount Int // 最終金額（円）

  // 管理情報
  orderStaff String  @db.VarChar(100)
  userId     Int?
  notes      String? @db.Text

  // タスク管理
  deliveryCompleted Boolean @default(false)
  recoveryCompleted Boolean @default(false)

  // タイムスタンプ
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // リレーション
  SbmCustomer        SbmCustomer          @relation(fields: [sbmCustomerId], references: [id], onDelete: Restrict)
  User               User?                @relation(fields: [userId], references: [id], onDelete: SetNull)
  SbmReservationItem SbmReservationItem[]

  SbmReservationChangeHistory SbmReservationChangeHistory[]
  SbmDeliveryAssignment       SbmDeliveryAssignment[]
}

model SbmReservationItem {
  id               String @id @default(cuid())
  sbmReservationId Int
  sbmProductId     Int
  productName      String @db.VarChar(200)
  quantity         Int
  unitPrice        Int // 単価（円）
  totalPrice       Int // 小計（円）

  // タイムスタンプ
  createdAt DateTime @default(now())

  // リレーション
  SbmReservation SbmReservation @relation(fields: [sbmReservationId], references: [id], onDelete: Cascade)
  SbmProduct     SbmProduct     @relation(fields: [sbmProductId], references: [id], onDelete: Restrict)
}

model SbmReservationChangeHistory {
  id               String @id @default(cuid())
  sbmReservationId Int

  changeType    String @db.VarChar(50) // 'create', 'update', 'delete'
  changedFields Json? // 変更されたフィールドの詳細
  oldValues     Json? // 変更前の値
  newValues     Json? // 変更後の値

  // タイムスタンプ
  changedAt DateTime @default(now())

  // リレーション
  SbmReservation SbmReservation? @relation(fields: [sbmReservationId], references: [id], onDelete: SetNull)

  userId Int?
  User   User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}

model SbmDeliveryTeam {
  id   Int      @id @default(autoincrement())
  name String   @db.VarChar(100)
  date DateTime

  // タイムスタンプ
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // リレーション
  SbmDeliveryAssignment SbmDeliveryAssignment[]
}

model SbmDeliveryAssignment {
  id                Int      @id @default(autoincrement())
  sbmDeliveryTeamId Int
  sbmReservationId  Int
  assignedBy        String   @db.VarChar(100)
  userId            Int?
  deliveryDate      DateTime
  estimatedDuration Int? // 予想配達時間（分）
  actualDuration    Int? // 実際の配達時間（分）
  route             Json? // 配達ルート情報
  status            String   @default("assigned") @db.VarChar(50) // 'assigned', 'in_progress', 'completed', 'cancelled'

  // タイムスタンプ
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // リレーション
  SbmDeliveryTeam SbmDeliveryTeam @relation(fields: [sbmDeliveryTeamId], references: [id], onDelete: Restrict)
  SbmReservation  SbmReservation  @relation(fields: [sbmReservationId], references: [id], onDelete: Cascade)
  User            User?           @relation(fields: [userId], references: [id], onDelete: SetNull)
}

// 材料マスター
model SbmIngredient {
  id          Int     @id @default(autoincrement())
  name        String  @db.VarChar(200)
  description String? @db.Text
  unit        String  @db.VarChar(50) // 単位（個、g、ml など）

  // タイムスタンプ
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // リレーション
  SbmProductIngredient SbmProductIngredient[]

  @@map("sbm_ingredients")
}

// 商品と材料の関連
model SbmProductIngredient {
  id              Int   @id @default(autoincrement())
  sbmProductId    Int
  sbmIngredientId Int
  quantity        Float // 必要数量

  // タイムスタンプ
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // リレーション
  SbmProduct    SbmProduct    @relation(fields: [sbmProductId], references: [id], onDelete: Cascade)
  SbmIngredient SbmIngredient @relation(fields: [sbmIngredientId], references: [id], onDelete: Restrict)

  @@unique([sbmProductId, sbmIngredientId]) // 同じ商品に同じ材料は一度だけ
  @@map("sbm_product_ingredients")
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Department {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  code  String? @unique
  name  String
  color String?

  User User[]
}

model User {
  id            Int       @id @default(autoincrement())
  code          String?   @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime? @default(now()) @updatedAt()
  sortOrder     Float     @default(0)
  active        Boolean   @default(true)
  hiredAt       DateTime?
  yukyuCategory String?   @default("A")

  name     String
  kana     String?
  email    String? @unique
  password String? @default("999999")

  type String?

  role String @default("user")

  tempResetCode        String?
  tempResetCodeExpired DateTime?
  storeId              Int?
  schoolId             Int?
  rentaStoreId         Int?
  type2                String?
  shopId               Int?
  membershipName       String?
  damageNameMasterId   Int?
  color                String?
  app                  String?
  apps                 String[]

  // tbm

  employeeCode String? @unique
  phone        String?

  familyId Int? // Sara家族ID
  avatar   String? // 子ども用アバター画像URL

  School School? @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  bcc String?

  UserRole UserRole[]

  // TbmOperation                     TbmOperation[]
  // TbmOperationGroup                TbmOperationGroup[]

  TbmBase          TbmBase?           @relation(fields: [tbmBaseId], references: [id])
  tbmBaseId        Int?
  TbmDriveSchedule TbmDriveSchedule[]
  UserWorkStatus   UserWorkStatus[]
  OdometerInput    OdometerInput[]
  TbmRefuelHistory TbmRefuelHistory[]

  TbmCarWashHistory TbmCarWashHistory[]

  KyuyoTableRecord KyuyoTableRecord[]
  Department       Department?        @relation(fields: [departmentId], references: [id])
  departmentId     Int?

  // TbmVehicle           TbmVehicle?
  TbmVehicle            TbmVehicle?             @relation(fields: [tbmVehicleId], references: [id])
  tbmVehicleId          Int?
  SbmReservation        SbmReservation[]
  SbmDeliveryAssignment SbmDeliveryAssignment[]

  // トレーニングアプリ リレーション
  ExerciseMaster              ExerciseMaster[]
  WorkoutLog                  WorkoutLog[]
  SbmReservationChangeHistory SbmReservationChangeHistory[]
  CounselingStore             CounselingStore?              @relation(fields: [counselingStoreId], references: [id])
  counselingStoreId           Int?
  CounselingSlot              CounselingSlot[]
}

model ReleaseNotes {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  rootPath         String
  title            String?
  msg              String
  imgUrl           String?
  confirmedUserIds Int[]
}

model Tokens {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  name      String    @unique
  token     String
  expiresAt DateTime?
}

model GoogleAccessToken {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  email         String    @unique
  access_token  String?
  refresh_token String?
  scope         String?
  token_type    String?
  id_token      String?
  expiry_date   DateTime?
  tokenJSON     String?
}

model RoleMaster {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)

  name        String     @unique
  description String?
  color       String?
  apps        String[]
  UserRole    UserRole[]
}

model UserRole {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)

  User         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId       Int
  RoleMaster   RoleMaster @relation(fields: [roleMasterId], references: [id], onDelete: Cascade)
  roleMasterId Int

  @@unique([userId, roleMasterId], name: "userId_roleMasterId_unique")
}

model ChainMethodLock {
  id        Int       @id @default(autoincrement())
  isLocked  Boolean   @default(false)
  expiresAt DateTime?
  updatedAt DateTime  @updatedAt
}

model Calendar {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  date DateTime @unique

  holidayType String @default("出勤")
}

model StockConfig {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Int       @default(0)

  type  String // 設定の種類（例: "threshold", "period", "macd"）
  name  String // 設定名（例: "上昇閾値", "MACD短期", "RSI期間"）
  value Float // 設定値

  @@unique([type, name], name: "stockConfig_type_name_unique")
}

// 設定例:
// type: "threshold", name: "上昇閾値", value: 5.0
// type: "period", name: "上昇期間", value: 5.0
// type: "period", name: "クラッシュ期間", value: 10.0
// type: "period", name: "短期移動平均", value: 5.0
// type: "period", name: "長期移動平均", value: 25.0
// type: "period", name: "RSI期間", value: 14.0
// type: "threshold", name: "RSI売られすぎ閾値", value: 30.0
// type: "macd", name: "MACD短期", value: 12.0
// type: "macd", name: "MACD長期", value: 26.0
// type: "macd", name: "MACDシグナル", value: 9.0

model Stock {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Int       @default(0)

  favorite        Int?   @default(0)
  heldCount       Int?   @default(0)
  averageBuyPrice Float? @default(0)

  profit Float?

  Code               String    @unique // 証券コード
  Date               DateTime? // 日付
  CompanyName        String? // 会社名
  CompanyNameEnglish String? // 会社名（英語）
  Sector17Code       String? // セクター17コード
  Sector17CodeName   String? // セクター17コード名
  Sector33Code       String? // セクター33コード
  Sector33CodeName   String? // セクター33コード名
  ScaleCategory      String? // スケールカテゴリ
  MarketCode         String? // マーケットコード
  MarketCodeName     String? // マーケットコード名

  last_Date             DateTime?
  last_Open             Int?
  last_High             Int?
  last_Low              Int?
  last_Close            Int?
  last_UpperLimit       String?
  last_LowerLimit       String?
  last_Volume           Int?
  last_TurnoverValue    String?
  last_AdjustmentFactor Int?
  last_AdjustmentOpen   Int?
  last_AdjustmentHigh   Int?
  last_AdjustmentLow    Int?
  last_AdjustmentClose  Int?
  last_AdjustmentVolume Int?

  last_updatedAt DateTime? // 最終更新日

  // last_hasBreakoutHigh        Boolean? // 高値ブレイクアウトm
  // last_hasConsecutiveBullish  Boolean? // 連続上昇
  // last_hasMADeviationRise     Boolean? // 移動平均乖離上昇
  // last_hasVolatilitySpike     Boolean? // ボラティリティスパイク
  // last_hasVolatilitySpikeFall Boolean? // ボラティリティスパイク下降
  // last_hasVolatilitySpikeRise Boolean? // ボラティリティスパイク上昇
  // last_hasVolumeBoostRise     Boolean? // 出来高増加
  // last_hasisSimpleRise        Boolean? // 単純上昇

  last_riseRate                  Int? // 上昇率
  last_josho                     Boolean?
  last_dekidakaJosho             Boolean?
  last_renzokuJosho              Boolean?
  last_takaneBreakout            Boolean?
  last_idoHeikinKairiJosho       Boolean?
  last_spike                     Boolean?
  last_spikeFall                 Boolean?
  last_spikeRise                 Boolean?
  last_recentCrash               Boolean?
  last_goldenCross               Boolean? // ゴールデンクロス
  last_rsiOversold               Boolean? // RSI売られすぎ
  last_crashAndRebound           Boolean? // 急落後リバウンド
  last_consecutivePositiveCloses Boolean? // 連続陽線
  last_macdBullish               Boolean? // MACD強気シグナル

  // 新しく追加したシグナル
  last_volumeBreakout      Boolean? // 出来高ブレイクアウト
  last_priceVolumeBreakout Boolean? // 価格・出来高同時ブレイクアウト
  last_deathCross          Boolean? // デッドクロス
  last_rsiOverbought       Boolean? // RSI買われすぎ
  last_macdBearish         Boolean? // MACD弱気シグナル
  last_lowVolatility       Boolean? // 低ボラティリティ
  last_supportBounce       Boolean? // サポート反発
  last_resistanceBreak     Boolean? // レジスタンス突破

  // MACD値の保存
  last_macdLine      Float? // MACDライン
  last_macdSignal    Float? // MACDシグナルライン
  last_macdHistogram Float? // MACDヒストグラム

  // 移動平均線の最新値
  last_ma5  Float? // 5日移動平均
  last_ma20 Float? // 20日移動平均
  last_ma60 Float? // 60日移動平均

  // RSI最新値
  last_rsi     Float? // RSI値
  StockHistory StockHistory[]
}

model StockHistory {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Int       @default(0)

  // Start of Selection
  Date          DateTime? // 日付
  Code          String? // 証券コード
  Open          Int? // 始値
  High          Int? // 高値
  Low           Int? // 安値
  Close         Int? // 終値
  UpperLimit    String? // 上限
  LowerLimit    String? // 下限
  Volume        Int? // 出来高
  TurnoverValue String? // 売買代金

  AdjustmentFactor Int? // 調整係数
  AdjustmentOpen   Int? // 調整始値
  AdjustmentHigh   Int? // 調整高値
  AdjustmentLow    Int? // 調整安値
  AdjustmentClose  Int? // 調整終値
  AdjustmentVolume Int? // 調整出来高

  riseRate Int? // 上昇率

  // テクニカル指標（履歴保存用）
  josho                     Boolean?
  dekidakaJosho             Boolean?
  renzokuJosho              Boolean?
  takaneBreakout            Boolean?
  idoHeikinKairiJosho       Boolean?
  spike                     Boolean?
  spikeFall                 Boolean?
  spikeRise                 Boolean?
  recentCrash               Boolean?
  goldenCross               Boolean? // ゴールデンクロス
  rsiOversold               Boolean? // RSI売られすぎ
  crashAndRebound           Boolean? // 急落後リバウンド
  consecutivePositiveCloses Boolean? // 連続陽線
  macdBullish               Boolean? // MACD強気シグナル

  // 新しく追加したシグナル（履歴用）
  volumeBreakout      Boolean? // 出来高ブレイクアウト
  priceVolumeBreakout Boolean? // 価格・出来高同時ブレイクアウト
  deathCross          Boolean? // デッドクロス
  rsiOverbought       Boolean? // RSI買われすぎ
  macdBearish         Boolean? // MACD弱気シグナル
  lowVolatility       Boolean? // 低ボラティリティ
  supportBounce       Boolean? // サポート反発
  resistanceBreak     Boolean? // レジスタンス突破

  // MACD値の履歴保存
  macdLine      Float? // MACDライン
  macdSignal    Float? // MACDシグナルライン
  macdHistogram Float? // MACDヒストグラム

  // 移動平均線の値
  ma5  Float? // 5日移動平均
  ma20 Float? // 20日移動平均
  ma60 Float? // 60日移動平均

  // RSI値
  rsi Float? // RSI値

  Stock   Stock @relation(fields: [stockId], references: [id])
  stockId Int

  @@unique([stockId, Date], name: "stockHistory_stockId_Date_unique")
  @@index([Date])
}

model TbmBase {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  code String? @unique
  name String  @unique

  User                 User[]
  TbmVehicle           TbmVehicle[]
  TbmRouteGroup        TbmRouteGroup[]
  TbmDriveSchedule     TbmDriveSchedule[]
  // TbmProduct          TbmProduct[]
  TbmCustomer          TbmCustomer[]
  TbmBase_MonthConfig  TbmBase_MonthConfig[]
  TbmKeihi             TbmKeihi[]
  TbmRouteGroupShare   TbmRouteGroupShare[]
  TbmInvoiceManualEdit TbmInvoiceManualEdit[]
}

model TbmRouteGroupCalendar {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  date        DateTime
  holidayType String?  @default("")
  remark      String?

  TbmRouteGroup   TbmRouteGroup @relation(fields: [tbmRouteGroupId], references: [id], onDelete: Cascade)
  tbmRouteGroupId Int

  @@unique([tbmRouteGroupId, date], name: "unique_tbmRouteGroupId_date")
}

model TbmKeihi {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)
  item      String?
  amount    Float?
  date      DateTime?
  remark    String?

  TbmBase   TbmBase @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
  tbmBaseId Int
}

model TbmDriveScheduleImage {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  imageUrl String

  TbmDriveSchedule   TbmDriveSchedule? @relation(fields: [tbmDriveScheduleId], references: [id])
  tbmDriveScheduleId Int?
}

model TbmBase_MonthConfig {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  code      String?
  yearMonth DateTime

  keiyuPerLiter    Float?
  gasolinePerLiter Float?

  TbmBase   TbmBase @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
  tbmBaseId Int

  @@unique([tbmBaseId, yearMonth], name: "unique_tbmBaseId_yearMonth")
}

model TbmVehicle {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  code String? @unique

  name          String?
  frameNo       String? @unique
  vehicleNumber String  @unique
  type          String?
  shape         String?
  airSuspension String?
  oilTireParts  String?
  maintenance   String?
  insurance     String?

  shodoTorokubi DateTime?
  sakenManryobi DateTime?
  hokenManryobi DateTime?

  sankagetsuTenkenbi DateTime?
  sokoKyori          Float?

  // 保険情報
  jibaisekiHokenCompany String? // 自賠責保険会社
  jibaisekiManryobi     DateTime? // 自賠責満期日

  jidoshaHokenCompany String? // 自動車保険会社（対人、対物）
  jidoshaManryobi     DateTime? // 自動車保険満期日

  kamotsuHokenCompany String? // 貨物保険会社
  kamotsuManryobi     DateTime? // 貨物保険満期日

  sharyoHokenCompany String? // 車両保険会社
  sharyoManryobi     DateTime? // 車両保険満期日

  // ETCカード情報
  etcCardNumber     String? // ETCカード番号
  etcCardExpiration DateTime? // ETCカード有効期限

  TbmFuelCard TbmFuelCard[]

  TbmRefuelHistory  TbmRefuelHistory[]
  TbmBase           TbmBase             @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
  tbmBaseId         Int
  TbmDriveSchedule  TbmDriveSchedule[]
  OdometerInput     OdometerInput[]
  TbmCarWashHistory TbmCarWashHistory[]

  // User   User? @relation(fields: [userId], references: [id])
  // userId Int?  @unique

  TbmVehicleMaintenanceRecord TbmVehicleMaintenanceRecord[]
  TbmEtcMeisai                TbmEtcMeisai[]
  EtcCsvRaw                   EtcCsvRaw[]
  User                        User[]

  @@unique([tbmBaseId, vehicleNumber], name: "unique_tbmBaseId_vehicleNumber")
}

model TbmFuelCard {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  name      String
  startDate DateTime @default(now())
  endDate   DateTime @default(now())

  TbmVehicle   TbmVehicle? @relation(fields: [tbmVehicleId], references: [id])
  tbmVehicleId Int?
}

// 1台ごとに、「日付、件名、金額、依頼先、備考」からなる整備記録の履歴を管理可能
model TbmVehicleMaintenanceRecord {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  date       DateTime //日付
  title      String // 件名
  price      Float // 金額
  contractor String? // 依頼先事業者
  remark     String? // 備考
  type       String? // 3ヶ月点検・車検・その他

  TbmVehicle   TbmVehicle? @relation(fields: [tbmVehicleId], references: [id])
  tbmVehicleId Int?
}

model TbmRouteGroup {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  code      String? @unique
  name      String
  routeName String?

  serviceNumber    String? // 服務番号
  departureTime    String? // 出発時刻（4桁文字列: HHMM）
  finalArrivalTime String? // 最終到着時刻（4桁文字列: HHMM）
  allowDuplicate   Boolean @default(false) // 重複許可

  pickupTime  String? //接車時間
  vehicleType String? //車z種

  productName String?

  seikyuKbn String? @default("01")

  // 便共有機能のためのフィールド
  isShared Boolean @default(false) // この便が共有されているかどうか

  TbmBase   TbmBase @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
  tbmBaseId Int

  TbmDriveSchedule TbmDriveSchedule[]

  TbmMonthlyConfigForRouteGroup TbmMonthlyConfigForRouteGroup[]
  // Mid_TbmRouteGroup_TbmProduct  Mid_TbmRouteGroup_TbmProduct?

  Mid_TbmRouteGroup_TbmCustomer Mid_TbmRouteGroup_TbmCustomer?
  TbmRouteGroupCalendar         TbmRouteGroupCalendar[]

  TbmRouteGroupFee   TbmRouteGroupFee[]
  TbmRouteGroupShare TbmRouteGroupShare[]

  @@unique([tbmBaseId, code], name: "unique_tbmBaseId_code")
}

model TbmRouteGroupFee {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  startDate DateTime

  driverFee Int?
  futaiFee  Int?

  TbmRouteGroup   TbmRouteGroup @relation(fields: [tbmRouteGroupId], references: [id], onDelete: Cascade)
  tbmRouteGroupId Int
}

model TbmMonthlyConfigForRouteGroup {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  yearMonth DateTime

  generalFee         Int? //通行量（一般）[]
  tsukoryoSeikyuGaku Int? //通行料請求額
  seikyuKaisu        Int? //請求回数

  numberOfTrips   Int?
  TbmRouteGroup   TbmRouteGroup @relation(fields: [tbmRouteGroupId], references: [id], onDelete: Cascade)
  tbmRouteGroupId Int

  @@unique([yearMonth, tbmRouteGroupId], name: "unique_yearMonth_tbmRouteGroupId")
}

// model TbmProduct {
//  id                           Int                            @id @default(autoincrement())
//  createdAt                    DateTime                       @default(now())
//  updatedAt                    DateTime?                      @default(now()) @updatedAt()
//  sortOrder                    Float                          @default(0)
//  code                         String                         @unique
//  name                         String                         @unique
//  Mid_TbmRouteGroup_TbmProduct Mid_TbmRouteGroup_TbmProduct[]
//  TbmBase                      TbmBase                        @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
//  tbmBaseId                    Int

//  @@unique([tbmBaseId, name], name: "unique_tbmBaseId_name")
// }

// model Mid_TbmRouteGroup_TbmProduct {
//  id        Int       @id @default(autoincrement())
//  createdAt DateTime  @default(now())
//  updatedAt DateTime? @default(now()) @updatedAt()
//  sortOrder Float     @default(0)

// TbmRouteGroup   TbmRouteGroup @relation(fields: [tbmRouteGroupId], references: [id], onDelete: Cascade)
//  tbmRouteGroupId Int           @unique

//  TbmProduct   TbmProduct @relation(fields: [tbmProductId], references: [id], onDelete: Cascade)
//  tbmProductId Int

//  @@unique([tbmRouteGroupId, tbmProductId], name: "unique_tbmRouteGroupId_tbmProductId")
// }

model Mid_TbmRouteGroup_TbmCustomer {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  TbmRouteGroup   TbmRouteGroup @relation(fields: [tbmRouteGroupId], references: [id], onDelete: Cascade)
  tbmRouteGroupId Int           @unique

  TbmCustomer   TbmCustomer @relation(fields: [tbmCustomerId], references: [id], onDelete: Cascade)
  tbmCustomerId Int

  @@unique([tbmRouteGroupId, tbmCustomerId], name: "unique_tbmRouteGroupId_tbmCustomerId")
}

model TbmBillingAddress {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  name String
}

model TbmInvoiceDetail {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  numberOfTrips   Int
  fare            Float
  toll            Float
  specialAddition Float? // 特別付加金
}

model TbmCustomer {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  code                          String?                         @unique
  name                          String                          @unique
  address                       String?
  phoneNumber                   String?
  faxNumber                     String?
  bankInformation               String?
  Mid_TbmRouteGroup_TbmCustomer Mid_TbmRouteGroup_TbmCustomer[]
  TbmInvoiceManualEdit          TbmInvoiceManualEdit[]

  TbmBase   TbmBase? @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
  tbmBaseId Int?

  @@unique([tbmBaseId, name], name: "unique_tbmBaseId_name")
}

model TbmInvoiceManualEdit {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  yearMonth DateTime // 請求対象月

  summary Json? // 手動編集されたサマリー (CategorySummary[])
  details Json? // 手動編集された明細 (CategoryDetail[])

  TbmBase   TbmBase? @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
  tbmBaseId Int?

  TbmCustomer   TbmCustomer @relation(fields: [tbmCustomerId], references: [id], onDelete: Cascade)
  tbmCustomerId Int

  @@unique([tbmCustomerId, yearMonth], name: "unique_tbmCustomerId_yearMonth")
}

model TbmRefuelHistory {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  date     DateTime
  amount   Float
  odometer Float
  type     String

  // TbmOperationGroup TbmOperationGroup? @relation(fields: [tbmOperationGroupId], references: [id], onDelete: Cascade)
  // tbmOperationGroupId Int?

  TbmVehicle   TbmVehicle @relation(fields: [tbmVehicleId], references: [id], onDelete: Cascade)
  tbmVehicleId Int

  User   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId Int
}

model TbmCarWashHistory {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  date  DateTime
  price Float

  TbmVehicle   TbmVehicle @relation(fields: [tbmVehicleId], references: [id], onDelete: Cascade)
  tbmVehicleId Int

  User   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId Int
}

model TbmDriveSchedule {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  date                DateTime
  remark              String? // 配車カード備考
  M_postalHighwayFee  Int? //高速(郵便)
  O_generalHighwayFee Int? //高速（一般）

  User   User? @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId Int?

  TbmVehicle   TbmVehicle? @relation(fields: [tbmVehicleId], references: [id], onDelete: Cascade)
  tbmVehicleId Int?

  TbmRouteGroup   TbmRouteGroup @relation(fields: [tbmRouteGroupId], references: [id], onDelete: Cascade)
  tbmRouteGroupId Int

  finished  Boolean? @default(false)
  confirmed Boolean? @default(false)
  approved  Boolean? @default(false)

  TbmBase   TbmBase @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
  tbmBaseId Int

  // 1対多の関係に変更
  TbmEtcMeisai          TbmEtcMeisai[]
  TbmDriveScheduleImage TbmDriveScheduleImage[]
}

model TbmEtcMeisai {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  groupIndex Int
  month      DateTime

  info Json[]

  sum Float

  TbmVehicle   TbmVehicle? @relation(fields: [tbmVehicleId], references: [id], onDelete: Cascade)
  tbmVehicleId Int?

  // 1対多の関係に変更
  TbmDriveSchedule   TbmDriveSchedule? @relation(fields: [tbmDriveScheduleId], references: [id], onDelete: Cascade)
  tbmDriveScheduleId Int?

  EtcCsvRaw EtcCsvRaw[]

  @@index([tbmVehicleId])
}

model EtcCsvRaw {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  // 利用年月日（自）と時分（自）
  fromDate DateTime
  fromTime String

  // 利用年月日（至）と時分（至）
  toDate DateTime
  toTime String

  // 利用IC
  fromIc String
  toIc   String

  // 料金情報
  originalFee    Float? // 割引前料金
  discountAmount Float? // ETC割引額
  fee            Float // 通行料金
  totalAmount    Float? // 合計金額

  // グルーピングフラグ
  isGrouped Boolean @default(false)

  remark     String? // 備考
  cardNumber String? // ETCカード番号
  carType    String? // 車種

  // 関連
  TbmVehicle   TbmVehicle @relation(fields: [tbmVehicleId], references: [id], onDelete: Cascade)
  tbmVehicleId Int

  // グルーピングされた場合の関連
  TbmEtcMeisai   TbmEtcMeisai? @relation(fields: [tbmEtcMeisaiId], references: [id])
  tbmEtcMeisaiId Int?

  @@unique([tbmVehicleId, fromDate, fromTime], name: "unique_tbmVehicleId_fromDate_fromTime")
  @@index([tbmVehicleId])
}

model OdometerInput {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  odometerStart Float
  odometerEnd   Float
  date          DateTime

  TbmVehicle   TbmVehicle @relation(fields: [tbmVehicleId], references: [id], onDelete: Cascade)
  tbmVehicleId Int

  User   User @relation(fields: [userId], references: [id])
  userId Int

  @@unique([tbmVehicleId, date], name: "unique_tbmVehicleId_date")
}

model UserWorkStatus {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  date       DateTime
  workStatus String?
  remark     String?

  // 時間データ（分単位で保存）
  vehicleNumber    String?
  startTime        String?
  endTime          String?
  kyukeiMins       String?
  shinyaKyukeiMins String?
  kyusokuMins      String?

  User   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId Int

  @@unique([userId, date], name: "unique_userId_date")
}

model KyuyoTableRecord {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  other1      Float?
  other2      Float?
  shokuhi     Float?
  maebaraikin Float?
  rate        Float? @default(0.5)

  yearMonth DateTime
  User      User     @relation(fields: [userId], references: [id])
  userId    Int

  @@unique([userId, yearMonth], name: "unique_userId_yearMonth")
}

// 便共有機能のためのテーブル
model TbmRouteGroupShare {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  // 共有元の便
  TbmRouteGroup   TbmRouteGroup @relation(fields: [tbmRouteGroupId], references: [id], onDelete: Cascade)
  tbmRouteGroupId Int

  // 共有先の営業所
  TbmBase   TbmBase @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
  tbmBaseId Int

  // 共有状態のフラグ（将来的に承認プロセスなどを追加する場合に使用）
  isActive Boolean @default(true)

  @@unique([tbmRouteGroupId, tbmBaseId], name: "unique_tbmRouteGroupId_tbmBaseId")
}

model TeamSynapseAnalysis {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()

  // ユーザー情報
  userId    Int?
  userEmail String?   // Google認証時のメールアドレス

  // 入力設定内容（連携サービスとパラメータ）
  enabledServices Json // ServiceType[]: ['gmail', 'chat', 'drive']

  // Gmail設定
  gmailTargetEmails Json // string[]
  gmailDateFrom     DateTime?
  gmailDateTo       DateTime?

  // Chat設定
  chatRoomId   String?
  chatDateFrom DateTime?
  chatDateTo   DateTime?

  // Drive設定
  driveFolderUrl String?

  // AI分析結果（JSON）
  analysisResult Json // AnalysisResult型のJSON

  @@index([userId])
  @@index([createdAt])
}





















// トレーニング記録アプリ用スキーマ
// プロジェクトルール準拠：リレーション名は対象テーブルと同一、大文字で開始
// 外部キーは小文字で開始、{modelName}Id
// 日付データは at をつける

model ExerciseMaster {
 id        Int      @id @default(autoincrement())
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
 sortOrder Int      @default(0)

 part  String // 部位（胸、背中、肩、腕、足、有酸素など）
 name  String // 種目名
 unit  String // 強度単位（kg、lb、minなど）
 color String? // 色（#000000）

 // リレーション名は対象テーブルと同一、大文字で開始
 User       User         @relation(fields: [userId], references: [id])
 userId     Int // ユーザーID（外部キー）
 WorkoutLog WorkoutLog[]
}

model WorkoutLog {
 id        Int      @id @default(autoincrement())
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
 sortOrder Int      @default(0)

 userId     Int // ユーザーID（外部キー）
 exerciseId Int // 外部キーは小文字で開始、{modelName}Id
 date       DateTime // 日付データは at をつける
 strength   Int // 強度
 reps       Int // 回数

 // リレーション名は対象テーブルと同一、大文字で開始
 User           User           @relation(fields: [userId], references: [id])
 ExerciseMaster ExerciseMaster @relation(fields: [exerciseId], references: [id])
}


`;

export const prismaDMMF = {
  "enums": [],
  "models": [
    {
      "name": "KaizenClient",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "organization",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "iconUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "bannerUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "website",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "note",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "public",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "introductionRequestedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KaizenWork",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KaizenWork",
          "nativeType": null,
          "relationName": "KaizenClientToKaizenWork",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KaizenReview",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KaizenReview",
          "nativeType": null,
          "relationName": "KaizenClientToKaizenReview",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "name",
          "organization"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_name_organization",
          "fields": [
            "name",
            "organization"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "KaizenReview",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "username",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "review",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "platform",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KaizenClient",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KaizenClient",
          "nativeType": null,
          "relationName": "KaizenClientToKaizenReview",
          "relationFromFields": [
            "kaizenClientId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kaizenClientId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KaizenWork",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "uuid",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": {
            "name": "uuid",
            "args": [
              4
            ]
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "title",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "subtitle",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "points",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "clientName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "organization",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dealPoint",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "toolPoint",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "impression",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "reply",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "jobCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "systemCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "collaborationTool",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KaizenWorkImage",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KaizenWorkImage",
          "nativeType": null,
          "relationName": "KaizenWorkToKaizenWorkImage",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "showName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KaizenClient",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KaizenClient",
          "nativeType": null,
          "relationName": "KaizenClientToKaizenWork",
          "relationFromFields": [
            "kaizenClientId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kaizenClientId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "allowShowClient",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isPublic",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "correctionRequest",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "title",
          "subtitle"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_title_subtitle",
          "fields": [
            "title",
            "subtitle"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "KaizenWorkImage",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "url",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KaizenWork",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KaizenWork",
          "nativeType": null,
          "relationName": "KaizenWorkToKaizenWorkImage",
          "relationFromFields": [
            "kaizenWorkId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kaizenWorkId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KaizenCMS",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contactPageMsg",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "principlePageMsg",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CounselingStore",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Room",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingRoom",
          "nativeType": null,
          "relationName": "CounselingRoomToCounselingStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "CounselingStoreToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingSlot",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingSlot",
          "nativeType": null,
          "relationName": "CounselingSlotToCounselingStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CounselingRoom",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "counselingStoreId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingStore",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingStore",
          "nativeType": null,
          "relationName": "CounselingRoomToCounselingStore",
          "relationFromFields": [
            "counselingStoreId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingSlot",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingSlot",
          "nativeType": null,
          "relationName": "CounselingRoomToCounselingSlot",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CounselingClient",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "furigana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "phone",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gender",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "age",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "prefecture",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingReservation",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingReservation",
          "nativeType": null,
          "relationName": "CounselingClientToCounselingReservation",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CounselingReservation",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "preferredDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "visitorType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "topics",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "paymentMethod",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contactMethod",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingClient",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingClient",
          "nativeType": null,
          "relationName": "CounselingClientToCounselingReservation",
          "relationFromFields": [
            "counselingClientId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "counselingClientId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingSlot",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingSlot",
          "nativeType": null,
          "relationName": "CounselingReservationToCounselingSlot",
          "relationFromFields": [
            "counselingSlotId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "SetNull",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "counselingSlotId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CounselingSlot",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "startAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "endAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingRoom",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingRoom",
          "nativeType": null,
          "relationName": "CounselingRoomToCounselingSlot",
          "relationFromFields": [
            "counselingRoomId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "counselingRoomId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingStore",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingStore",
          "nativeType": null,
          "relationName": "CounselingSlotToCounselingStore",
          "relationFromFields": [
            "counselingStoreId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "counselingStoreId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "CounselingSlotToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "SetNull",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingReservation",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingReservation",
          "nativeType": null,
          "relationName": "CounselingReservationToCounselingSlot",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "School",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Classroom",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Classroom",
          "nativeType": null,
          "relationName": "ClassroomToSchool",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Game",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Game",
          "nativeType": null,
          "relationName": "GameToSchool",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Student",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Student",
          "nativeType": null,
          "relationName": "SchoolToStudent",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SubjectNameMaster",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SubjectNameMaster",
          "nativeType": null,
          "relationName": "SchoolToSubjectNameMaster",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Teacher",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Teacher",
          "nativeType": null,
          "relationName": "SchoolToTeacher",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "SchoolToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "LearningRoleMasterOnGame",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "maxCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Game",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Game",
          "nativeType": null,
          "relationName": "GameToLearningRoleMasterOnGame",
          "relationFromFields": [
            "gameId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gameId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "StudentRole",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "StudentRole",
          "nativeType": null,
          "relationName": "LearningRoleMasterOnGameToStudentRole",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SubjectNameMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "schoolId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Game",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Game",
          "nativeType": null,
          "relationName": "GameToSubjectNameMaster",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "School",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "School",
          "nativeType": null,
          "relationName": "SchoolToSubjectNameMaster",
          "relationFromFields": [
            "schoolId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Teacher",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "schoolId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "password",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "role",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tempResetCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tempResetCodeExpired",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Game",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Game",
          "nativeType": null,
          "relationName": "GameToTeacher",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "School",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "School",
          "nativeType": null,
          "relationName": "SchoolToTeacher",
          "relationFromFields": [
            "schoolId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TeacherClass",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TeacherClass",
          "nativeType": null,
          "relationName": "TeacherToTeacherClass",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Student",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gender",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "attendanceNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "schoolId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "classroomId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Answer",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Answer",
          "nativeType": null,
          "relationName": "AnswerToStudent",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Classroom",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Classroom",
          "nativeType": null,
          "relationName": "ClassroomToStudent",
          "relationFromFields": [
            "classroomId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "School",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "School",
          "nativeType": null,
          "relationName": "SchoolToStudent",
          "relationFromFields": [
            "schoolId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Squad",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Squad",
          "nativeType": null,
          "relationName": "SquadToStudent",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UnfitFellow",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UnfitFellow",
          "nativeType": null,
          "relationName": "StudentToUnfitFellow",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "GameStudent",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "GameStudent",
          "nativeType": null,
          "relationName": "GameStudentToStudent",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "StudentRole",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "StudentRole",
          "nativeType": null,
          "relationName": "StudentToStudentRole",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SlideAnswer",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SlideAnswer",
          "nativeType": null,
          "relationName": "SlideAnswerToStudent",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "schoolId",
          "classroomId",
          "attendanceNumber"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_schoolId_classroomId_attendanceNumber",
          "fields": [
            "schoolId",
            "classroomId",
            "attendanceNumber"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "UnfitFellow",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Student",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Student",
          "nativeType": null,
          "relationName": "StudentToUnfitFellow",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Classroom",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "grade",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "class",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "schoolId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "School",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "School",
          "nativeType": null,
          "relationName": "ClassroomToSchool",
          "relationFromFields": [
            "schoolId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Student",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Student",
          "nativeType": null,
          "relationName": "ClassroomToStudent",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TeacherClass",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TeacherClass",
          "nativeType": null,
          "relationName": "ClassroomToTeacherClass",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "schoolId",
          "grade",
          "class"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_schoolId_grade_class",
          "fields": [
            "schoolId",
            "grade",
            "class"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "TeacherClass",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "teacherId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "classroomId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Classroom",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Classroom",
          "nativeType": null,
          "relationName": "ClassroomToTeacherClass",
          "relationFromFields": [
            "classroomId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Teacher",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Teacher",
          "nativeType": null,
          "relationName": "TeacherToTeacherClass",
          "relationFromFields": [
            "teacherId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "teacherId",
          "classroomId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_teacherId_classroomId",
          "fields": [
            "teacherId",
            "classroomId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "GameStudent",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "gameId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "studentId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Game",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Game",
          "nativeType": null,
          "relationName": "GameToGameStudent",
          "relationFromFields": [
            "gameId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Student",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Student",
          "nativeType": null,
          "relationName": "GameStudentToStudent",
          "relationFromFields": [
            "studentId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "gameId",
          "studentId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_gameId_studentId",
          "fields": [
            "gameId",
            "studentId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "Game",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "secretKey",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "absentStudentIds",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "schoolId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "teacherId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "subjectNameMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "activeGroupId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "activeQuestionPromptId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "nthTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "randomTargetStudentIds",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "learningContent",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "task",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "currentSlideId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Answer",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Answer",
          "nativeType": null,
          "relationName": "AnswerToGame",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "School",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "School",
          "nativeType": null,
          "relationName": "GameToSchool",
          "relationFromFields": [
            "schoolId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SubjectNameMaster",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SubjectNameMaster",
          "nativeType": null,
          "relationName": "GameToSubjectNameMaster",
          "relationFromFields": [
            "subjectNameMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Teacher",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Teacher",
          "nativeType": null,
          "relationName": "GameToTeacher",
          "relationFromFields": [
            "teacherId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Group",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Group",
          "nativeType": null,
          "relationName": "GameToGroup",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "QuestionPrompt",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "QuestionPrompt",
          "nativeType": null,
          "relationName": "GameToQuestionPrompt",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "GameStudent",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "GameStudent",
          "nativeType": null,
          "relationName": "GameToGameStudent",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "LearningRoleMasterOnGame",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "LearningRoleMasterOnGame",
          "nativeType": null,
          "relationName": "GameToLearningRoleMasterOnGame",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "GroupCreateConfig",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "GroupCreateConfig",
          "nativeType": null,
          "relationName": "GameToGroupCreateConfig",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Slide",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Slide",
          "nativeType": null,
          "relationName": "GameToSlide",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SlideAnswer",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SlideAnswer",
          "nativeType": null,
          "relationName": "GameToSlideAnswer",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "GroupCreateConfig",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "groupCreationMode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "count",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "criteria",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "genderConfig",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Game",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Game",
          "nativeType": null,
          "relationName": "GameToGroupCreateConfig",
          "relationFromFields": [
            "gameId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gameId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Group",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isSaved",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Game",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Game",
          "nativeType": null,
          "relationName": "GameToGroup",
          "relationFromFields": [
            "gameId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Squad",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Squad",
          "nativeType": null,
          "relationName": "GroupToSquad",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "QuestionPrompt",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "QuestionPrompt",
          "nativeType": null,
          "relationName": "GroupToQuestionPrompt",
          "relationFromFields": [
            "questionPromptId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gameId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "questionPromptId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Squad",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "groupId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Group",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Group",
          "nativeType": null,
          "relationName": "GroupToSquad",
          "relationFromFields": [
            "groupId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Student",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Student",
          "nativeType": null,
          "relationName": "SquadToStudent",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "StudentRole",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "StudentRole",
          "nativeType": null,
          "relationName": "SquadToStudentRole",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "StudentRole",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Squad",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Squad",
          "nativeType": null,
          "relationName": "SquadToStudentRole",
          "relationFromFields": [
            "squadId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Student",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Student",
          "nativeType": null,
          "relationName": "StudentToStudentRole",
          "relationFromFields": [
            "studentId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "LearningRoleMasterOnGame",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "LearningRoleMasterOnGame",
          "nativeType": null,
          "relationName": "LearningRoleMasterOnGameToStudentRole",
          "relationFromFields": [
            "learningRoleMasterOnGameId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "studentId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "learningRoleMasterOnGameId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "squadId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "QuestionPrompt",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gameId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "asSummary",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Answer",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Answer",
          "nativeType": null,
          "relationName": "AnswerToQuestionPrompt",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Group",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Group",
          "nativeType": null,
          "relationName": "GroupToQuestionPrompt",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Game",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Game",
          "nativeType": null,
          "relationName": "GameToQuestionPrompt",
          "relationFromFields": [
            "gameId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Answer",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "curiocity1",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "curiocity2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "curiocity3",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "curiocity4",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "curiocity5",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "efficacy1",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "efficacy2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "efficacy3",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "efficacy4",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "efficacy5",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "impression",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gameId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "studentId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "questionPromptId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "asSummary",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lessonImpression",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lessonSatisfaction",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Game",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Game",
          "nativeType": null,
          "relationName": "AnswerToGame",
          "relationFromFields": [
            "gameId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "QuestionPrompt",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "QuestionPrompt",
          "nativeType": null,
          "relationName": "AnswerToQuestionPrompt",
          "relationFromFields": [
            "questionPromptId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Student",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Student",
          "nativeType": null,
          "relationName": "AnswerToStudent",
          "relationFromFields": [
            "studentId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "gameId",
          "studentId",
          "questionPromptId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_gameId_studentId_questionPromptId",
          "fields": [
            "gameId",
            "studentId",
            "questionPromptId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "Slide",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gameId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "templateType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contentData",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Game",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Game",
          "nativeType": null,
          "relationName": "GameToSlide",
          "relationFromFields": [
            "gameId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SlideAnswer",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SlideAnswer",
          "nativeType": null,
          "relationName": "SlideToSlideAnswer",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SlideAnswer",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "slideId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "studentId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gameId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "answerData",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isShared",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isAnonymous",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Slide",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Slide",
          "nativeType": null,
          "relationName": "SlideToSlideAnswer",
          "relationFromFields": [
            "slideId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Student",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Student",
          "nativeType": null,
          "relationName": "SlideAnswerToStudent",
          "relationFromFields": [
            "studentId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Game",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Game",
          "nativeType": null,
          "relationName": "GameToSlideAnswer",
          "relationFromFields": [
            "gameId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "slideId",
          "studentId",
          "gameId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "slideId",
            "studentId",
            "gameId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "KeihiExpense",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": {
            "name": "cuid",
            "args": [
              1
            ]
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "amount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "counterparty",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "participants",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "conversationPurpose",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "keywords",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "summary",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "conversationSummary",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "insight",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "autoTags",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "未設定",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mfSubject",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mfSubAccount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mfTaxCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mfDepartment",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KeihiAttachment",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KeihiAttachment",
          "nativeType": null,
          "relationName": "KeihiAttachmentToKeihiExpense",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KeihiAttachment",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": {
            "name": "cuid",
            "args": [
              1
            ]
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "filename",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "originalName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mimeType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "size",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "url",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "keihiExpenseId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KeihiExpense",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KeihiExpense",
          "nativeType": null,
          "relationName": "KeihiAttachmentToKeihiExpense",
          "relationFromFields": [
            "keihiExpenseId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KeihiAccountMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": {
            "name": "cuid",
            "args": [
              1
            ]
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "category",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "classification",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "balanceSheet",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "account",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "subAccount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "taxCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "searchKey",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isActive",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KeihiOptionMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": {
            "name": "cuid",
            "args": [
              1
            ]
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "category",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "value",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "label",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isActive",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "category",
          "value"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "category_value_unique",
          "fields": [
            "category",
            "value"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "Product",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cost",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productionCapacity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "allowanceStock",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ProductRecipe",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ProductRecipe",
          "nativeType": null,
          "relationName": "ProductToProductRecipe",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Order",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Order",
          "nativeType": null,
          "relationName": "OrderToProduct",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Production",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Production",
          "nativeType": null,
          "relationName": "ProductToProduction",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Shipment",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Shipment",
          "nativeType": null,
          "relationName": "ProductToShipment",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DailyStaffAssignment",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DailyStaffAssignment",
          "nativeType": null,
          "relationName": "DailyStaffAssignmentToProduct",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RawMaterial",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "category",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unit",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cost",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "safetyStock",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ProductRecipe",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ProductRecipe",
          "nativeType": null,
          "relationName": "ProductRecipeToRawMaterial",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "StockAdjustment",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "StockAdjustment",
          "nativeType": null,
          "relationName": "RawMaterialToStockAdjustment",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "ProductRecipe",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rawMaterialId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "amount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Product",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Product",
          "nativeType": null,
          "relationName": "ProductToProductRecipe",
          "relationFromFields": [
            "productId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RawMaterial",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RawMaterial",
          "nativeType": null,
          "relationName": "ProductRecipeToRawMaterial",
          "relationFromFields": [
            "rawMaterialId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "productId",
          "rawMaterialId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "product_rawMaterial_unique",
          "fields": [
            "productId",
            "rawMaterialId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "Order",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "amount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "note",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Product",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Product",
          "nativeType": null,
          "relationName": "OrderToProduct",
          "relationFromFields": [
            "productId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Production",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productionAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "note",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Product",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Product",
          "nativeType": null,
          "relationName": "ProductToProduction",
          "relationFromFields": [
            "productId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Shipment",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "shipmentId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "shipmentAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "note",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Product",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Product",
          "nativeType": null,
          "relationName": "ProductToShipment",
          "relationFromFields": [
            "productId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "StockAdjustment",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rawMaterialId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "adjustmentAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "reason",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RawMaterial",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RawMaterial",
          "nativeType": null,
          "relationName": "RawMaterialToStockAdjustment",
          "relationFromFields": [
            "rawMaterialId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CompanyHoliday",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "holidayAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "holidayType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "休日",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "note",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "DailyStaffAssignment",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assignmentAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "staffCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 3,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Product",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Product",
          "nativeType": null,
          "relationName": "DailyStaffAssignmentToProduct",
          "relationFromFields": [
            "productId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "assignmentAt",
          "productId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "assignment_product_unique",
          "fields": [
            "assignmentAt",
            "productId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "SbmCustomer",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "companyName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contactName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "postalCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "10"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "prefecture",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "city",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "street",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "building",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "255"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "availablePoints",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmReservation",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservation",
          "nativeType": null,
          "relationName": "SbmCustomerToSbmReservation",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmCustomerPhone",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmCustomerPhone",
          "nativeType": null,
          "relationName": "SbmCustomerToSbmCustomerPhone",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmCustomerPhone",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmCustomerId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "label",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "phoneNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmCustomer",
          "nativeType": null,
          "relationName": "SbmCustomerToSbmCustomerPhone",
          "relationFromFields": [
            "sbmCustomerId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "sbmCustomerId",
          "phoneNumber"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "sbmCustomerId",
            "phoneNumber"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "SbmProduct",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "category",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isActive",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmProductPriceHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmProductPriceHistory",
          "nativeType": null,
          "relationName": "SbmProductToSbmProductPriceHistory",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservationItem",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservationItem",
          "nativeType": null,
          "relationName": "SbmProductToSbmReservationItem",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmProductIngredient",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmProductIngredient",
          "nativeType": null,
          "relationName": "SbmProductToSbmProductIngredient",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmProductPriceHistory",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "price",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cost",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "effectiveDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmProduct",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmProduct",
          "nativeType": null,
          "relationName": "SbmProductToSbmProductPriceHistory",
          "relationFromFields": [
            "sbmProductId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmProductId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmDeliveryGroup",
      "dbName": "sbm_delivery_groups",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "planning",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalReservations",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "completedReservations",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "estimatedDuration",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "actualDuration",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "routeUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "optimizedRoute",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryRouteStop",
          "nativeType": null,
          "relationName": "SbmDeliveryGroupToSbmDeliveryRouteStop",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "groupReservations",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryGroupReservation",
          "nativeType": null,
          "relationName": "SbmDeliveryGroupToSbmDeliveryGroupReservation",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmDeliveryRouteStop",
      "dbName": "sbm_delivery_route_stops",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": {
            "name": "uuid",
            "args": [
              4
            ]
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmDeliveryGroupId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmReservationId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "customerName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lat",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lng",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "estimatedArrival",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "actualArrival",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryCompleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "recoveryCompleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "estimatedDuration",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmDeliveryGroup",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryGroup",
          "nativeType": null,
          "relationName": "SbmDeliveryGroupToSbmDeliveryRouteStop",
          "relationFromFields": [
            "sbmDeliveryGroupId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservation",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservation",
          "nativeType": null,
          "relationName": "SbmDeliveryRouteStopToSbmReservation",
          "relationFromFields": [
            "sbmReservationId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmDeliveryGroupReservation",
      "dbName": "sbm_delivery_group_reservations",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmDeliveryGroupId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmReservationId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isCompleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "completedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmDeliveryGroup",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryGroup",
          "nativeType": null,
          "relationName": "SbmDeliveryGroupToSbmDeliveryGroupReservation",
          "relationFromFields": [
            "sbmDeliveryGroupId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservation",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservation",
          "nativeType": null,
          "relationName": "SbmDeliveryGroupReservationToSbmReservation",
          "relationFromFields": [
            "sbmReservationId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "sbmDeliveryGroupId",
          "sbmReservationId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "sbmDeliveryGroupId",
            "sbmReservationId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "SbmReservation",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isCanceled",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "canceledAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cancelReason",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryRouteStops",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryRouteStop",
          "nativeType": null,
          "relationName": "SbmDeliveryRouteStopToSbmReservation",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmDeliveryGroupReservation",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryGroupReservation",
          "nativeType": null,
          "relationName": "SbmDeliveryGroupReservationToSbmReservation",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmCustomerId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "customerName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contactName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "phoneNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "postalCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "10"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "prefecture",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "city",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "street",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "building",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pickupLocation",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "purpose",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "paymentMethod",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderChannel",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalAmount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pointsUsed",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "finalAmount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderStaff",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryCompleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "recoveryCompleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmCustomer",
          "nativeType": null,
          "relationName": "SbmCustomerToSbmReservation",
          "relationFromFields": [
            "sbmCustomerId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Restrict",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "SbmReservationToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "SetNull",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservationItem",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservationItem",
          "nativeType": null,
          "relationName": "SbmReservationToSbmReservationItem",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservationChangeHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservationChangeHistory",
          "nativeType": null,
          "relationName": "SbmReservationToSbmReservationChangeHistory",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmDeliveryAssignment",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryAssignment",
          "nativeType": null,
          "relationName": "SbmDeliveryAssignmentToSbmReservation",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmReservationItem",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": {
            "name": "cuid",
            "args": [
              1
            ]
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmReservationId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmProductId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unitPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservation",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservation",
          "nativeType": null,
          "relationName": "SbmReservationToSbmReservationItem",
          "relationFromFields": [
            "sbmReservationId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmProduct",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmProduct",
          "nativeType": null,
          "relationName": "SbmProductToSbmReservationItem",
          "relationFromFields": [
            "sbmProductId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Restrict",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmReservationChangeHistory",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": {
            "name": "cuid",
            "args": [
              1
            ]
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmReservationId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "changeType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "changedFields",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "oldValues",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newValues",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "changedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservation",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservation",
          "nativeType": null,
          "relationName": "SbmReservationToSbmReservationChangeHistory",
          "relationFromFields": [
            "sbmReservationId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "SetNull",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "SbmReservationChangeHistoryToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "SetNull",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmDeliveryTeam",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmDeliveryAssignment",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryAssignment",
          "nativeType": null,
          "relationName": "SbmDeliveryAssignmentToSbmDeliveryTeam",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmDeliveryAssignment",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmDeliveryTeamId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmReservationId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assignedBy",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "estimatedDuration",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "actualDuration",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "route",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "default": "assigned",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmDeliveryTeam",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryTeam",
          "nativeType": null,
          "relationName": "SbmDeliveryAssignmentToSbmDeliveryTeam",
          "relationFromFields": [
            "sbmDeliveryTeamId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Restrict",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservation",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservation",
          "nativeType": null,
          "relationName": "SbmDeliveryAssignmentToSbmReservation",
          "relationFromFields": [
            "sbmReservationId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "SbmDeliveryAssignmentToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "SetNull",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmIngredient",
      "dbName": "sbm_ingredients",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unit",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmProductIngredient",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmProductIngredient",
          "nativeType": null,
          "relationName": "SbmIngredientToSbmProductIngredient",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmProductIngredient",
      "dbName": "sbm_product_ingredients",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmProductId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmIngredientId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmProduct",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmProduct",
          "nativeType": null,
          "relationName": "SbmProductToSbmProductIngredient",
          "relationFromFields": [
            "sbmProductId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmIngredient",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmIngredient",
          "nativeType": null,
          "relationName": "SbmIngredientToSbmProductIngredient",
          "relationFromFields": [
            "sbmIngredientId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Restrict",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "sbmProductId",
          "sbmIngredientId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "sbmProductId",
            "sbmIngredientId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "Department",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "DepartmentToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "User",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "hiredAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yukyuCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "A",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "password",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "999999",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "role",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "user",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tempResetCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tempResetCodeExpired",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "schoolId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaStoreId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "shopId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "membershipName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "damageNameMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "app",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "apps",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "employeeCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "phone",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "familyId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "avatar",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "School",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "School",
          "nativeType": null,
          "relationName": "SchoolToUser",
          "relationFromFields": [
            "schoolId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "bcc",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UserRole",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UserRole",
          "nativeType": null,
          "relationName": "UserToUserRole",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmBase",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmBase",
          "nativeType": null,
          "relationName": "TbmBaseToUser",
          "relationFromFields": [
            "tbmBaseId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmBaseId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmDriveSchedule",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmDriveSchedule",
          "nativeType": null,
          "relationName": "TbmDriveScheduleToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UserWorkStatus",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UserWorkStatus",
          "nativeType": null,
          "relationName": "UserToUserWorkStatus",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "OdometerInput",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "OdometerInput",
          "nativeType": null,
          "relationName": "OdometerInputToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmRefuelHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmRefuelHistory",
          "nativeType": null,
          "relationName": "TbmRefuelHistoryToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmCarWashHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmCarWashHistory",
          "nativeType": null,
          "relationName": "TbmCarWashHistoryToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KyuyoTableRecord",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KyuyoTableRecord",
          "nativeType": null,
          "relationName": "KyuyoTableRecordToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Department",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Department",
          "nativeType": null,
          "relationName": "DepartmentToUser",
          "relationFromFields": [
            "departmentId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "departmentId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmVehicle",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmVehicle",
          "nativeType": null,
          "relationName": "TbmVehicleToUser",
          "relationFromFields": [
            "tbmVehicleId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmVehicleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservation",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservation",
          "nativeType": null,
          "relationName": "SbmReservationToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmDeliveryAssignment",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryAssignment",
          "nativeType": null,
          "relationName": "SbmDeliveryAssignmentToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ExerciseMaster",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ExerciseMaster",
          "nativeType": null,
          "relationName": "ExerciseMasterToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "WorkoutLog",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "WorkoutLog",
          "nativeType": null,
          "relationName": "UserToWorkoutLog",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservationChangeHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservationChangeHistory",
          "nativeType": null,
          "relationName": "SbmReservationChangeHistoryToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingStore",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingStore",
          "nativeType": null,
          "relationName": "CounselingStoreToUser",
          "relationFromFields": [
            "counselingStoreId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "counselingStoreId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingSlot",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingSlot",
          "nativeType": null,
          "relationName": "CounselingSlotToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "ReleaseNotes",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rootPath",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "title",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "msg",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "imgUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "confirmedUserIds",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Tokens",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "token",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "expiresAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "GoogleAccessToken",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "access_token",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "refresh_token",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "scope",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "token_type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "id_token",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "expiry_date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tokenJSON",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RoleMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "apps",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UserRole",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UserRole",
          "nativeType": null,
          "relationName": "RoleMasterToUserRole",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "UserRole",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "UserToUserRole",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RoleMaster",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RoleMaster",
          "nativeType": null,
          "relationName": "RoleMasterToUserRole",
          "relationFromFields": [
            "roleMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "roleMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "userId",
          "roleMasterId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "userId_roleMasterId_unique",
          "fields": [
            "userId",
            "roleMasterId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "ChainMethodLock",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isLocked",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "expiresAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Calendar",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "holidayType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "出勤",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "StockConfig",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "value",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "type",
          "name"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "stockConfig_type_name_unique",
          "fields": [
            "type",
            "name"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "Stock",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "favorite",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "heldCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "averageBuyPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "profit",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Code",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CompanyName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CompanyNameEnglish",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Sector17Code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Sector17CodeName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Sector33Code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Sector33CodeName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ScaleCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MarketCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MarketCodeName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_Date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_Open",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_High",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_Low",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_Close",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_UpperLimit",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_LowerLimit",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_Volume",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_TurnoverValue",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_AdjustmentFactor",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_AdjustmentOpen",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_AdjustmentHigh",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_AdjustmentLow",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_AdjustmentClose",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_AdjustmentVolume",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_riseRate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_josho",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_dekidakaJosho",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_renzokuJosho",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_takaneBreakout",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_idoHeikinKairiJosho",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_spike",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_spikeFall",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_spikeRise",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_recentCrash",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_goldenCross",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_rsiOversold",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_crashAndRebound",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_consecutivePositiveCloses",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_macdBullish",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_volumeBreakout",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_priceVolumeBreakout",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_deathCross",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_rsiOverbought",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_macdBearish",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_lowVolatility",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_supportBounce",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_resistanceBreak",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_macdLine",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_macdSignal",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_macdHistogram",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_ma5",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_ma20",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_ma60",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "last_rsi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "StockHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "StockHistory",
          "nativeType": null,
          "relationName": "StockToStockHistory",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "StockHistory",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Open",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "High",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Low",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Close",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UpperLimit",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "LowerLimit",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Volume",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TurnoverValue",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "AdjustmentFactor",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "AdjustmentOpen",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "AdjustmentHigh",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "AdjustmentLow",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "AdjustmentClose",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "AdjustmentVolume",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "riseRate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "josho",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dekidakaJosho",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "renzokuJosho",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "takaneBreakout",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "idoHeikinKairiJosho",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "spike",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "spikeFall",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "spikeRise",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "recentCrash",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "goldenCross",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rsiOversold",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "crashAndRebound",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "consecutivePositiveCloses",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "macdBullish",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "volumeBreakout",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "priceVolumeBreakout",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deathCross",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rsiOverbought",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "macdBearish",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lowVolatility",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "supportBounce",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "resistanceBreak",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "macdLine",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "macdSignal",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "macdHistogram",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ma5",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ma20",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ma60",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rsi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Stock",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Stock",
          "nativeType": null,
          "relationName": "StockToStockHistory",
          "relationFromFields": [
            "stockId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "stockId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "stockId",
          "Date"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "stockHistory_stockId_Date_unique",
          "fields": [
            "stockId",
            "Date"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "TbmBase",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "TbmBaseToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmVehicle",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmVehicle",
          "nativeType": null,
          "relationName": "TbmBaseToTbmVehicle",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmRouteGroup",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmRouteGroup",
          "nativeType": null,
          "relationName": "TbmBaseToTbmRouteGroup",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmDriveSchedule",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmDriveSchedule",
          "nativeType": null,
          "relationName": "TbmBaseToTbmDriveSchedule",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmCustomer",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmCustomer",
          "nativeType": null,
          "relationName": "TbmBaseToTbmCustomer",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmBase_MonthConfig",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmBase_MonthConfig",
          "nativeType": null,
          "relationName": "TbmBaseToTbmBase_MonthConfig",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmKeihi",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmKeihi",
          "nativeType": null,
          "relationName": "TbmBaseToTbmKeihi",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmRouteGroupShare",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmRouteGroupShare",
          "nativeType": null,
          "relationName": "TbmBaseToTbmRouteGroupShare",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmInvoiceManualEdit",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmInvoiceManualEdit",
          "nativeType": null,
          "relationName": "TbmBaseToTbmInvoiceManualEdit",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TbmRouteGroupCalendar",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "holidayType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remark",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmRouteGroup",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmRouteGroup",
          "nativeType": null,
          "relationName": "TbmRouteGroupToTbmRouteGroupCalendar",
          "relationFromFields": [
            "tbmRouteGroupId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmRouteGroupId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "tbmRouteGroupId",
          "date"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_tbmRouteGroupId_date",
          "fields": [
            "tbmRouteGroupId",
            "date"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "TbmKeihi",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "item",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "amount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remark",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmBase",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmBase",
          "nativeType": null,
          "relationName": "TbmBaseToTbmKeihi",
          "relationFromFields": [
            "tbmBaseId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmBaseId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TbmDriveScheduleImage",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "imageUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmDriveSchedule",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmDriveSchedule",
          "nativeType": null,
          "relationName": "TbmDriveScheduleToTbmDriveScheduleImage",
          "relationFromFields": [
            "tbmDriveScheduleId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmDriveScheduleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TbmBase_MonthConfig",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yearMonth",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "keiyuPerLiter",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gasolinePerLiter",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmBase",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmBase",
          "nativeType": null,
          "relationName": "TbmBaseToTbmBase_MonthConfig",
          "relationFromFields": [
            "tbmBaseId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmBaseId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "tbmBaseId",
          "yearMonth"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_tbmBaseId_yearMonth",
          "fields": [
            "tbmBaseId",
            "yearMonth"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "TbmVehicle",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "frameNo",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "vehicleNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "shape",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "airSuspension",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "oilTireParts",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "maintenance",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "insurance",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "shodoTorokubi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sakenManryobi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "hokenManryobi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sankagetsuTenkenbi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sokoKyori",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "jibaisekiHokenCompany",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "jibaisekiManryobi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "jidoshaHokenCompany",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "jidoshaManryobi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kamotsuHokenCompany",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kamotsuManryobi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sharyoHokenCompany",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sharyoManryobi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "etcCardNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "etcCardExpiration",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmFuelCard",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmFuelCard",
          "nativeType": null,
          "relationName": "TbmFuelCardToTbmVehicle",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmRefuelHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmRefuelHistory",
          "nativeType": null,
          "relationName": "TbmRefuelHistoryToTbmVehicle",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmBase",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmBase",
          "nativeType": null,
          "relationName": "TbmBaseToTbmVehicle",
          "relationFromFields": [
            "tbmBaseId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmBaseId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmDriveSchedule",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmDriveSchedule",
          "nativeType": null,
          "relationName": "TbmDriveScheduleToTbmVehicle",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "OdometerInput",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "OdometerInput",
          "nativeType": null,
          "relationName": "OdometerInputToTbmVehicle",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmCarWashHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmCarWashHistory",
          "nativeType": null,
          "relationName": "TbmCarWashHistoryToTbmVehicle",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmVehicleMaintenanceRecord",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmVehicleMaintenanceRecord",
          "nativeType": null,
          "relationName": "TbmVehicleToTbmVehicleMaintenanceRecord",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmEtcMeisai",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmEtcMeisai",
          "nativeType": null,
          "relationName": "TbmEtcMeisaiToTbmVehicle",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "EtcCsvRaw",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "EtcCsvRaw",
          "nativeType": null,
          "relationName": "EtcCsvRawToTbmVehicle",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "TbmVehicleToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "tbmBaseId",
          "vehicleNumber"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_tbmBaseId_vehicleNumber",
          "fields": [
            "tbmBaseId",
            "vehicleNumber"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "TbmFuelCard",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "startDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "endDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmVehicle",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmVehicle",
          "nativeType": null,
          "relationName": "TbmFuelCardToTbmVehicle",
          "relationFromFields": [
            "tbmVehicleId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmVehicleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TbmVehicleMaintenanceRecord",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "title",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "price",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contractor",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remark",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmVehicle",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmVehicle",
          "nativeType": null,
          "relationName": "TbmVehicleToTbmVehicleMaintenanceRecord",
          "relationFromFields": [
            "tbmVehicleId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmVehicleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TbmRouteGroup",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "routeName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "serviceNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "departureTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "finalArrivalTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "allowDuplicate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pickupTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "vehicleType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "seikyuKbn",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "01",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isShared",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmBase",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmBase",
          "nativeType": null,
          "relationName": "TbmBaseToTbmRouteGroup",
          "relationFromFields": [
            "tbmBaseId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmBaseId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmDriveSchedule",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmDriveSchedule",
          "nativeType": null,
          "relationName": "TbmDriveScheduleToTbmRouteGroup",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmMonthlyConfigForRouteGroup",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmMonthlyConfigForRouteGroup",
          "nativeType": null,
          "relationName": "TbmMonthlyConfigForRouteGroupToTbmRouteGroup",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Mid_TbmRouteGroup_TbmCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Mid_TbmRouteGroup_TbmCustomer",
          "nativeType": null,
          "relationName": "Mid_TbmRouteGroup_TbmCustomerToTbmRouteGroup",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmRouteGroupCalendar",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmRouteGroupCalendar",
          "nativeType": null,
          "relationName": "TbmRouteGroupToTbmRouteGroupCalendar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmRouteGroupFee",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmRouteGroupFee",
          "nativeType": null,
          "relationName": "TbmRouteGroupToTbmRouteGroupFee",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmRouteGroupShare",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmRouteGroupShare",
          "nativeType": null,
          "relationName": "TbmRouteGroupToTbmRouteGroupShare",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "tbmBaseId",
          "code"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_tbmBaseId_code",
          "fields": [
            "tbmBaseId",
            "code"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "TbmRouteGroupFee",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "startDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "driverFee",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "futaiFee",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmRouteGroup",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmRouteGroup",
          "nativeType": null,
          "relationName": "TbmRouteGroupToTbmRouteGroupFee",
          "relationFromFields": [
            "tbmRouteGroupId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmRouteGroupId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TbmMonthlyConfigForRouteGroup",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yearMonth",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "generalFee",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tsukoryoSeikyuGaku",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "seikyuKaisu",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "numberOfTrips",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmRouteGroup",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmRouteGroup",
          "nativeType": null,
          "relationName": "TbmMonthlyConfigForRouteGroupToTbmRouteGroup",
          "relationFromFields": [
            "tbmRouteGroupId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmRouteGroupId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "yearMonth",
          "tbmRouteGroupId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_yearMonth_tbmRouteGroupId",
          "fields": [
            "yearMonth",
            "tbmRouteGroupId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "Mid_TbmRouteGroup_TbmCustomer",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmRouteGroup",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmRouteGroup",
          "nativeType": null,
          "relationName": "Mid_TbmRouteGroup_TbmCustomerToTbmRouteGroup",
          "relationFromFields": [
            "tbmRouteGroupId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmRouteGroupId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmCustomer",
          "nativeType": null,
          "relationName": "Mid_TbmRouteGroup_TbmCustomerToTbmCustomer",
          "relationFromFields": [
            "tbmCustomerId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmCustomerId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "tbmRouteGroupId",
          "tbmCustomerId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_tbmRouteGroupId_tbmCustomerId",
          "fields": [
            "tbmRouteGroupId",
            "tbmCustomerId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "TbmBillingAddress",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TbmInvoiceDetail",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "numberOfTrips",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fare",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "toll",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "specialAddition",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TbmCustomer",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "phoneNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "faxNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "bankInformation",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Mid_TbmRouteGroup_TbmCustomer",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Mid_TbmRouteGroup_TbmCustomer",
          "nativeType": null,
          "relationName": "Mid_TbmRouteGroup_TbmCustomerToTbmCustomer",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmInvoiceManualEdit",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmInvoiceManualEdit",
          "nativeType": null,
          "relationName": "TbmCustomerToTbmInvoiceManualEdit",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmBase",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmBase",
          "nativeType": null,
          "relationName": "TbmBaseToTbmCustomer",
          "relationFromFields": [
            "tbmBaseId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmBaseId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "tbmBaseId",
          "name"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_tbmBaseId_name",
          "fields": [
            "tbmBaseId",
            "name"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "TbmInvoiceManualEdit",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yearMonth",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "summary",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "details",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmBase",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmBase",
          "nativeType": null,
          "relationName": "TbmBaseToTbmInvoiceManualEdit",
          "relationFromFields": [
            "tbmBaseId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmBaseId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmCustomer",
          "nativeType": null,
          "relationName": "TbmCustomerToTbmInvoiceManualEdit",
          "relationFromFields": [
            "tbmCustomerId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmCustomerId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "tbmCustomerId",
          "yearMonth"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_tbmCustomerId_yearMonth",
          "fields": [
            "tbmCustomerId",
            "yearMonth"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "TbmRefuelHistory",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "amount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "odometer",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmVehicle",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmVehicle",
          "nativeType": null,
          "relationName": "TbmRefuelHistoryToTbmVehicle",
          "relationFromFields": [
            "tbmVehicleId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmVehicleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "TbmRefuelHistoryToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TbmCarWashHistory",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "price",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmVehicle",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmVehicle",
          "nativeType": null,
          "relationName": "TbmCarWashHistoryToTbmVehicle",
          "relationFromFields": [
            "tbmVehicleId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmVehicleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "TbmCarWashHistoryToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TbmDriveSchedule",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remark",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "M_postalHighwayFee",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "O_generalHighwayFee",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "TbmDriveScheduleToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmVehicle",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmVehicle",
          "nativeType": null,
          "relationName": "TbmDriveScheduleToTbmVehicle",
          "relationFromFields": [
            "tbmVehicleId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmVehicleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmRouteGroup",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmRouteGroup",
          "nativeType": null,
          "relationName": "TbmDriveScheduleToTbmRouteGroup",
          "relationFromFields": [
            "tbmRouteGroupId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmRouteGroupId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "finished",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "confirmed",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "approved",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmBase",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmBase",
          "nativeType": null,
          "relationName": "TbmBaseToTbmDriveSchedule",
          "relationFromFields": [
            "tbmBaseId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmBaseId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmEtcMeisai",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmEtcMeisai",
          "nativeType": null,
          "relationName": "TbmDriveScheduleToTbmEtcMeisai",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmDriveScheduleImage",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmDriveScheduleImage",
          "nativeType": null,
          "relationName": "TbmDriveScheduleToTbmDriveScheduleImage",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TbmEtcMeisai",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "groupIndex",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "month",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "info",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sum",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmVehicle",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmVehicle",
          "nativeType": null,
          "relationName": "TbmEtcMeisaiToTbmVehicle",
          "relationFromFields": [
            "tbmVehicleId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmVehicleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmDriveSchedule",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmDriveSchedule",
          "nativeType": null,
          "relationName": "TbmDriveScheduleToTbmEtcMeisai",
          "relationFromFields": [
            "tbmDriveScheduleId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmDriveScheduleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "EtcCsvRaw",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "EtcCsvRaw",
          "nativeType": null,
          "relationName": "EtcCsvRawToTbmEtcMeisai",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "EtcCsvRaw",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fromDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fromTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "toDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "toTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fromIc",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "toIc",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "originalFee",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "discountAmount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fee",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalAmount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isGrouped",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remark",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cardNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmVehicle",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmVehicle",
          "nativeType": null,
          "relationName": "EtcCsvRawToTbmVehicle",
          "relationFromFields": [
            "tbmVehicleId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmVehicleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmEtcMeisai",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmEtcMeisai",
          "nativeType": null,
          "relationName": "EtcCsvRawToTbmEtcMeisai",
          "relationFromFields": [
            "tbmEtcMeisaiId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmEtcMeisaiId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "tbmVehicleId",
          "fromDate",
          "fromTime"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_tbmVehicleId_fromDate_fromTime",
          "fields": [
            "tbmVehicleId",
            "fromDate",
            "fromTime"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "OdometerInput",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "odometerStart",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "odometerEnd",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmVehicle",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmVehicle",
          "nativeType": null,
          "relationName": "OdometerInputToTbmVehicle",
          "relationFromFields": [
            "tbmVehicleId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmVehicleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "OdometerInputToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "tbmVehicleId",
          "date"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_tbmVehicleId_date",
          "fields": [
            "tbmVehicleId",
            "date"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "UserWorkStatus",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "workStatus",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remark",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "vehicleNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "startTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "endTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kyukeiMins",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "shinyaKyukeiMins",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kyusokuMins",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "UserToUserWorkStatus",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "userId",
          "date"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_userId_date",
          "fields": [
            "userId",
            "date"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "KyuyoTableRecord",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "other1",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "other2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "shokuhi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "maebaraikin",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0.5,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yearMonth",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "KyuyoTableRecordToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "userId",
          "yearMonth"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_userId_yearMonth",
          "fields": [
            "userId",
            "yearMonth"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "TbmRouteGroupShare",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmRouteGroup",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmRouteGroup",
          "nativeType": null,
          "relationName": "TbmRouteGroupToTbmRouteGroupShare",
          "relationFromFields": [
            "tbmRouteGroupId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmRouteGroupId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TbmBase",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TbmBase",
          "nativeType": null,
          "relationName": "TbmBaseToTbmRouteGroupShare",
          "relationFromFields": [
            "tbmBaseId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tbmBaseId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isActive",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "tbmRouteGroupId",
          "tbmBaseId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_tbmRouteGroupId_tbmBaseId",
          "fields": [
            "tbmRouteGroupId",
            "tbmBaseId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "TeamSynapseAnalysis",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userEmail",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "enabledServices",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gmailTargetEmails",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gmailDateFrom",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gmailDateTo",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "chatRoomId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "chatDateFrom",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "chatDateTo",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "driveFolderUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "analysisResult",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "ExerciseMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "part",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unit",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "ExerciseMasterToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "WorkoutLog",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "WorkoutLog",
          "nativeType": null,
          "relationName": "ExerciseMasterToWorkoutLog",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "WorkoutLog",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "exerciseId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "strength",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "reps",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "UserToWorkoutLog",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ExerciseMaster",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ExerciseMaster",
          "nativeType": null,
          "relationName": "ExerciseMasterToWorkoutLog",
          "relationFromFields": [
            "exerciseId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    }
  ],
  "types": [],
  "indexes": [
    {
      "model": "KaizenClient",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KaizenClient",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_name_organization",
      "fields": [
        {
          "name": "name"
        },
        {
          "name": "organization"
        }
      ]
    },
    {
      "model": "KaizenReview",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KaizenWork",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KaizenWork",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "uuid"
        }
      ]
    },
    {
      "model": "KaizenWork",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_title_subtitle",
      "fields": [
        {
          "name": "title"
        },
        {
          "name": "subtitle"
        }
      ]
    },
    {
      "model": "KaizenWorkImage",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KaizenWorkImage",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "url"
        }
      ]
    },
    {
      "model": "KaizenCMS",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CounselingStore",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CounselingRoom",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CounselingClient",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CounselingClient",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "phone"
        }
      ]
    },
    {
      "model": "CounselingReservation",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CounselingSlot",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "School",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "LearningRoleMasterOnGame",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SubjectNameMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Teacher",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Teacher",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "email"
        }
      ]
    },
    {
      "model": "Student",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Student",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_schoolId_classroomId_attendanceNumber",
      "fields": [
        {
          "name": "schoolId"
        },
        {
          "name": "classroomId"
        },
        {
          "name": "attendanceNumber"
        }
      ]
    },
    {
      "model": "UnfitFellow",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Classroom",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Classroom",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_schoolId_grade_class",
      "fields": [
        {
          "name": "schoolId"
        },
        {
          "name": "grade"
        },
        {
          "name": "class"
        }
      ]
    },
    {
      "model": "TeacherClass",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TeacherClass",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_teacherId_classroomId",
      "fields": [
        {
          "name": "teacherId"
        },
        {
          "name": "classroomId"
        }
      ]
    },
    {
      "model": "GameStudent",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "GameStudent",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_gameId_studentId",
      "fields": [
        {
          "name": "gameId"
        },
        {
          "name": "studentId"
        }
      ]
    },
    {
      "model": "Game",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Game",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "secretKey"
        }
      ]
    },
    {
      "model": "GroupCreateConfig",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "GroupCreateConfig",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "gameId"
        }
      ]
    },
    {
      "model": "Group",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Squad",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "StudentRole",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "QuestionPrompt",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Answer",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Answer",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_gameId_studentId_questionPromptId",
      "fields": [
        {
          "name": "gameId"
        },
        {
          "name": "studentId"
        },
        {
          "name": "questionPromptId"
        }
      ]
    },
    {
      "model": "Slide",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SlideAnswer",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SlideAnswer",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "slideId"
        },
        {
          "name": "studentId"
        },
        {
          "name": "gameId"
        }
      ]
    },
    {
      "model": "KeihiExpense",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KeihiAttachment",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KeihiAccountMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KeihiOptionMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KeihiOptionMaster",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "category"
        },
        {
          "name": "isActive"
        },
        {
          "name": "sortOrder"
        }
      ]
    },
    {
      "model": "KeihiOptionMaster",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "category_value_unique",
      "fields": [
        {
          "name": "category"
        },
        {
          "name": "value"
        }
      ]
    },
    {
      "model": "Product",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RawMaterial",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "ProductRecipe",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "ProductRecipe",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "product_rawMaterial_unique",
      "fields": [
        {
          "name": "productId"
        },
        {
          "name": "rawMaterialId"
        }
      ]
    },
    {
      "model": "Order",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Production",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Shipment",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "StockAdjustment",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CompanyHoliday",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CompanyHoliday",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "holidayAt"
        }
      ]
    },
    {
      "model": "DailyStaffAssignment",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "DailyStaffAssignment",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "assignment_product_unique",
      "fields": [
        {
          "name": "assignmentAt"
        },
        {
          "name": "productId"
        }
      ]
    },
    {
      "model": "SbmCustomer",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmCustomerPhone",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmCustomerPhone",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "sbmCustomerId"
        },
        {
          "name": "phoneNumber"
        }
      ]
    },
    {
      "model": "SbmProduct",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmProductPriceHistory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmDeliveryGroup",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmDeliveryRouteStop",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmDeliveryGroupReservation",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmDeliveryGroupReservation",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "sbmDeliveryGroupId"
        },
        {
          "name": "sbmReservationId"
        }
      ]
    },
    {
      "model": "SbmReservation",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmReservationItem",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmReservationChangeHistory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmDeliveryTeam",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmDeliveryAssignment",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmIngredient",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmProductIngredient",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmProductIngredient",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "sbmProductId"
        },
        {
          "name": "sbmIngredientId"
        }
      ]
    },
    {
      "model": "Department",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Department",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "User",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "User",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "User",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "email"
        }
      ]
    },
    {
      "model": "User",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "employeeCode"
        }
      ]
    },
    {
      "model": "ReleaseNotes",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Tokens",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Tokens",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "GoogleAccessToken",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "GoogleAccessToken",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "email"
        }
      ]
    },
    {
      "model": "RoleMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RoleMaster",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "UserRole",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "UserRole",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "userId_roleMasterId_unique",
      "fields": [
        {
          "name": "userId"
        },
        {
          "name": "roleMasterId"
        }
      ]
    },
    {
      "model": "ChainMethodLock",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Calendar",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Calendar",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "date"
        }
      ]
    },
    {
      "model": "StockConfig",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "StockConfig",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "stockConfig_type_name_unique",
      "fields": [
        {
          "name": "type"
        },
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "Stock",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Stock",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "Code"
        }
      ]
    },
    {
      "model": "StockHistory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "StockHistory",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "Date"
        }
      ]
    },
    {
      "model": "StockHistory",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "stockHistory_stockId_Date_unique",
      "fields": [
        {
          "name": "stockId"
        },
        {
          "name": "Date"
        }
      ]
    },
    {
      "model": "TbmBase",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmBase",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "TbmBase",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "TbmRouteGroupCalendar",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmRouteGroupCalendar",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_tbmRouteGroupId_date",
      "fields": [
        {
          "name": "tbmRouteGroupId"
        },
        {
          "name": "date"
        }
      ]
    },
    {
      "model": "TbmKeihi",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmDriveScheduleImage",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmBase_MonthConfig",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmBase_MonthConfig",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_tbmBaseId_yearMonth",
      "fields": [
        {
          "name": "tbmBaseId"
        },
        {
          "name": "yearMonth"
        }
      ]
    },
    {
      "model": "TbmVehicle",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmVehicle",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "TbmVehicle",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "frameNo"
        }
      ]
    },
    {
      "model": "TbmVehicle",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "vehicleNumber"
        }
      ]
    },
    {
      "model": "TbmVehicle",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_tbmBaseId_vehicleNumber",
      "fields": [
        {
          "name": "tbmBaseId"
        },
        {
          "name": "vehicleNumber"
        }
      ]
    },
    {
      "model": "TbmFuelCard",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmVehicleMaintenanceRecord",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmRouteGroup",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmRouteGroup",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "TbmRouteGroup",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_tbmBaseId_code",
      "fields": [
        {
          "name": "tbmBaseId"
        },
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "TbmRouteGroupFee",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmMonthlyConfigForRouteGroup",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmMonthlyConfigForRouteGroup",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_yearMonth_tbmRouteGroupId",
      "fields": [
        {
          "name": "yearMonth"
        },
        {
          "name": "tbmRouteGroupId"
        }
      ]
    },
    {
      "model": "Mid_TbmRouteGroup_TbmCustomer",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Mid_TbmRouteGroup_TbmCustomer",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "tbmRouteGroupId"
        }
      ]
    },
    {
      "model": "Mid_TbmRouteGroup_TbmCustomer",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_tbmRouteGroupId_tbmCustomerId",
      "fields": [
        {
          "name": "tbmRouteGroupId"
        },
        {
          "name": "tbmCustomerId"
        }
      ]
    },
    {
      "model": "TbmBillingAddress",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmInvoiceDetail",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmCustomer",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmCustomer",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "TbmCustomer",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "TbmCustomer",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_tbmBaseId_name",
      "fields": [
        {
          "name": "tbmBaseId"
        },
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "TbmInvoiceManualEdit",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmInvoiceManualEdit",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_tbmCustomerId_yearMonth",
      "fields": [
        {
          "name": "tbmCustomerId"
        },
        {
          "name": "yearMonth"
        }
      ]
    },
    {
      "model": "TbmRefuelHistory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmCarWashHistory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmDriveSchedule",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmEtcMeisai",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmEtcMeisai",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "tbmVehicleId"
        }
      ]
    },
    {
      "model": "EtcCsvRaw",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "EtcCsvRaw",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "tbmVehicleId"
        }
      ]
    },
    {
      "model": "EtcCsvRaw",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_tbmVehicleId_fromDate_fromTime",
      "fields": [
        {
          "name": "tbmVehicleId"
        },
        {
          "name": "fromDate"
        },
        {
          "name": "fromTime"
        }
      ]
    },
    {
      "model": "OdometerInput",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "OdometerInput",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_tbmVehicleId_date",
      "fields": [
        {
          "name": "tbmVehicleId"
        },
        {
          "name": "date"
        }
      ]
    },
    {
      "model": "UserWorkStatus",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "UserWorkStatus",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_userId_date",
      "fields": [
        {
          "name": "userId"
        },
        {
          "name": "date"
        }
      ]
    },
    {
      "model": "KyuyoTableRecord",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KyuyoTableRecord",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_userId_yearMonth",
      "fields": [
        {
          "name": "userId"
        },
        {
          "name": "yearMonth"
        }
      ]
    },
    {
      "model": "TbmRouteGroupShare",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TbmRouteGroupShare",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_tbmRouteGroupId_tbmBaseId",
      "fields": [
        {
          "name": "tbmRouteGroupId"
        },
        {
          "name": "tbmBaseId"
        }
      ]
    },
    {
      "model": "TeamSynapseAnalysis",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TeamSynapseAnalysis",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "TeamSynapseAnalysis",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "createdAt"
        }
      ]
    },
    {
      "model": "ExerciseMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "WorkoutLog",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    }
  ]
};
