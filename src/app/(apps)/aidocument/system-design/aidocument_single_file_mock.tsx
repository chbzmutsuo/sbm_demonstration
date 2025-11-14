'use client'

/*
💡
「こちらはモックであり、単一ファイルに収まるよう構築されています。このページは最終的に削除するため、本番プロジェクトでは、プロジェクトの設計やルールに従ってページやコンポーネントを分割してください」。
*/

import React, {useState, useEffect, useRef} from 'react'

// --- 型定義 ---

interface Client {
  id: string
  name: string
}

interface Staff {
  id: string
  name: string
  age: number
  gender: string
  term: string
}

interface Vehicle {
  id: string
  plate: string
  term: string
}

interface Site {
  id: string
  clientId: string
  name: string
  address: string
  amount: number
  startDate: string
  endDate: string
  staff: Staff[]
  vehicles: Vehicle[]
}

interface DocumentItem {
  componentId: string
  x: number
  y: number
  value: any
}

interface Document {
  id: string
  siteId: string
  name: string
  pdfTemplateUrl: string | null
  items: DocumentItem[]
}

interface Component {
  id: string
  label: string
  value: any
  group: string
}

interface NavigationParams {
  clientId?: string
  siteId?: string
  documentId?: string
}
import {
  FileText,
  Home,
  Plus,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  UploadCloud,
  CheckCircle,
  GripVertical,
  FileDown,
  Bot,
  Loader2,
  Search,
  ChevronDown,
  Building,
  Users,
  Truck,
  Calendar,
  Wallet,
  Printer,
  SquarePen,
  Briefcase, // (追加) 取引先アイコン
} from 'lucide-react'

// アイコンコンポーネントのラッパー（便宜上）
const IconHome = Home
const IconFileText = FileText
const IconPlus = Plus
const IconChevronRight = ChevronRight
const IconMoreVertical = MoreVertical
const IconTrash2 = Trash2
const IconEdit2 = Edit2
const IconX = X
const IconAlertCircle = AlertCircle
const IconUploadCloud = UploadCloud
const IconCheckCircle = CheckCircle
const IconGripVertical = GripVertical
const IconFileDown = FileDown
const IconBot = Bot
const IconLoader2 = Loader2
const IconSearch = Search
const IconChevronDown = ChevronDown
const IconBuilding = Building // 現場
const IconUsers = Users
const IconTruck = Truck
const IconCalendar = Calendar
const IconWallet = Wallet
const IconPrinter = Printer
const IconSquarePen = SquarePen
const IconBriefcase = Briefcase // 取引先

// --- サンプルデータ (構造変更後) ---

const SAMPLE_CLIENTS: Client[] = [
  {id: 'client_1', name: '株式会社A建設'},
  {id: 'client_2', name: 'B土木株式会社'},
]

const SAMPLE_SITES: Site[] = [
  {
    id: 'site_1',
    clientId: 'client_1', // (変更) 取引先ID
    name: '中央公園改修工事', // (変更) 案件 -> 現場
    address: '東京都千代田区1-1',
    amount: 120000000,
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    staff: [
      {id: 's1', name: '田中 太郎', age: 45, gender: '男性', term: '2024-04-01~2025-03-31'},
      {id: 's2', name: '鈴木 花子', age: 32, gender: '女性', term: '2024-06-01~2024-12-31'},
    ],
    vehicles: [
      {id: 'v1', plate: '品川 300 あ 12-34', term: '2024-04-01~'},
      {id: 'v2', plate: '多摩 500 い 56-78', term: '2024-07-01~'},
    ],
  },
  {
    id: 'site_2',
    clientId: 'client_1',
    name: '植栽エリア整備',
    address: '東京都千代田区1-2 (公園北口)',
    amount: 30000000,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    staff: [{id: 's2', name: '鈴木 花子', age: 32, gender: '女性', term: '2024-06-01~'}],
    vehicles: [],
  },
  {
    id: 'site_3',
    clientId: 'client_2',
    name: 'みなとみらい新設道路',
    address: '神奈川県横浜市西区みなとみらい1-2-3',
    amount: 85000000,
    startDate: '2024-05-15',
    endDate: '2024-11-30',
    staff: [{id: 's3', name: '高橋 一郎', age: 51, gender: '男性', term: '2024-05-15~'}],
    vehicles: [{id: 'v3', plate: '横浜 100 か 90-12', term: '2024-05-15~'}],
  },
]

const SAMPLE_DOCUMENTS: Document[] = [
  {
    id: 'doc_1',
    siteId: 'site_1', // (変更) projectId -> siteId
    name: '作業員名簿 (様式第5号)',
    pdfTemplateUrl: null,
    items: [
      {componentId: 's_name', x: 100, y: 150, value: '中央公園改修工事'}, // (変更) f_name -> s_name
      {componentId: 's1_name', x: 200, y: 250, value: '田中 太郎'},
      {componentId: 's1_age', x: 300, y: 250, value: 45},
    ],
  },
  {
    id: 'doc_2',
    siteId: 'site_1', // (変更) projectId -> siteId
    name: '車両届 (様式第8号)',
    pdfTemplateUrl: null,
    items: [
      {componentId: 's_name', x: 50, y: 80, value: '中央公園改修工事'}, // (変更) f_name -> s_name
      {componentId: 'v1_plate', x: 150, y: 200, value: '品川 300 あ 12-34'},
    ],
  },
  {
    id: 'doc_3',
    siteId: 'site_3', // (変更) projectId -> siteId
    name: '作業員名簿 (様式第5号)',
    pdfTemplateUrl: null,
    items: [],
  },
]

// --- カスタムフック (名称変更) ---

/**
 * 取引先マスタ (Clients) の状態管理ロジック
 * @param {Array} initialClients - 初期データ
 */
function useClientManager(initialClients: Client[] = []) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    try {
      setTimeout(() => {
        setClients(initialClients)
        setLoading(false)
      }, 500)
    } catch (err) {
      setError('取引先マスタの読み込みに失敗しました。')
      setLoading(false)
    }
  }, [initialClients])

  const saveClient = (clientData: Partial<Client>) => {
    setLoading(true)
    try {
      if (clientData.id) {
        setClients(prev => prev.map(c => (c.id === clientData.id ? ({...c, ...clientData} as Client) : c)))
      } else {
        const newClient: Client = {...clientData, id: `client_${Date.now()}`} as Client
        setClients(prev => [newClient, ...prev])
      }
      setLoading(false)
    } catch (err) {
      setError('取引先の保存に失敗しました。')
      setLoading(false)
    }
  }

  const deleteClient = (clientId: string) => {
    setLoading(true)
    try {
      // TODO: 関連する現場・書類の削除確認
      setClients(prev => prev.filter(c => c.id !== clientId))
      setLoading(false)
    } catch (err) {
      setError('取引先の削除に失敗しました。')
      setLoading(false)
    }
  }

  return {clients, loading, error, saveClient, deleteClient, isLoading: loading}
}

/**
 * 現場 (Sites) の状態管理ロジック
 * @param {Array} initialSites - 初期データ
 */
function useSiteManager(initialSites: Site[] = []) {
  const [sites, setSites] = useState<Site[]>(initialSites)
  // 他のロジック（loading, error）

  const getSitesByClientId = (clientId: string) => {
    return sites.filter(s => s.clientId === clientId)
  }

  const getSiteById = (siteId: string) => {
    return sites.find(s => s.id === siteId)
  }

  const saveSite = (siteData: Partial<Site> & {clientId: string}) => {
    if (siteData.id) {
      setSites(prev => prev.map(s => (s.id === siteData.id ? (siteData as Site) : s)))
    } else {
      const newSite: Site = {...siteData, id: `site_${Date.now()}`} as Site
      setSites(prev => [newSite, ...prev])
    }
  }

  const deleteSite = (siteId: string) => {
    setSites(prev => prev.filter(s => s.id !== siteId))
  }

  return {sites, getSitesByClientId, getSiteById, saveSite, deleteSite}
}

/**
 * ドキュメント (Documents) の状態管理ロジック
 * @param {Array} initialDocuments - 初期データ
 */
function useDocumentManager(initialDocuments: Document[] = []) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  // ...

  const getDocumentsBySiteId = (siteId: string) => {
    return documents.filter(d => d.siteId === siteId)
  }

  const getDocumentById = (docId: string) => {
    return documents.find(d => d.id === docId)
  }

  const saveDocument = (docData: Partial<Document> & {siteId: string}) => {
    if (docData.id) {
      setDocuments(prev => prev.map(d => (d.id === docData.id ? (docData as Document) : d)))
      return docData as Document
    } else {
      const newDoc: Document = {...docData, id: `doc_${Date.now()}`} as Document
      setDocuments(prev => [newDoc, ...prev])
      return newDoc
    }
  }

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId))
  }

  return {documents, getDocumentsBySiteId, getDocumentById, saveDocument, deleteDocument}
}

/**
 * ドキュメント編集ページ（D&D）のロジック
 * @param {Object} initialDocument - 編集対象のドキュメント
 * @param {Object} siteData - (変更) 関連する現場マスタデータ (siteData)
 */
function useDocumentEditor(initialDocument: Document | undefined, siteData: Site | undefined) {
  const [document, setDocument] = useState<Document | undefined>(initialDocument)
  const [items, setItems] = useState<DocumentItem[]>(initialDocument?.items || [])
  const [pdfUrl, setPdfUrl] = useState<string | null>(initialDocument?.pdfTemplateUrl || null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDocument(initialDocument)
    setItems(initialDocument?.items || [])
    setPdfUrl(initialDocument?.pdfTemplateUrl || null)
  }, [initialDocument])

  const handlePdfUpload = (file: File) => {
    setLoading(true)
    setTimeout(() => {
      const url = URL.createObjectURL(file)
      setPdfUrl(url)
      setDocument(prev => ({...prev!, pdfTemplateUrl: url}))
      setLoading(false)
    }, 1000)
  }

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    const componentId = e.dataTransfer.getData('text/plain')
    if (!componentId || !pdfRef.current) return

    const pdfRect = pdfRef.current.getBoundingClientRect()
    const x = e.clientX - pdfRect.left
    const y = e.clientY - pdfRect.top

    const newItem: DocumentItem = {
      componentId,
      x,
      y,
      value: getComponentValue(componentId, siteData), // (変更) siteData を渡す
    }
    setItems(prev => [...prev, newItem])
  }

  const handleItemDragEnd = (index: number, e: React.DragEvent) => {
    if (!pdfRef.current) return
    const pdfRect = pdfRef.current.getBoundingClientRect()
    let x = e.clientX - pdfRect.left
    let y = e.clientY - pdfRect.top

    if (x < 0) x = 0
    if (y < 0) y = 0
    if (x > pdfRect.width) x = pdfRect.width
    if (y > pdfRect.height) y = pdfRect.height

    setItems(prev => prev.map((item, i) => (i === index ? {...item, x, y} : item)))
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleAiAnalyze = () => {
    if (!siteData) return
    setAiLoading(true)
    setTimeout(() => {
      const aiItems: DocumentItem[] = [
        {componentId: 's_name', x: 100, y: 120, value: siteData.name},
        {componentId: 's_address', x: 100, y: 140, value: siteData.address},
        {componentId: 's_startDate', x: 500, y: 160, value: siteData.startDate},
        {componentId: 's_endDate', x: 600, y: 160, value: siteData.endDate},
        ...(siteData.staff?.map((s, i) => ({
          componentId: `${s.id}_name`,
          x: 150,
          y: 200 + i * 20,
          value: s.name,
        })) || []),
      ]
      setItems(aiItems)
      setAiLoading(false)
    }, 1500)
  }

  const onSave = (saveDocumentFn: (doc: Partial<Document> & {siteId: string}) => any) => {
    const updatedDocument = {...document!, items, pdfTemplateUrl: pdfUrl}
    saveDocumentFn(updatedDocument)
  }

  // (変更) 現場データから「部品」リストを生成
  const components = generateComponentsFromSite(siteData)

  return {
    document,
    items,
    pdfUrl,
    loading,
    aiLoading,
    pdfRef,
    handlePdfUpload,
    handleDrop,
    handleItemDragEnd,
    removeItem,
    handleAiAnalyze,
    onSave,
    components,
  }
}

/**
 * (変更) 現場マスタデータからD&D用の「部品」リストを生成する
 * @param {Object} siteData - 現場マスタ
 */
function generateComponentsFromSite(siteData: Site | undefined): Component[] {
  if (!siteData) return []

  const components: Component[] = [
    // (変更) プレフィックスを f_ -> s_ に変更
    {id: 's_name', label: '現場名', value: siteData.name, group: '基本情報'},
    {id: 's_address', label: '住所', value: siteData.address, group: '基本情報'},
    {id: 's_amount', label: '金額', value: siteData.amount, group: '基本情報'},
    {id: 's_startDate', label: '開始日', value: siteData.startDate, group: '基本情報'},
    {id: 's_endDate', label: '終了日', value: siteData.endDate, group: '基本情報'},
  ]

  ;(siteData.staff || []).forEach(s => {
    components.push({id: `${s.id}_name`, label: `[ス] ${s.name} (氏名)`, value: s.name, group: '担当スタッフ'})
    components.push({id: `${s.id}_age`, label: `[ス] ${s.name} (年齢)`, value: s.age, group: '担当スタッフ'})
    components.push({id: `${s.id}_gender`, label: `[ス] ${s.name} (性別)`, value: s.gender, group: '担当スタッフ'})
    components.push({id: `${s.id}_term`, label: `[ス] ${s.name} (期間)`, value: s.term, group: '担当スタッフ'})
  })
  ;(siteData.vehicles || []).forEach(v => {
    components.push({id: `${v.id}_plate`, label: `[車] ${v.plate} (番号)`, value: v.plate, group: '利用車両'})
    components.push({id: `${v.id}_term`, label: `[車] ${v.plate} (期間)`, value: v.term, group: '利用車両'})
  })

  return components
}

/**
 * componentId からマスタの値を取得するヘルパー関数
 * @param {Object} data - 現場データ (siteData)
 */
const getComponentValue = (componentId: string, data: Site | undefined): any => {
  if (!data || !componentId) return ''

  const [prefix, ...rest] = componentId.split('_')
  const id = rest[0] // s_name の場合 'name'
  const field = rest[1] // s1_name の場合 'name'

  switch (prefix) {
    case 's': {
      // (変更) 現場基本情報 (s_name)
      if (rest.length === 1) {
        return (data as any)[id] // data['name']
      }
      // スタッフ (s1_name)
      const staff = data.staff?.find(s => s.id === id)
      return staff ? (staff as any)[field] : ''
    }
    case 'v': {
      // 車両 (v1_plate)
      const vehicle = data.vehicles?.find(v => v.id === id)
      return vehicle ? (vehicle as any)[field] : ''
    }
    default:
      return ''
  }
}

// --- UI Components ---

/**
 * 汎用ボタン
 */
interface ButtonProps {
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  form?: string
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  type = 'button',
  form,
}) => {
  const baseStyle =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-400',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-400',
    link: 'text-blue-600 underline-offset-4 hover:underline focus:ring-blue-500',
  }

  const sizeStyles = {
    default: 'h-9 px-3 py-2',
    sm: 'h-8 rounded-md px-2 text-xs',
    lg: 'h-10 rounded-md px-4',
    icon: 'h-9 w-9',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      form={form}
    >
      {children}
    </button>
  )
}

/**
 * 汎用モーダル
 */
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({isOpen, onClose, title, children, footer}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8">
            <IconX className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && <div className="flex items-center justify-end p-3 border-t bg-gray-50 rounded-b-lg">{footer}</div>}
      </div>
    </div>
  )
}

/**
 * (追加) 取引先の追加・編集フォーム (簡素版)
 * @param {Object} props - isOpen, onClose, onSave, initialData
 */
interface ClientFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Client>) => void
  initialData: Client | null
}

const ClientForm: React.FC<ClientFormProps> = ({isOpen, onClose, onSave, initialData}) => {
  const [name, setName] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
    } else {
      setName('')
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({id: initialData?.id, name})
  }

  const formFooter = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onClose} type="button">
        キャンセル
      </Button>
      <Button type="submit">保存</Button>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? '取引先の編集' : '新規取引先の登録'} footer={formFooter}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">取引先名</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
      </form>
    </Modal>
  )
}

/**
 * (変更) 現場の追加・編集フォーム (以前のFieldForm)
 * @param {Object} props - isOpen, onClose, onSave, initialData
 */
interface SiteFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Site>) => void
  initialData: Site | null
}

const SiteForm: React.FC<SiteFormProps> = ({isOpen, onClose, onSave, initialData}) => {
  const [formData, setFormData] = useState<Partial<Site>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        staff: initialData.staff || [],
        vehicles: initialData.vehicles || [],
      })
    } else {
      // 新規作成時のデフォルト値
      setFormData({
        name: '',
        address: '',
        amount: 0,
        startDate: '',
        endDate: '',
        staff: [],
        vehicles: [],
      })
    }
  }, [initialData, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value, type} = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }))
  }

  const handleNestedChange = (listName: 'staff' | 'vehicles', index: number, fieldName: string, value: any) => {
    setFormData(prev => {
      const newList = [...(prev[listName] || [])]
      newList[index] = {...newList[index], [fieldName]: value}
      return {...prev, [listName]: newList}
    })
  }

  const addNestedItem = (listName: 'staff' | 'vehicles', defaultItem: Staff | Vehicle) => {
    setFormData(prev => ({
      ...prev,
      [listName]: [...(prev[listName] || []), defaultItem],
    }))
  }

  const removeNestedItem = (listName: 'staff' | 'vehicles', index: number) => {
    setFormData(prev => ({
      ...prev,
      [listName]: (prev[listName] || []).filter((_, i) => i !== index),
    }))
  }

  const handleAddStaff = () => {
    addNestedItem('staff', {id: `new_s_${Date.now()}`, name: '', age: 0, gender: '男性', term: ''})
  }

  const handleAddVehicle = () => {
    addNestedItem('vehicles', {id: `new_v_${Date.now()}`, plate: '', term: ''})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const formFooter = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onClose} type="button">
        キャンセル
      </Button>
      <Button type="submit">保存</Button>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? '現場の編集' : '新規現場の登録'} footer={formFooter}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">現場名</label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
          <input
            type="text"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">金額（円）</label>
          <input
            type="number"
            name="amount"
            value={formData.amount || 0}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">施工開始日</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">施工終了日</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        {/* スタッフ・車両の編集UI */}
        <div className="space-y-3 pt-2 border-t">
          {/* 担当スタッフ */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">担当スタッフ</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddStaff}>
                <IconPlus className="w-3 h-3 mr-1" /> 追加
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-md border">
              {formData.staff?.length === 0 && <p className="text-xs text-gray-500 text-center">スタッフがいません</p>}
              {formData.staff?.map((staff, index) => (
                <div key={staff.id || index} className="p-2 bg-white border rounded-md relative">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <input
                      type="text"
                      placeholder="氏名"
                      value={staff.name}
                      onChange={e => handleNestedChange('staff', index, 'name', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="number"
                      placeholder="年齢"
                      value={staff.age}
                      onChange={e => handleNestedChange('staff', index, 'age', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md text-sm"
                    />
                    <select
                      value={staff.gender}
                      onChange={e => handleNestedChange('staff', index, 'gender', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="男性">男性</option>
                      <option value="女性">女性</option>
                      <option value="その他">その他</option>
                    </select>
                    <input
                      type="text"
                      placeholder="期間 (例: YYYY-MM-DD~)"
                      value={staff.term}
                      onChange={e => handleNestedChange('staff', index, 'term', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 w-6 h-6 text-red-500"
                    onClick={() => removeNestedItem('staff', index)}
                  >
                    <IconTrash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* 利用車両 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">利用車両</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddVehicle}>
                <IconPlus className="w-3 h-3 mr-1" /> 追加
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-md border">
              {formData.vehicles?.length === 0 && <p className="text-xs text-gray-500 text-center">車両がありません</p>}
              {formData.vehicles?.map((vehicle, index) => (
                <div key={vehicle.id || index} className="p-2 bg-white border rounded-md relative">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <input
                      type="text"
                      placeholder="プレート番号"
                      value={vehicle.plate}
                      onChange={e => handleNestedChange('vehicles', index, 'plate', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="text"
                      placeholder="期間 (例: YYYY-MM-DD~)"
                      value={vehicle.term}
                      onChange={e => handleNestedChange('vehicles', index, 'term', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 w-6 h-6 text-red-500"
                    onClick={() => removeNestedItem('vehicles', index)}
                  >
                    <IconTrash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}

/**
 * (変更) 取引先マスタ管理ページ
 * @param {Object} props - onNavigate, managers
 */
interface ClientMasterPageProps {
  onNavigate: (page: string, params?: NavigationParams) => void
  managers: any
}

const ClientMasterPage: React.FC<ClientMasterPageProps> = ({onNavigate, managers}) => {
  const {clientManager} = managers
  const {clients, isLoading, error, saveClient, deleteClient} = clientManager
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleOpenModal = (client: Client | null = null) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingClient(null)
    setIsModalOpen(false)
  }

  const handleSave = (clientData: Partial<Client>) => {
    saveClient(clientData)
    handleCloseModal()
  }

  const handleDelete = (clientId: string) => {
    if (window.confirm('この取引先を削除しますか？関連する現場も削除されます。')) {
      deleteClient(clientId)
      // TODO: 関連する現場・書類も削除する
    }
  }

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">取引先マスタ管理</h1>
          <p className="text-sm text-gray-600">取引先の情報を登録・編集します。</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <IconPlus className="w-4 h-4 mr-2" />
          新規取引先を登録
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-3 relative">
        <input
          type="text"
          placeholder="取引先名で検索..."
          className="w-full p-2 pl-8 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* Status */}
      {isLoading && (
        <div className="flex items-center justify-center p-6">
          <IconLoader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-700">読み込み中...</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md flex items-center">
          <IconAlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Client List */}
      {!isLoading && !error && (
        <>
          {filteredClients.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <IconBriefcase className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                {searchTerm ? '検索結果に一致する取引先がありません。' : 'まだ取引先が登録されていません。'}
              </p>
            </div>
          ) : (
            <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {filteredClients.map(client => (
                  <li
                    key={client.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 hover:bg-gray-50"
                  >
                    <div
                      className="font-medium text-blue-700 hover:underline cursor-pointer flex items-center gap-2"
                      onClick={() => onNavigate('siteList', {clientId: client.id})}
                    >
                      <IconBriefcase className="w-4 h-4 text-gray-600" />
                      <span>{client.name}</span>
                    </div>
                    <div className="flex gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                        onClick={() => onNavigate('siteList', {clientId: client.id})}
                      >
                        <span>現場一覧</span>
                        <IconChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal(client)}>
                        <IconEdit2 className="w-3 h-3 mr-1" /> 名称変更
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:border-red-300"
                        onClick={() => handleDelete(client.id)}
                      >
                        <IconTrash2 className="w-3 h-3 mr-1" /> 削除
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* 編集・新規作成モーダル */}
      <ClientForm isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} initialData={editingClient} />
    </div>
  )
}

/**
 * (変更) 現場管理ページ
 * @param {Object} props - onNavigate, params, managers
 */
interface SiteListPageProps {
  onNavigate: (page: string, params?: NavigationParams) => void
  params: NavigationParams
  managers: any
}

const SiteListPage: React.FC<SiteListPageProps> = ({onNavigate, params, managers}) => {
  const {clientId} = params
  const {clientManager, siteManager} = managers

  const client = clientManager.clients.find((c: Client) => c.id === clientId)
  const {sites, getSitesByClientId, saveSite, deleteSite} = siteManager

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)

  if (!client) {
    return (
      <div className="p-4 text-red-600">
        エラー: 該当する取引先が見つかりません。
        <Button variant="link" onClick={() => onNavigate('clientList')}>
          取引先マスタ一覧に戻る
        </Button>
      </div>
    )
  }

  const clientSites = getSitesByClientId(clientId!)

  const handleOpenModal = (site: Site | null = null) => {
    setEditingSite(site)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingSite(null)
    setIsModalOpen(false)
  }

  const handleSave = (siteData: Partial<Site>) => {
    // (変更) clientId を自動で付与
    saveSite({...siteData, clientId: client.id})
    handleCloseModal()
  }

  const handleDelete = (siteId: string) => {
    if (window.confirm('この現場を削除しますか？関連する書類も削除されます。')) {
      deleteSite(siteId)
      // TODO: 関連ドキュメントも削除
    }
  }

  // (追加) カードUIコンポーネント
  interface CardProps {
    children: React.ReactNode
    className?: string
  }
  const Card: React.FC<CardProps> = ({children, className = ''}) => (
    <div className={`bg-white shadow border border-gray-200 rounded-lg ${className}`}>{children}</div>
  )
  const CardHeader: React.FC<CardProps> = ({children, className = ''}) => (
    <div className={`p-3 border-b border-gray-200 ${className}`}>{children}</div>
  )
  const CardContent: React.FC<CardProps> = ({children, className = ''}) => <div className={`p-3 ${className}`}>{children}</div>
  const CardFooter: React.FC<CardProps> = ({children, className = ''}) => (
    <div className={`p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg ${className}`}>{children}</div>
  )

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
        <span onClick={() => onNavigate('clientList')} className="hover:underline cursor-pointer text-blue-600">
          取引先マスタ
        </span>
        <IconChevronRight className="w-3 h-3" />
        <span className="font-medium text-gray-800 truncate">{client.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">現場管理</h1>
          <p className="text-sm text-gray-600">{client.name} に関連する現場一覧</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <IconPlus className="w-4 h-4 mr-2" />
          新規現場を登録
        </Button>
      </div>

      {/* Site List (カード形式に変更) */}
      {clientSites.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <IconBuilding className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">まだ現場が登録されていません。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {clientSites.map(site => (
            <Card key={site.id} className="flex flex-col">
              <CardHeader className="flex justify-between items-start">
                <div>
                  <h3
                    className="font-bold text-blue-700 hover:underline cursor-pointer"
                    onClick={() => onNavigate('documentList', {clientId: client.id, siteId: site.id})}
                  >
                    {site.name}
                  </h3>
                  <p className="text-xs text-gray-500">{site.address}</p>
                </div>
                <div className="relative -top-1 -right-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={e => e.stopPropagation()}>
                    <IconMoreVertical className="w-4 h-4" />
                  </Button>
                  <div className="absolute right-0 mt-1 flex gap-1 bg-white p-1 border rounded shadow-lg">
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleOpenModal(site)}>
                      <IconEdit2 className="w-3 h-3 text-gray-700" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleDelete(site.id)}>
                      <IconTrash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-grow space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <IconWallet className="w-4 h-4 text-gray-500" />
                  <span>{site.amount ? `${site.amount.toLocaleString()} 円` : '金額未設定'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <IconCalendar className="w-4 h-4 text-gray-500" />
                  <span>
                    {site.startDate || '未定'} 〜 {site.endDate || '未定'}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-gray-700">
                  <IconUsers className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <span className="truncate">
                    {site.staff?.length > 0 ? site.staff.map(s => s.name).join(', ') : 'スタッフ未登録'}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-gray-700">
                  <IconTruck className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <span className="truncate">
                    {site.vehicles?.length > 0 ? site.vehicles.map(v => v.plate).join(', ') : '車両未登録'}
                  </span>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => onNavigate('documentList', {clientId: client.id, siteId: site.id})}
                >
                  <span>書類一覧・作成</span>
                  <IconChevronRight className="w-4 h-4 inline-block" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* 現場 編集・新規作成モーダル */}
      <SiteForm isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} initialData={editingSite} />
    </div>
  )
}

/**
 * (変更) 書類管理ページ
 * @param {Object} props - onNavigate, params, managers
 */
interface DocumentListPageProps {
  onNavigate: (page: string, params?: NavigationParams) => void
  params: NavigationParams
  managers: any
}

const DocumentListPage: React.FC<DocumentListPageProps> = ({onNavigate, params, managers}) => {
  const {clientId, siteId} = params
  const {clientManager, siteManager, documentManager} = managers

  const client = clientManager.clients.find((c: Client) => c.id === clientId)
  const site = siteManager.sites.find((s: Site) => s.id === siteId)

  const {documents, getDocumentsBySiteId, saveDocument, deleteDocument} = documentManager

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)

  const [docName, setDocName] = useState('')

  if (!client || !site) {
    return (
      <div className="p-4 text-red-600">
        エラー: 該当する取引先または現場が見つかりません。
        <Button variant="link" onClick={() => onNavigate('clientList')}>
          取引先マスタ一覧に戻る
        </Button>
      </div>
    )
  }

  const siteDocuments = getDocumentsBySiteId(siteId!)

  const handleOpenModal = (doc: Document | null = null) => {
    setEditingDoc(doc)
    setDocName(doc ? doc.name : '')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingDoc(null)
    setIsModalOpen(false)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const docData: Partial<Document> & {siteId: string} = {
      id: editingDoc ? editingDoc.id : undefined,
      siteId: site.id, // (変更) projectId -> siteId
      name: docName,
      items: editingDoc ? editingDoc.items : [],
      pdfTemplateUrl: editingDoc ? editingDoc.pdfTemplateUrl : null,
    }
    const savedDoc = saveDocument(docData)
    handleCloseModal()

    if (!editingDoc) {
      onNavigate('documentEditor', {clientId: client.id, siteId: site.id, documentId: savedDoc.id})
    }
  }

  const handleDelete = (docId: string) => {
    if (window.confirm('この書類を削除しますか？')) {
      deleteDocument(docId)
    }
  }

  const modalFooter = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleCloseModal}>
        キャンセル
      </Button>
      <Button type="submit" form="document-form">
        {editingDoc ? '保存' : '作成して編集'}
      </Button>
    </div>
  )

  return (
    <div className="p-2 sm:p-4 max-w-5xl mx-auto">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-600 mb-2 flex items-center gap-1 flex-wrap">
        <span onClick={() => onNavigate('clientList')} className="hover:underline cursor-pointer text-blue-600">
          取引先マスタ
        </span>
        <IconChevronRight className="w-3 h-3" />
        <span
          onClick={() => onNavigate('siteList', {clientId: client.id})}
          className="hover:underline cursor-pointer text-blue-600 truncate max-w-[150px] sm:max-w-xs"
        >
          {client.name}
        </span>
        <IconChevronRight className="w-3 h-3" />
        <span className="font-medium text-gray-800 truncate">{site.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">書類管理</h1>
          <p className="text-sm text-gray-600">{site.name} に関連する書類一覧</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <IconPlus className="w-4 h-4 mr-2" />
          新規書類を作成
        </Button>
      </div>

      {/* Document List */}
      {siteDocuments.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <IconFileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">まだ書類が作成されていません。</p>
        </div>
      ) : (
        <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {siteDocuments.map(doc => (
              <li
                key={doc.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 hover:bg-gray-50"
              >
                <span
                  className="font-medium text-blue-700 hover:underline cursor-pointer"
                  onClick={() => onNavigate('documentEditor', {clientId: client.id, siteId: site.id, documentId: doc.id})}
                >
                  {doc.name}
                </span>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('documentEditor', {clientId: client.id, siteId: site.id, documentId: doc.id})}
                  >
                    <IconSquarePen className="w-3 h-3 mr-1" /> レイアウト編集
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenModal(doc)}>
                    <IconEdit2 className="w-3 h-3 mr-1" /> 名称変更
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <IconTrash2 className="w-3 h-3 mr-1" /> 削除
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 書類 編集・新規作成モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDoc ? '書類の名称変更' : '新規書類の作成'}
        footer={modalFooter}
      >
        <form id="document-form" onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">現場名</label>
            <input type="text" value={site.name} disabled className="w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
          </div>
          <div>
            <label htmlFor="doc-name" className="block text-sm font-medium text-gray-700 mb-1">
              書類名称
            </label>
            <input
              id="doc-name"
              type="text"
              placeholder="例: 作業員名簿 (様式第5号)"
              value={docName}
              onChange={e => setDocName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}

/**
 * (変更) 書類編集ページ（D&Dエディタ）
 * @param {Object} props - onNavigate, params, managers
 */
interface DocumentEditorPageProps {
  onNavigate: (page: string, params?: NavigationParams) => void
  params: NavigationParams
  managers: any
}

const DocumentEditorPage: React.FC<DocumentEditorPageProps> = ({onNavigate, params, managers}) => {
  const {clientId, siteId, documentId} = params
  const {clientManager, siteManager, documentManager} = managers

  const client = clientManager.clients.find((c: Client) => c.id === clientId)
  const site = siteManager.sites.find((s: Site) => s.id === siteId) // (変更) getSiteById を使用
  const initialDoc = documentManager.getDocumentById(documentId!)

  const {
    document,
    items,
    pdfUrl,
    loading,
    aiLoading,
    pdfRef,
    handlePdfUpload,
    handleDrop,
    handleItemDragEnd,
    removeItem,
    handleAiAnalyze,
    onSave,
    components,
  } = useDocumentEditor(initialDoc, site) // (変更) field -> site

  if (!client || !site || !document) {
    return (
      <div className="p-4 text-red-600">
        エラー: 必要な情報が見つかりません。
        <Button variant="link" onClick={() => onNavigate('clientList')}>
          取引先マスタ一覧に戻る
        </Button>
      </div>
    )
  }

  const onDragStart = (e: React.DragEvent, componentId: string) => {
    e.dataTransfer.setData('text/plain', componentId)
  }

  const componentGroups = components.reduce((acc: Record<string, Component[]>, comp) => {
    const group = comp.group || 'その他'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(comp)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-screen max-h-[100vh]">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-300 p-2 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 max-w-7xl mx-auto">
          <div>
            {/* Breadcrumbs */}
            <div className="text-xs text-gray-500 mb-0.5 flex items-center gap-1 flex-wrap">
              <span onClick={() => onNavigate('clientList')} className="hover:underline cursor-pointer text-blue-600">
                取引先マスタ
              </span>
              <IconChevronRight className="w-3 h-3" />
              <span
                onClick={() => onNavigate('siteList', {clientId: client.id})}
                className="hover:underline cursor-pointer text-blue-600 truncate max-w-[100px]"
              >
                {client.name}
              </span>
              <IconChevronRight className="w-3 h-3" />
              <span
                onClick={() => onNavigate('documentList', {clientId: client.id, siteId: site.id})}
                className="hover:underline cursor-pointer text-blue-600 truncate max-w-[100px]"
              >
                {site.name}
              </span>
            </div>
            <h1 className="text-lg font-bold text-gray-800 truncate">{document.name}</h1>
          </div>

          <div className="flex gap-2 self-end sm:self-center">
            <Button variant="outline" onClick={handleAiAnalyze} disabled={aiLoading || !pdfUrl}>
              {aiLoading ? <IconLoader2 className="w-4 h-4 mr-2 animate-spin" /> : <IconBot className="w-4 h-4 mr-2" />}
              AI自動配置
            </Button>
            <Button variant="outline">
              <IconPrinter className="w-4 h-4 mr-2" />
              印刷プレビュー
            </Button>
            <Button onClick={() => onSave(documentManager.saveDocument)}>
              <IconCheckCircle className="w-4 h-4 mr-2" />
              保存
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex min-h-0">
        {/* Left Sidebar (Components) */}
        <aside className="w-64 bg-white border-r border-gray-300 flex flex-col">
          <div className="p-2 border-b">
            <h3 className="text-sm font-semibold text-gray-700">【部品】リスト</h3>
            <p className="text-xs text-gray-500">現場マスタから部品をドラッグ＆ドロップできます。</p>
          </div>

          <div className="flex-grow overflow-y-auto p-2 space-y-3">
            {Object.entries(componentGroups).map(([groupName, comps]) => (
              <div key={groupName}>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">{groupName}</h4>
                <div className="space-y-1">
                  {comps.map(comp => (
                    <div
                      key={comp.id}
                      draggable
                      onDragStart={e => onDragStart(e, comp.id)}
                      className="flex items-center gap-1.5 p-1.5 bg-gray-50 border border-gray-200 rounded-md cursor-grab active:cursor-grabbing active:bg-blue-50"
                    >
                      <IconGripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-medium text-gray-800 block truncate">{comp.label}</span>
                        <span className="text-xs text-gray-500 block truncate">{comp.value || '(値なし)'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Canvas (PDF Editor) */}
        <main className="flex-grow bg-gray-200 p-4 overflow-auto" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
          <div className="max-w-4xl mx-auto">
            {!pdfUrl ? (
              <PdfUploadZone onPdfUpload={handlePdfUpload} loading={loading} />
            ) : (
              <div
                ref={pdfRef}
                className="relative w-full aspect-[210/297] bg-white shadow-lg border border-gray-400"
                style={{
                  backgroundImage: `url(${pdfUrl})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              >
                {items.map((item, index) => (
                  <PlacedItem
                    key={index}
                    item={item}
                    index={index}
                    onDragEnd={handleItemDragEnd}
                    onRemove={removeItem}
                    getComponentValue={id => getComponentValue(id, site)} // (変更) field -> site
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * PDFアップロードゾーン
 */
interface PdfUploadZoneProps {
  onPdfUpload: (file: File) => void
  loading: boolean
}

const PdfUploadZone: React.FC<PdfUploadZoneProps> = ({onPdfUpload, loading}) => {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onPdfUpload(e.dataTransfer.files[0])
    }
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onPdfUpload(e.target.files[0])
    }
  }

  return (
    <div
      className={`flex flex-col items-center justify-center w-full aspect-[210/297] max-w-4xl mx-auto rounded-lg border-2 border-dashed
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-400 bg-gray-50'}
        transition-colors`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={inputRef}
        accept="application/pdf, image/png, image/jpeg"
        className="hidden"
        onChange={handleChange}
      />
      {loading ? (
        <>
          <IconLoader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="mt-2 text-sm text-gray-600">アップロード中...</p>
        </>
      ) : (
        <>
          <IconUploadCloud className="w-10 h-10 text-gray-500" />
          <p className="mt-2 text-sm text-gray-600">【下地】ファイル (PDF or 画像) をドラッグ＆ドロップ</p>
          <p className="text-xs text-gray-500 mb-2">または</p>
          <Button variant="secondary" onClick={() => inputRef.current?.click()}>
            ファイルを選択
          </Button>
          <p className="mt-3 text-xs text-gray-500 px-4 text-center">
            現在、画像(PNG/JPG)は下地として表示できます。PDFはAI分析（将来）のためにアップロードできますが、表示されません。
          </p>
        </>
      )}
    </div>
  )
}

/**
 * 配置されたアイテム
 */
interface PlacedItemProps {
  item: DocumentItem
  index: number
  onDragEnd: (index: number, e: React.DragEvent) => void
  onRemove: (index: number) => void
  getComponentValue: (componentId: string) => any
}

const PlacedItem: React.FC<PlacedItemProps> = ({item, index, onDragEnd, onRemove, getComponentValue}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(item.value || getComponentValue(item.componentId))

  const handleDragEnd = (e: React.DragEvent) => {
    onDragEnd(index, e)
  }

  return (
    <div
      className="absolute p-0.5 border border-transparent hover:border-blue-500 hover:z-10 cursor-move group"
      style={{left: `${item.x}px`, top: `${item.y}px`}}
      draggable
      onDragEnd={handleDragEnd}
    >
      <span className="text-sm bg-white bg-opacity-80 px-1 py-0.5 whitespace-nowrap">{value}</span>
      <button
        onClick={() => onRemove(index)}
        className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-700"
      >
        <IconX className="w-3 h-3" />
      </button>
      {/* TODO: 値の編集機能 */}
    </div>
  )
}

// --- メインコンポーネント (App) ---

/**
 * ナビゲーションとページルーター
 */
interface NavigationState {
  page: string
  params: NavigationParams
}

export default function App() {
  const [navigation, setNavigation] = useState<NavigationState>({
    page: 'clientList', // (変更) 'clientList', 'siteList', 'documentList', 'documentEditor'
    params: {},
  })

  // 各マネージャー（カスタムフック）を一元管理
  const clientManager = useClientManager(SAMPLE_CLIENTS) // (変更)
  const siteManager = useSiteManager(SAMPLE_SITES) // (変更)
  const documentManager = useDocumentManager(SAMPLE_DOCUMENTS)

  const managers = {
    clientManager,
    siteManager,
    documentManager,
  }

  const handleNavigate = (page: string, params: NavigationParams = {}) => {
    setNavigation({page, params})
  }

  const renderPage = () => {
    const {page, params} = navigation

    switch (page) {
      case 'clientList': // (変更)
        return <ClientMasterPage onNavigate={handleNavigate} managers={managers} />
      case 'siteList': // (変更)
        return <SiteListPage onNavigate={handleNavigate} params={params} managers={managers} />
      case 'documentList':
        return <DocumentListPage onNavigate={handleNavigate} params={params} managers={managers} />
      case 'documentEditor':
        return <DocumentEditorPage onNavigate={handleNavigate} params={params} managers={managers} />
      default:
        return <div className="p-4 text-red-600">ページが見つかりません。</div>
    }
  }

  return <div className="bg-gray-100 min-h-screen font-sans">{renderPage()}</div>
}
