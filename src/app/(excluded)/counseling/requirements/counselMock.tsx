/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

'use client'

// 💡「こちらはモックであり、単一ファイルに収まるよう構築されています。このページは最終的に削除するため、本番プロジェクトでは、プロジェクトの設計やルールに従ってページやコンポーントを分割してください」。

import React, {useState, useMemo, useCallback} from 'react'

// --- グローバルデータ定義 ---
const SAMPLE_STORES_DATA = [
  {id: 1, name: '大阪店'},
  {id: 2, name: '名古屋店'},
]
const SAMPLE_ROOMS_DATA = [
  {id: 101, name: '510号室', storeId: 1},
  {id: 102, name: '512号室', storeId: 1},
  {id: 201, name: 'Aルーム', storeId: 2},
]
const SAMPLE_COUNSELORS_DATA = [
  {id: 1, name: '田中 優子', storeId: 1, role: '管理者', email: 'tanaka@example.com'},
  {id: 2, name: '鈴木 一郎', storeId: 1, role: '一般', email: 'suzuki@example.com'},
  {id: 3, name: '佐藤 花子', storeId: 2, role: '一般', email: 'sato@example.com'},
]
const SAMPLE_CLIENTS_DATA = [
  {id: 1, name: '山田 太郎', phone: '090-1234-5678', visitCount: 3, cancelCount: 0},
  {id: 2, name: '高橋 良子', phone: '080-9876-5432', visitCount: 0, cancelCount: 0},
  {id: 3, name: '伊藤 健太', phone: '070-1111-2222', visitCount: 5, cancelCount: 1},
]
const INITIAL_RESERVATIONS_DATA = [
  {
    id: 'res-1',
    clientId: 2,
    status: 'unassigned',
    createdAt: new Date(2025, 9, 15, 10, 0),
    preferredDate: '2025-10-20',
    notes: '初めての利用です。',
    paymentMethod: null,
  },
  {
    id: 'res-2',
    clientId: 3,
    status: 'unassigned',
    createdAt: new Date(2025, 9, 16, 14, 0),
    preferredDate: '2025-10-22',
    notes: '仕事のストレスについて。',
    paymentMethod: null,
  },
  {
    id: 'res-3',
    clientId: 1,
    status: 'confirmed',
    slotId: 'slot-20251018-101-1000',
    createdAt: new Date(2025, 9, 10, 11, 0),
    notes: '前回の続き',
    paymentMethod: null,
  },
  {
    id: 'res-4',
    clientId: 2,
    status: 'canceled',
    slotId: 'slot-20251006-101-1100',
    createdAt: new Date(2025, 9, 1, 10, 0),
    notes: '体調不良のためキャンセル',
    paymentMethod: null,
  },
  {
    id: 'res-5',
    clientId: 3,
    status: 'confirmed',
    slotId: 'slot-20251021-101-1000',
    createdAt: new Date(2025, 9, 18, 15, 0),
    notes: '定期カウンセリング',
    paymentMethod: null,
  },
  {
    id: 'res-6',
    clientId: 1,
    status: 'completed',
    slotId: 'slot-20250920-101-1000',
    createdAt: new Date(2025, 8, 18, 15, 0),
    notes: '完了済みのテスト',
    paymentMethod: 'カード',
  },
  {
    id: 'res-7',
    clientId: 2,
    status: 'confirmed',
    slotId: 'slot-20251021-102-1400',
    createdAt: new Date(2025, 9, 19, 10, 0),
    notes: '鈴木さんの予約',
    paymentMethod: null,
  },
]
const INITIAL_SLOTS_DATA = [
  {
    id: 'slot-20250920-101-1000',
    roomId: 101,
    storeId: 1,
    counselorId: 1,
    start: new Date(2025, 8, 20, 10, 0),
    end: new Date(2025, 8, 20, 11, 0),
  },
  {
    id: 'slot-20251005-101-1000',
    roomId: 101,
    storeId: 1,
    counselorId: 1,
    start: new Date(2025, 9, 5, 10, 0),
    end: new Date(2025, 9, 5, 11, 0),
  },
  {
    id: 'slot-20251006-101-1100',
    roomId: 101,
    storeId: 1,
    counselorId: 1,
    start: new Date(2025, 9, 6, 11, 0),
    end: new Date(2025, 9, 6, 12, 0),
  },
  {
    id: 'slot-20251008-101-1000',
    roomId: 101,
    storeId: 1,
    counselorId: 2,
    start: new Date(2025, 9, 8, 10, 0),
    end: new Date(2025, 9, 8, 11, 0),
  },
  {
    id: 'slot-20251009-201-1300',
    roomId: 201,
    storeId: 2,
    counselorId: 3,
    start: new Date(2025, 9, 9, 13, 0),
    end: new Date(2025, 9, 9, 14, 0),
  },
  {
    id: 'slot-20251018-101-1000',
    roomId: 101,
    storeId: 1,
    counselorId: 1,
    start: new Date(2025, 9, 18, 10, 0),
    end: new Date(2025, 9, 18, 11, 0),
  },
  {
    id: 'slot-20251019-101-1100',
    roomId: 101,
    storeId: 1,
    counselorId: null,
    start: new Date(2025, 9, 19, 11, 0),
    end: new Date(2025, 9, 19, 12, 0),
  },
  {
    id: 'slot-20251021-101-1000',
    roomId: 101,
    storeId: 1,
    counselorId: 2,
    start: new Date(2025, 9, 21, 10, 0),
    end: new Date(2025, 9, 21, 11, 0),
  },
  {
    id: 'slot-20251021-102-1400',
    roomId: 102,
    storeId: 1,
    counselorId: 2,
    start: new Date(2025, 9, 21, 14, 0),
    end: new Date(2025, 9, 21, 15, 0),
  },
]

// --- 型定義 (JSDoc) ---
/** @typedef {object} Store @property {number} id @property {string} name */
/** @typedef {object} Room @property {number} id @property {string} name @property {number} storeId */
/** @typedef {object} Counselor @property {number} id @property {string} name @property {number} storeId @property {'管理者' | '一般'} role @property {string} email */
/** @typedef {object} Client @property {number} id @property {string} name @property {string} phone @property {number} visitCount @property {number} cancelCount */
/** @typedef {object} Reservation @property {string} id @property {number} clientId @property {'unassigned' | 'confirmed' | 'completed' | 'canceled'} status @property {Date} createdAt @property {string | null} slotId @property {string} [preferredDate] @property {string} [notes] @property {string | null} [paymentMethod] */
/** @typedef {object} AvailabilitySlot @property {string} id @property {number} roomId @property {number} storeId @property {number | null} counselorId @property {Date} start @property {Date} end */

// --- アイコンコンポーネント ---
const ChevronLeftIcon = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
)
const ChevronRightIcon = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
)
const XIcon = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)
const PlusIcon = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
)
const TrashIcon = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)
const EditIcon = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
)
const CheckCircleIcon = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
const UserIcon = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const BuildingIcon = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
)
const DoorOpenIcon = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 4h3a2 2 0 0 1 2 2v14" />
    <path d="M2 20h3" />
    <path d="M13 20h9" />
    <path d="M10 12v.01" />
    <path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a1 1 0 0 1 1.242-.97Z" />
  </svg>
)
const UsersIcon = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const CheckIcon = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const CalendarIcon = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
)

// ===================================================================================
// 予約フォームページ (ReservationFormPage)
// ===================================================================================
export const ReservationFormPage = ({reservations, slots, stores}) => {
  // ... This component is largely unchanged. A store selector has been added. ...
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    storeId: stores[0]?.id || '',
    date: null,
    time: '',
    visitCount: 'new',
    name: '',
    furigana: '',
    email: '',
    phone: '',
    contactMethod: 'email',
    gender: '',
    age: '',
    visitorType: '1',
    prefecture: '大阪府',
    address: '',
    topics: [],
    notes: '',
    agreement1: false,
    agreement2: false,
  })

  const today = useMemo(() => {
    const mockToday = new Date(2025, 9, 1)
    const d = new Date(mockToday)
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const bookedSlotIds = useMemo(() => new Set(reservations.map(r => r.slotId)), [reservations])

  const availableSlots = useMemo(
    () => slots.filter(slot => !bookedSlotIds.has(slot.id) && slot.storeId === Number(formData.storeId)),
    [slots, bookedSlotIds, formData.storeId]
  )

  const availableDates = useMemo(
    () => new Set(availableSlots.map(slot => slot.start.toISOString().split('T')[0])),
    [availableSlots]
  )

  const availableTimesForSelectedDate = useMemo(() => {
    if (!formData.date) return []
    const selectedDateStr = formData.date.toISOString().split('T')[0]
    return availableSlots
      .filter(slot => slot.start.toISOString().startsWith(selectedDateStr))
      .map(slot => slot.start.toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'}))
      .sort()
  }, [formData.date, availableSlots])

  // --- Handlers ---
  const handleDateChange = date => setFormData(prev => ({...prev, date, time: ''}))
  const handleTimeChange = time => setFormData(prev => ({...prev, time}))

  const handleFormInputChange = e => {
    const {name, value, type, checked} = e.target
    if (name === 'topics') {
      const newTopics = checked ? [...formData.topics, value] : formData.topics.filter(t => t !== value)
      setFormData(prev => ({...prev, topics: newTopics}))
    } else if (type === 'checkbox') {
      setFormData(prev => ({...prev, [name]: checked}))
    } else {
      setFormData(prev => ({...prev, [name]: value}))
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!formData.agreement1 || !formData.agreement2) {
      // In a real app, use a custom modal instead of alert
      console.error('ご確認事項に同意してください。')
      return
    }
    console.log('予約申し込みデータ:', formData)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ご予約ありがとうございます</h1>
          <p className="text-gray-600">予約確定のご連絡をメールにてお送りいたしますので、今しばらくお待ちください。</p>
        </div>
      </div>
    )
  }

  // --- Sub Components ---
  const FormRow = ({label, required = false, children}) => (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] border-t border-gray-200">
      <div className="bg-gray-50 p-3 font-semibold text-sm flex items-center">
        {label}
        {required && <span className="text-red-500 text-xs ml-2">必須</span>}
      </div>
      <div className="p-3">{children}</div>
    </div>
  )

  const Calendar = ({onDateChange, selectedDate, availableDates, today}) => {
    const [viewDate, setViewDate] = useState(new Date(today))
    const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const days = []
    const startDayOfWeek = startOfMonth.getDay()
    const startDate = new Date(startOfMonth)
    startDate.setDate(startDate.getDate() - startDayOfWeek)

    for (let i = 0; i < 35; i++) {
      days.push(new Date(startDate))
      startDate.setDate(startDate.getDate() + 1)
    }

    const changeMonth = offset => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1))
    const isSameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()

    return (
      <div className="border border-gray-200">
        <div className="flex justify-between items-center p-2 bg-gray-50">
          <button onClick={() => changeMonth(-1)} className="p-1 rounded hover:bg-gray-200">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="font-bold text-md">{`${viewDate.getFullYear()}年 ${viewDate.getMonth() + 1}月`}</span>
          <button onClick={() => changeMonth(1)} className="p-1 rounded hover:bg-gray-200">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <table className="w-full text-center">
          <thead>
            <tr className="bg-gray-100">
              {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                <th key={day} className="py-1 text-xs font-normal border-l border-gray-200 first:border-l-0">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({length: 5}).map((_, weekIndex) => (
              <tr key={weekIndex}>
                {days.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => {
                  const isCurrentMonth = day.getMonth() === viewDate.getMonth()
                  const isPast = day < today && !isSameDay(day, today)
                  const dateStr = day.toISOString().split('T')[0]
                  const isSelectable = availableDates.has(dateStr) && !isPast && isCurrentMonth
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  return (
                    <td key={dayIndex} className="border-t border-l border-gray-200 first:border-l-0 py-0.5">
                      {!isCurrentMonth ? (
                        <div className="text-gray-300">{day.getDate()}</div>
                      ) : (
                        <button
                          onClick={() => onDateChange(day)}
                          disabled={!isSelectable}
                          className={`w-full h-full flex flex-col items-center justify-center p-1 text-sm ${isSelected ? 'bg-blue-100' : ''} ${isSelectable ? 'cursor-pointer hover:bg-blue-50' : 'text-gray-400'}`}
                        >
                          <span>{day.getDate()}</span>
                          {isSelectable && <span className="text-lg text-cyan-500">○</span>}
                        </button>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // --- Render Data ---
  const consultationTopics = [
    '夫婦関係',
    '恋愛問題',
    '家族問題',
    '親子問題',
    '離婚問題',
    '職場関係',
    'セクハラ',
    'パワハラ',
    '自己肯定感',
    'トラウマ',
    'うつ',
    '不安症',
    'パニック障害',
    'PTSD',
    '摂食障害',
    '依存症',
    'HSP',
    'ひきこもり',
    '性の違和',
    '共依存',
    'アダルトチルドレン',
    '発達障害',
    '愛着障害',
    'パーソナリティ障害',
    '感情のコントロール',
    'コミュニケーション能力',
    '仕事の悩み',
    '子育て',
    'ママ友関係',
    'ギャンブル依存',
    'アルコール依存',
    'その他',
  ]
  const prefectures = [
    '北海道',
    '青森県',
    '岩手県',
    '宮城県',
    '秋田県',
    '山形県',
    '福島県',
    '茨城県',
    '栃木県',
    '群馬県',
    '埼玉県',
    '千葉県',
    '東京都',
    '神奈川県',
    '新潟県',
    '富山県',
    '石川県',
    '福井県',
    '山梨県',
    '長野県',
    '岐阜県',
    '静岡県',
    '愛知県',
    '三重県',
    '滋賀県',
    '京都府',
    '大阪府',
    '兵庫県',
    '奈良県',
    '和歌山県',
    '鳥取県',
    '島根県',
    '岡山県',
    '広島県',
    '山口県',
    '徳島県',
    '香川県',
    '愛媛県',
    '高知県',
    '福岡県',
    '佐賀県',
    '長崎県',
    '熊本県',
    '大分県',
    '宮崎県',
    '鹿児島県',
    '沖縄県',
  ]

  return (
    <div className="bg-gray-100 min-h-screen p-2 sm:p-4 lg:p-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200">
        <h1 className="text-xl font-bold text-center text-white bg-[#2d8593] py-2">ご予約フォーム</h1>
        <form onSubmit={handleSubmit}>
          <FormRow label="店舗選択" required>
            <select
              name="storeId"
              value={formData.storeId}
              onChange={handleFormInputChange}
              className="max-w-xs w-full p-2 border border-gray-300 rounded-sm"
            >
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </FormRow>
          <FormRow label="ご予約日時" required>
            <p className="text-xs text-gray-500 mb-2">カレンダーの日付を押すと空き時間が表示されます</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Calendar
                onDateChange={handleDateChange}
                selectedDate={formData.date}
                availableDates={availableDates}
                today={today}
              />
              <div>
                {formData.date && (
                  <div>
                    <h3 className="font-semibold text-center mb-2">{formData.date.toLocaleDateString('ja-JP')}の空き状況</h3>
                    {availableTimesForSelectedDate.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableTimesForSelectedDate.map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => handleTimeChange(time)}
                            className={`p-2 rounded-md text-sm border ${formData.time === time ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white hover:bg-cyan-50'}`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 mt-8">選択した日付に空きがありません。</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </FormRow>
          <FormRow label="ご予約回数" required>
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visitCount"
                  value="new"
                  checked={formData.visitCount === 'new'}
                  onChange={handleFormInputChange}
                  className="mr-2"
                />{' '}
                初めてのご予約
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visitCount"
                  value="repeat"
                  checked={formData.visitCount === 'repeat'}
                  onChange={handleFormInputChange}
                  className="mr-2"
                />{' '}
                2回目以降のご予約
              </label>
            </div>
          </FormRow>
          <FormRow label="お名前" required>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormInputChange}
              className="w-full max-w-sm p-2 border border-gray-300 rounded-sm"
              required
            />
          </FormRow>
          <FormRow label="ふりがな" required>
            <input
              type="text"
              name="furigana"
              value={formData.furigana}
              onChange={handleFormInputChange}
              className="w-full max-w-sm p-2 border border-gray-300 rounded-sm"
              required
            />
          </FormRow>
          <FormRow label="メールアドレス" required>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormInputChange}
              className="w-full max-w-sm p-2 border border-gray-300 rounded-sm"
              required
            />
          </FormRow>
          <FormRow label="お電話番号" required>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleFormInputChange}
              className="w-full max-w-sm p-2 border border-gray-300 rounded-sm"
              required
            />
          </FormRow>
          <FormRow label="ご連絡方法">
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contactMethod"
                  value="email"
                  checked={formData.contactMethod === 'email'}
                  onChange={handleFormInputChange}
                  className="mr-2"
                />{' '}
                メール
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contactMethod"
                  value="phone"
                  checked={formData.contactMethod === 'phone'}
                  onChange={handleFormInputChange}
                  className="mr-2"
                />{' '}
                お電話
              </label>
            </div>
          </FormRow>
          <FormRow label="性別">
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleFormInputChange}
                  className="mr-2"
                />{' '}
                男性
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleFormInputChange}
                  className="mr-2"
                />{' '}
                女性
              </label>
            </div>
          </FormRow>
          <FormRow label="年齢">
            <select
              name="age"
              value={formData.age}
              onChange={handleFormInputChange}
              className="max-w-xs w-full p-2 border border-gray-300 rounded-sm"
            >
              <option value="">選択してください</option>
              <option>10代</option>
              <option>20代</option>
              <option>30代</option>
              <option>40代</option>
              <option>50代</option>
              <option>60代以上</option>
            </select>
          </FormRow>
          <FormRow label="来られる方" required>
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visitorType"
                  value="1"
                  checked={formData.visitorType === '1'}
                  onChange={handleFormInputChange}
                  className="mr-2"
                />{' '}
                1人
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visitorType"
                  value="2"
                  checked={formData.visitorType === '2'}
                  onChange={handleFormInputChange}
                  className="mr-2"
                />{' '}
                2人
              </label>
            </div>
          </FormRow>
          <FormRow label="都道府県">
            <select
              name="prefecture"
              value={formData.prefecture}
              onChange={handleFormInputChange}
              className="max-w-xs w-full p-2 border border-gray-300 rounded-sm"
            >
              {prefectures.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </FormRow>
          <FormRow label="ご住所">
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleFormInputChange}
              placeholder="市区町村まで結構です"
              className="w-full max-w-md p-2 border border-gray-300 rounded-sm"
            />
          </FormRow>
          <FormRow label="ご相談内容">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
              {consultationTopics.map(topic => (
                <label key={topic} className="flex items-center font-normal">
                  <input
                    type="checkbox"
                    name="topics"
                    value={topic}
                    checked={formData.topics.includes(topic)}
                    onChange={handleFormInputChange}
                    className="mr-2"
                  />
                  {topic}
                </label>
              ))}
            </div>
          </FormRow>
          <FormRow label="備考">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleFormInputChange}
              rows="5"
              className="w-full p-2 border border-gray-300 rounded-sm"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">200文字までご入力頂けます。</p>
          </FormRow>
          <FormRow label="申込経緯について">
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                お申込みいただきますと、ご入力いただいたメールアドレスへ自動返信メールが届きます。その後、何らかの理由により予約が確定できない場合にのみ、改めてご連絡をさせていただきます。しばらくしてもメールが届かない場合は恐れ入りますがお電話にてご連絡をお願いいたします。上記に同意していただける場合はチェックをお願いします。
              </p>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="agreement1"
                  checked={formData.agreement1}
                  onChange={handleFormInputChange}
                  className="mr-2"
                />{' '}
                同意します
              </label>
            </div>
          </FormRow>
          <div className="border-t border-gray-200">
            <FormRow label="予約確認事項">
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  予約日まで期間が長い場合（5日間以上）は、3〜4日前に最終確認のメール・お電話をさせていいただきます。最終確認のメールを送信後、24時間以内にお返事をいただけなかった場合は、キャンセルと判断させていただきます事を予めご了承ください。同意していただける場合はチェックをお願いします。
                </p>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="agreement2"
                    checked={formData.agreement2}
                    onChange={handleFormInputChange}
                    className="mr-2"
                  />{' '}
                  同意します
                </label>
              </div>
            </FormRow>
          </div>
          <div className="p-4 bg-white text-center">
            <button
              type="submit"
              className="bg-[#2d8593] text-white font-bold py-2 px-10 rounded-md hover:opacity-90 transition-opacity"
            >
              予約を申し込む
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ===================================================================================
// スケジュール管理ページ (SchedulePage)
// ===================================================================================
const useScheduleManager = ({rooms, reservations, slots, onReservationsChange, onSlotsChange}) => {
  // ... This hook is unchanged ...
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [isSlotDetailModalOpen, setIsSlotDetailModalOpen] = useState(false)
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false)
  const assignReservationToSlot = useCallback(
    (reservationId, slotId) => {
      onReservationsChange(prev => prev.map(r => (r.id === reservationId ? {...r, status: 'confirmed', slotId: slotId} : r)))
      setIsSlotDetailModalOpen(false)
      setSelectedSlot(null)
    },
    [onReservationsChange]
  )
  const updateSlot = useCallback(
    (slotId, newCounselorId) => {
      onSlotsChange(prev => prev.map(s => (s.id === slotId ? {...s, counselorId: newCounselorId} : s)))
      setIsSlotDetailModalOpen(false)
      setSelectedSlot(null)
    },
    [onSlotsChange]
  )
  const cancelReservationToUnassigned = useCallback(
    reservationId => {
      onReservationsChange(prev => prev.map(r => (r.id === reservationId ? {...r, status: 'unassigned', slotId: null} : r)))
      setIsSlotDetailModalOpen(false)
      setSelectedSlot(null)
    },
    [onReservationsChange]
  )
  const cancelReservationPermanently = useCallback(
    reservationId => {
      onReservationsChange(prev => prev.map(r => (r.id === reservationId ? {...r, status: 'canceled', slotId: null} : r)))
      setIsSlotDetailModalOpen(false)
      setSelectedSlot(null)
    },
    [onReservationsChange]
  )
  const deleteSlot = useCallback(
    slotId => {
      if (reservations.some(r => r.slotId === slotId && r.status === 'confirmed')) {
        console.error('予約が紐付いているため、このスロットは削除できません。')
        return
      }
      onSlotsChange(prev => prev.filter(s => s.id !== slotId))
      setIsSlotDetailModalOpen(false)
      setSelectedSlot(null)
    },
    [reservations, onSlotsChange]
  )
  const revertCanceledReservation = useCallback(
    reservationId => {
      onReservationsChange(prev => prev.map(r => (r.id === reservationId ? {...r, status: 'unassigned'} : r)))
    },
    [onReservationsChange]
  )
  const openSlotDetailModal = useCallback(slot => {
    setSelectedSlot(slot)
    setIsSlotDetailModalOpen(true)
  }, [])
  const closeSlotDetailModal = useCallback(() => {
    setIsSlotDetailModalOpen(false)
    setSelectedSlot(null)
  }, [])
  const openAddSlotModal = useCallback(() => setIsAddSlotModalOpen(true), [])
  const closeAddSlotModal = useCallback(() => setIsAddSlotModalOpen(false), [])
  const addSlots = useCallback(
    formData => {
      const {roomId, counselorId, startDate, endDate, weekdays, startTime, endTime, duration} = formData
      const generatedSlots = []
      const currentDate = new Date(startDate)
      const finalDate = new Date(endDate)
      const [startHour, startMinute] = startTime.split(':').map(Number)
      const [endHour, endMinute] = endTime.split(':').map(Number)
      while (currentDate <= finalDate) {
        if (weekdays[currentDate.getDay()]) {
          const slotTime = new Date(currentDate)
          slotTime.setHours(startHour, startMinute, 0, 0)
          const endOfDay = new Date(currentDate)
          endOfDay.setHours(endHour, endMinute, 0, 0)
          while (slotTime < endOfDay) {
            const slotEnd = new Date(slotTime.getTime() + duration * 60000)
            if (slotEnd > endOfDay) break
            const room = rooms.find(r => r.id === Number(roomId))
            const newSlot = {
              id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              roomId: Number(roomId),
              storeId: room ? room.storeId : null,
              counselorId: counselorId ? Number(counselorId) : null,
              start: new Date(slotTime.getTime()),
              end: slotEnd,
            }
            if (
              !slots.some(
                existingSlot =>
                  existingSlot.roomId === newSlot.roomId && existingSlot.start < newSlot.end && existingSlot.end > newSlot.start
              )
            ) {
              generatedSlots.push(newSlot)
            }
            slotTime.setTime(slotEnd.getTime())
          }
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
      if (generatedSlots.length > 0) {
        onSlotsChange(prev => [...prev, ...generatedSlots].sort((a, b) => a.start - b.start))
      }
      closeAddSlotModal()
    },
    [rooms, slots, onSlotsChange, closeAddSlotModal]
  )
  return {
    state: {selectedSlot, isSlotDetailModalOpen, isAddSlotModalOpen},
    actions: {
      assignReservationToSlot,
      updateSlot,
      cancelReservationToUnassigned,
      cancelReservationPermanently,
      deleteSlot,
      revertCanceledReservation,
      openSlotDetailModal,
      closeSlotDetailModal,
      openAddSlotModal,
      closeAddSlotModal,
      addSlots,
    },
  }
}
const FilterPanel = ({stores, rooms, selectedStoreId, onStoreChange, selectedRoomIds, onRoomChange}) => {
  const filteredRooms = rooms.filter(room => room.storeId === selectedStoreId)
  return (
    <div className="bg-white p-2 rounded-lg shadow space-y-3 h-full">
      <h3 className="font-bold text-sm text-gray-700">絞り込み</h3>
      <div>
        <label htmlFor="store-select" className="block text-xs font-medium text-gray-600 mb-1">
          店舗
        </label>
        <select
          id="store-select"
          className="w-full p-1 border border-gray-300 rounded-md text-xs"
          value={selectedStoreId}
          onChange={e => onStoreChange(Number(e.target.value))}
        >
          {stores.map(store => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p className="block text-xs font-medium text-gray-600 mb-1">部屋</p>
        <div className="space-y-1">
          {filteredRooms.map(room => (
            <div key={room.id} className="flex items-center">
              <input
                type="checkbox"
                id={`room-${room.id}`}
                className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={selectedRoomIds.includes(room.id)}
                onChange={() => onRoomChange(room.id)}
              />
              <label htmlFor={`room-${room.id}`} className="ml-2 text-xs text-gray-700">
                {room.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
const ReservationsSidebar = ({unassignedReservations, confirmedReservations, canceledReservations, onRevertCanceled}) => (
  <div className="bg-white p-2 rounded-lg shadow h-full flex flex-col">
    <div className="flex-shrink-0">
      <h3 className="font-bold text-sm text-gray-700 mb-2 shrink-0">未対応の予約 ({unassignedReservations.length})</h3>
      {unassignedReservations.length === 0 ? (
        <div className="flex items-center justify-center py-2">
          <p className="text-xs text-gray-500">未対応の予約はありません。</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {unassignedReservations.map(res => (
            <div key={res.id} className="bg-orange-50 border border-orange-200 p-2 rounded-md">
              <p className="font-bold text-xs text-gray-800">{res.client.name}様</p>
              <p className="text-xs text-gray-600 mt-1">希望日: {res.preferredDate || '指定なし'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
    <div className="border-t my-2"></div>
    <div className="flex-shrink-0">
      <h3 className="font-bold text-sm text-gray-700 mb-2 shrink-0">確定済みの予約 ({confirmedReservations.length})</h3>
      {confirmedReservations.length === 0 ? (
        <div className="flex items-center justify-center py-2">
          <p className="text-xs text-gray-500">確定済みの予約はありません。</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {confirmedReservations.map(res => (
            <div key={res.id} className="bg-blue-50 border border-blue-200 p-2 rounded-md">
              <p className="font-bold text-xs text-gray-800">{res.client.name}様</p>
              <p className="text-xs text-gray-600 mt-1">
                {res.slot.start.toLocaleString('ja-JP', {month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
    <div className="border-t my-2"></div>
    <div className="flex-grow flex flex-col min-h-0">
      <h3 className="font-bold text-sm text-gray-700 mb-2 shrink-0">キャンセル済みの予約 ({canceledReservations.length})</h3>
      {canceledReservations.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xs text-gray-500">キャンセル済みの予約はありません。</p>
        </div>
      ) : (
        <div className="overflow-y-auto space-y-2 pr-1">
          {canceledReservations.map(res => (
            <button
              key={res.id}
              onClick={() => onRevertCanceled(res.id)}
              className="w-full text-left bg-gray-100 border border-gray-200 p-2 rounded-md opacity-80 hover:opacity-100 hover:border-gray-400 transition-all"
            >
              <p className="font-bold text-xs text-gray-600 line-through">{res.client.name}様</p>
              <p className="text-xs text-gray-500 mt-1">
                {res.createdAt.toLocaleString('ja-JP', {month: 'numeric', day: 'numeric'})} キャンセル
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
)
const TimeSlot = ({slot, onClick}) => {
  // ... This component is unchanged ...
  const {reservation, counselor, client} = slot
  let content
  const baseClasses = 'w-full h-full p-1 rounded-md text-left text-xs cursor-pointer transition-colors duration-200'
  let stateClasses = 'bg-green-100 hover:bg-green-200 border border-green-200'
  if (reservation) {
    stateClasses = 'bg-blue-200 hover:bg-blue-300 border border-blue-300'
    content = (
      <>
        <div className="font-bold truncate">{client?.name}様</div>
        <div className="truncate text-gray-600">{counselor?.name || '担当未定'}</div>
      </>
    )
  } else {
    content = (
      <>
        <div className="font-bold">空き枠</div>
        <div className="truncate text-gray-600">{counselor?.name || '担当未定'}</div>
      </>
    )
  }
  return (
    <button onClick={onClick} className={`${baseClasses} ${stateClasses}`}>
      {content}
    </button>
  )
}
const ScheduleCalendar = ({currentDate, displayRooms, slots, onSlotClick}) => {
  // ... This component is unchanged ...
  const hours = Array.from({length: 12}, (_, i) => i + 9)
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const dates = Array.from({length: daysInMonth}, (_, i) => {
    const date = new Date(startOfMonth)
    date.setDate(i + 1)
    return date
  })
  const getSlotForCell = (roomId, date, hour) => {
    const targetTime = new Date(date)
    targetTime.setHours(hour, 0, 0, 0)
    return slots.find(
      slot => slot.roomId === roomId && slot.start >= targetTime && slot.start < new Date(targetTime.getTime() + 60 * 60 * 1000)
    )
  }
  if (displayRooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-lg shadow">
        <p className="text-gray-500">表示する部屋を選択してください。</p>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-lg shadow overflow-auto h-full">
      <div className="sticky top-0 bg-white z-10">
        <div className={`grid grid-cols-[80px_repeat(${daysInMonth},minmax(120px,1fr))]`}>
          <div className="row-start-2 p-1 border-b border-r text-xs font-bold text-center sticky left-0 bg-gray-50">部屋</div>
          {dates.map(date => (
            <div key={date.toISOString()} className="p-1 border-b text-center text-xs">
              <span className="font-bold">{date.getDate()}</span>
              <span className="ml-1 text-gray-500">({['日', '月', '火', '水', '木', '金', '土'][date.getDay()]})</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`grid grid-cols-[80px_repeat(${daysInMonth},minmax(120px,1fr))]`}>
        {displayRooms.map(room => (
          <React.Fragment key={room.id}>
            <div
              className={`row-span-${hours.length} p-1 border-r text-xs font-bold text-center sticky left-0 bg-gray-50 flex items-center justify-center`}
            >
              {room.name}
            </div>
            {hours.map(hour => (
              <React.Fragment key={`${room.id}-${hour}`}>
                {dates.map(date => {
                  const slot = getSlotForCell(room.id, date, hour)
                  return (
                    <div key={`${room.id}-${date.toISOString()}-${hour}`} className="h-16 p-0.5 border-b border-r">
                      {slot ? (
                        <TimeSlot slot={slot} onClick={() => onSlotClick(slot)} />
                      ) : (
                        <div className="text-xs text-gray-300 text-center pt-1">{`${hour}:00`}</div>
                      )}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
const SlotDetailModal = ({
  isOpen,
  onClose,
  slot,
  unassignedReservations,
  counselors,
  onAssign,
  onUpdate,
  onCancelToUnassigned,
  onCancelPermanently,
  onDelete,
}) => {
  // ... This component is unchanged ...
  const [selectedReservationId, setSelectedReservationId] = useState('')
  const [selectedCounselorId, setSelectedCounselorId] = useState(slot?.counselorId || '')
  React.useEffect(() => {
    if (slot) {
      setSelectedCounselorId(slot.counselorId || '')
      setSelectedReservationId('')
    }
  }, [slot])
  if (!isOpen || !slot) return null
  const {reservation} = slot
  const availableCounselors = counselors.filter(c => c.storeId === slot.room.storeId)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="font-bold text-lg text-gray-800">スロット詳細</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-600">日時:</span>{' '}
              <span className="text-gray-800">
                {slot.start.toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-600">部屋:</span> <span className="text-gray-800">{slot.room.name}</span>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            {reservation ? (
              <div>
                <h3 className="font-bold text-md text-gray-700 mb-2">予約情報</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold text-gray-600">クライアント:</span> {reservation.client.name} 様
                  </p>
                  <p>
                    <span className="font-semibold text-gray-600">過去の利用:</span> 来店 {reservation.client.visitCount}回 /
                    キャンセル {reservation.client.cancelCount}回
                  </p>
                  <p>
                    <span className="font-semibold text-gray-600">担当カウンセラー:</span> {slot.counselor?.name || '未定'}
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => onCancelPermanently(reservation.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm"
                  >
                    予約をキャンセルする
                  </button>
                  <button
                    onClick={() => onCancelToUnassigned(reservation.id)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 text-sm"
                  >
                    予約を未対応に戻す
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-md text-gray-700 mb-2">予約の割り当て</h3>
                <select
                  id="reservation-select"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  value={selectedReservationId}
                  onChange={e => setSelectedReservationId(e.target.value)}
                >
                  <option value="">-- 予約を選択 --</option>
                  {unassignedReservations.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.client.name} 様 (希望日: {r.preferredDate})
                    </option>
                  ))}
                </select>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => onAssign(selectedReservationId, slot.id)}
                    disabled={!selectedReservationId}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:bg-gray-300 text-sm"
                  >
                    この予約を割り当て
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 border-t pt-4">
            <h3 className="font-bold text-md text-gray-700 mb-2">枠の操作</h3>
            <label htmlFor="counselor-select" className="block text-xs font-medium text-gray-600 mb-1">
              担当カウンセラー
            </label>
            <select
              id="counselor-select"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              value={selectedCounselorId}
              onChange={e => setSelectedCounselorId(e.target.value)}
            >
              <option value="">担当未定</option>
              {availableCounselors.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => onDelete(slot.id)}
                disabled={!!reservation}
                className="flex items-center text-red-600 disabled:text-gray-400 text-sm hover:text-red-800 disabled:hover:text-gray-400"
              >
                <TrashIcon className="w-4 h-4 mr-1" /> この枠を削除
              </button>
              <button
                onClick={() => onUpdate(slot.id, selectedCounselorId ? Number(selectedCounselorId) : null)}
                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
              >
                担当者を更新
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
const AddSlotModal = ({isOpen, onClose, onSubmit, counselors, rooms, currentDate}) => {
  // ... This component is unchanged ...
  const [formData, setFormData] = useState({
    roomId: rooms[0]?.id || '',
    counselorId: '',
    startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0],
    weekdays: {1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 0: false},
    startTime: '10:00',
    endTime: '18:00',
    duration: 60,
  })
  const handleInputChange = e => {
    const {name, value} = e.target
    setFormData(prev => ({...prev, [name]: value}))
  }
  const handleWeekdayChange = day => {
    setFormData(prev => ({...prev, weekdays: {...prev.weekdays, [day]: !prev.weekdays[day]}}))
  }
  const handleSubmit = e => {
    e.preventDefault()
    onSubmit(formData)
  }
  if (!isOpen) return null
  const weekdayLabels = {1: '月', 2: '火', 3: '水', 4: '木', 5: '金', 6: '土', 0: '日'}
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="font-bold text-lg text-gray-800">提供枠の一括追加</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">部屋</label>
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">担当 (任意)</label>
              <select
                name="counselorId"
                value={formData.counselorId}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">担当未定</option>
                {counselors.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">開始日</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">終了日</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">対象曜日</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(weekdayLabels).map(([day, label]) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleWeekdayChange(day)}
                  className={`px-3 py-1 text-xs rounded-full border ${formData.weekdays[day] ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">開始時間</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                step="1800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">終了時間</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                step="1800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">枠(分)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="15"
                step="15"
                required
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              キャンセル
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
const SchedulePage = ({stores, rooms, counselors, clients, reservations, slots, onReservationsChange, onSlotsChange}) => {
  // ... This component is unchanged ...
  const {state, actions} = useScheduleManager({rooms, reservations, slots, onReservationsChange, onSlotsChange})
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1))
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0].id)
  const [selectedRoomIds, setSelectedRoomIds] = useState(() => rooms.filter(r => r.storeId === selectedStoreId).map(r => r.id))
  React.useEffect(() => {
    setSelectedRoomIds(rooms.filter(r => r.storeId === selectedStoreId).map(r => r.id))
  }, [selectedStoreId, rooms])
  const handleStoreChange = storeId => setSelectedStoreId(storeId)
  const handleRoomChange = roomId =>
    setSelectedRoomIds(prev => (prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]))
  const changeMonth = offset => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1))
  const displayRooms = useMemo(
    () => rooms.filter(room => selectedRoomIds.includes(room.id)).sort((a, b) => a.name.localeCompare(b.name)),
    [rooms, selectedRoomIds]
  )
  const unassignedReservations = useMemo(
    () =>
      reservations
        .filter(r => r.status === 'unassigned')
        .map(r => ({...r, client: clients.find(c => c.id === r.clientId)}))
        .sort((a, b) =>
          a.preferredDate && b.preferredDate
            ? new Date(a.preferredDate) - new Date(b.preferredDate)
            : a.preferredDate
              ? -1
              : b.preferredDate
                ? 1
                : a.createdAt - b.createdAt
        ),
    [reservations, clients]
  )
  const confirmedReservations = useMemo(
    () =>
      reservations
        .filter(r => r.status === 'confirmed')
        .map(r => {
          const slot = slots.find(s => s.id === r.slotId)
          const client = clients.find(c => c.id === r.clientId)
          const counselor = slot ? counselors.find(c => c.id === slot.counselorId) : null
          const room = slot ? rooms.find(room => room.id === slot.roomId) : null
          return {...r, client, slot, counselor, room}
        })
        .filter(r => r.slot)
        .sort((a, b) => a.slot.start - b.slot.start),
    [reservations, slots, clients, counselors, rooms]
  )
  const canceledReservations = useMemo(
    () =>
      reservations
        .filter(r => r.status === 'canceled')
        .map(r => ({...r, client: clients.find(c => c.id === r.clientId)}))
        .sort((a, b) => b.createdAt - a.createdAt),
    [reservations, clients]
  )
  const populatedSlots = useMemo(
    () =>
      slots.map(slot => {
        const reservation = reservations.find(r => r.slotId === slot.id && r.status === 'confirmed')
        return {
          ...slot,
          reservation: reservation || null,
          client: reservation ? clients.find(c => c.id === reservation.clientId) : null,
          counselor: counselors.find(c => c.id === slot.counselorId),
          room: rooms.find(r => r.id === slot.roomId),
        }
      }),
    [slots, reservations, clients, counselors, rooms]
  )
  const selectedSlotWithDetails = useMemo(() => {
    if (!state.selectedSlot) return null
    const reservation = reservations.find(r => r.slotId === state.selectedSlot.id && r.status === 'confirmed')
    return {
      ...state.selectedSlot,
      reservation: reservation ? {...reservation, client: clients.find(c => c.id === reservation.clientId)} : null,
      counselor: counselors.find(c => c.id === state.selectedSlot.counselorId),
      room: rooms.find(r => r.id === state.selectedSlot.roomId),
    }
  }, [state.selectedSlot, reservations, clients, counselors, rooms])
  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900 p-2 md:p-4">
      <div className="flex flex-col h-[calc(100vh-6rem)]">
        <header className="flex-shrink-0 mb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-2 rounded-lg shadow">
            <h1 className="text-lg font-bold text-gray-800">スケジュール管理</h1>
            <div className="flex items-center space-x-2 mt-2 md:mt-0">
              <div className="flex items-center">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded-md hover:bg-gray-100">
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <span className="text-md font-semibold w-32 text-center">{`${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`}</span>
                <button onClick={() => changeMonth(1)} className="p-1 rounded-md hover:bg-gray-100">
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={actions.openAddSlotModal}
                className="flex items-center bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 text-xs"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                提供枠を追加
              </button>
            </div>
          </div>
        </header>
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-[200px_1fr_250px] gap-2 overflow-hidden">
          <div className="hidden lg:block">
            <FilterPanel
              stores={stores}
              rooms={rooms}
              selectedStoreId={selectedStoreId}
              onStoreChange={handleStoreChange}
              selectedRoomIds={selectedRoomIds}
              onRoomChange={handleRoomChange}
            />
          </div>
          <div className="overflow-auto">
            <ScheduleCalendar
              currentDate={currentDate}
              displayRooms={displayRooms}
              slots={populatedSlots}
              onSlotClick={actions.openSlotDetailModal}
            />
          </div>
          <div className="hidden lg:block">
            <ReservationsSidebar
              unassignedReservations={unassignedReservations}
              confirmedReservations={confirmedReservations}
              canceledReservations={canceledReservations}
              onRevertCanceled={actions.revertCanceledReservation}
            />
          </div>
        </main>
      </div>
      <SlotDetailModal
        isOpen={state.isSlotDetailModalOpen}
        onClose={actions.closeSlotDetailModal}
        slot={selectedSlotWithDetails}
        unassignedReservations={unassignedReservations}
        counselors={counselors}
        onAssign={actions.assignReservationToSlot}
        onUpdate={actions.updateSlot}
        onCancelToUnassigned={actions.cancelReservationToUnassigned}
        onCancelPermanently={actions.cancelReservationPermanently}
        onDelete={actions.deleteSlot}
      />
      <AddSlotModal
        isOpen={state.isAddSlotModalOpen}
        onClose={actions.closeAddSlotModal}
        onSubmit={actions.addSlots}
        counselors={counselors.filter(c => c.storeId === selectedStoreId)}
        rooms={rooms.filter(r => r.storeId === selectedStoreId)}
        currentDate={currentDate}
      />
    </div>
  )
}

// ===================================================================================
// スタッフマイページ (StaffMyPage) - UPDATED
// ===================================================================================
const StaffMyPage = ({counselors, reservations, onReservationsChange, clients, slots, onSlotsChange, stores}) => {
  const [loggedInCounselorId, setLoggedInCounselorId] = useState(counselors.find(c => c.role === '一般')?.id || counselors[0]?.id)
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1))
  const [modalState, setModalState] = useState({type: null, data: null}) // type: 'report', 'nextReservation'
  const [newlyBookedForReport, setNewlyBookedForReport] = useState([])

  const loggedInCounselor = useMemo(() => counselors.find(c => c.id === loggedInCounselorId), [counselors, loggedInCounselorId])

  const myReservations = useMemo(
    () =>
      reservations
        .map(res => ({
          ...res,
          slot: slots.find(s => s.id === res.slotId),
          client: clients.find(c => c.id === res.clientId),
        }))
        .filter(
          res => res.slot && res.slot.counselorId === loggedInCounselorId && ['confirmed', 'completed'].includes(res.status)
        ),
    [reservations, slots, clients, loggedInCounselorId]
  )

  const changeMonth = offset => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
    setCurrentDate(newDate)
  }

  const openReportModal = date => {
    setNewlyBookedForReport([]) // Reset for new report
    setModalState({type: 'report', data: {date}})
  }

  const handleConfirmAndUpdate = (reservationId, paymentMethod) => {
    onReservationsChange(prev => prev.map(res => (res.id === reservationId ? {...res, status: 'completed', paymentMethod} : res)))
    console.log(`実施確定: 予約ID=${reservationId}, 支払い方法=${paymentMethod}`)
  }

  const handleReportSubmit = reportData => {
    console.log('日報提出:', reportData)
    setModalState({type: null, data: null})
  }

  const handleCreateNextReservation = (clientId, slotId, counselorId) => {
    const newReservation = {
      id: `res-${Date.now()}`,
      clientId: clientId,
      status: 'confirmed',
      createdAt: new Date(),
      slotId: slotId,
      notes: '次回予約',
      paymentMethod: null,
    }
    onReservationsChange(prev => [...prev, newReservation])

    const targetSlot = slots.find(s => s.id === slotId)
    if (targetSlot && targetSlot.counselorId === null) {
      onSlotsChange(prev => prev.map(s => (s.id === slotId ? {...s, counselorId: Number(counselorId)} : s)))
    }

    const newBookedEntry = {
      client: clients.find(c => c.id === clientId),
      slot: {...targetSlot, counselorId: Number(counselorId)}, // Ensure counselor is associated
    }
    setNewlyBookedForReport(prev => [...prev, newBookedEntry])

    console.log('次回予約作成:', newReservation)
    setModalState({type: 'report', data: {date: modalState.data.returnDate}}) // Return to report modal
  }

  const MyPageCalendar = ({onDateClick}) => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const startDate = new Date(startOfMonth)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const days = []
    for (let i = 0; i < 42; i++) {
      days.push(new Date(startDate))
      startDate.setDate(startDate.getDate() + 1)
    }

    const reservationsByDate = myReservations.reduce((acc, res) => {
      const dateStr = res.slot.start.toISOString().split('T')[0]
      if (!acc[dateStr]) acc[dateStr] = []
      acc[dateStr].push(res)
      return acc
    }, {})

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-600 border-b">
          {['日', '月', '火', '水', '木', '金', '土'].map(d => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const dateStr = d.toISOString().split('T')[0]
            const isCurrentMonth = d.getMonth() === currentDate.getMonth()
            const dailyReservations = reservationsByDate[dateStr] || []
            return (
              <div
                key={i}
                className={`h-24 border-b border-l p-1 flex flex-col cursor-pointer transition-colors ${isCurrentMonth ? 'hover:bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                onClick={() => onDateClick(d)}
              >
                <span className={`text-xs font-semibold ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                  {d.getDate()}
                </span>
                <div className="mt-1 space-y-1 overflow-y-auto text-xs">
                  {dailyReservations.map(res => (
                    <div
                      key={res.id}
                      className={`p-1 rounded-sm text-white ${res.status === 'completed' ? 'bg-gray-400' : 'bg-blue-500'}`}
                    >
                      {res.client.name.split(' ')[0]}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const NextReservationModal = ({client, loggedInCounselor, counselors, slots, reservations, onCreate, onBack}) => {
    const [viewDate, setViewDate] = useState(new Date(2025, 9, 1))
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedSlotId, setSelectedSlotId] = useState('')
    const [selectedCounselorId, setSelectedCounselorId] = useState(loggedInCounselor.id)

    const storeCounselors = counselors.filter(c => c.storeId === loggedInCounselor.storeId)
    const bookedSlotIds = useMemo(() => new Set(reservations.map(r => r.slotId)), [reservations])

    const availableSlots = useMemo(
      () =>
        slots.filter(
          slot =>
            !bookedSlotIds.has(slot.id) &&
            slot.storeId === loggedInCounselor.storeId &&
            (slot.counselorId === null || slot.counselorId === selectedCounselorId) &&
            slot.start > new Date() // Only show future slots
        ),
      [slots, bookedSlotIds, loggedInCounselor.storeId, selectedCounselorId]
    )

    const availableDates = useMemo(
      () => new Set(availableSlots.map(slot => slot.start.toISOString().split('T')[0])),
      [availableSlots]
    )

    const availableTimesForSelectedDate = useMemo(() => {
      if (!selectedDate) return []
      const selectedDateStr = selectedDate.toISOString().split('T')[0]
      return availableSlots
        .filter(slot => slot.start.toISOString().startsWith(selectedDateStr))
        .map(slot => ({
          id: slot.id,
          time: slot.start.toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'}),
        }))
        .sort((a, b) => a.time.localeCompare(b.time))
    }, [selectedDate, availableSlots])

    const changeMonth = offset => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1))
    const handleSubmit = () => {
      if (!selectedSlotId) return
      onCreate(client.id, selectedSlotId, selectedCounselorId)
    }

    const BookingCalendar = ({onDateChange, selectedDate, availableDates}) => {
      const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
      const days = []
      const startDayOfWeek = startOfMonth.getDay()
      const calStartDate = new Date(startOfMonth)
      calStartDate.setDate(calStartDate.getDate() - startDayOfWeek)

      for (let i = 0; i < 35; i++) {
        days.push(new Date(calStartDate))
        calStartDate.setDate(calStartDate.getDate() + 1)
      }

      return (
        <div className="border text-sm">
          <div className="flex justify-between items-center p-1 bg-gray-50">
            <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded hover:bg-gray-200">
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <span className="font-bold">{`${viewDate.getFullYear()}年 ${viewDate.getMonth() + 1}月`}</span>
            <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded hover:bg-gray-200">
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
          <table className="w-full text-center">
            <thead>
              <tr className="bg-gray-100">
                {['日', '月', '火', '水', '木', '金', '土'].map(d => (
                  <th key={d} className="py-1 text-xs font-normal">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({length: 5}).map((_, weekIndex) => (
                <tr key={weekIndex}>
                  {days.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => {
                    const isCurrentMonth = day.getMonth() === viewDate.getMonth()
                    const dateStr = day.toISOString().split('T')[0]
                    const isSelectable = availableDates.has(dateStr)
                    const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString()
                    return (
                      <td key={dayIndex} className="border-t border-l p-0">
                        <button
                          type="button"
                          onClick={() => onDateChange(day)}
                          disabled={!isSelectable}
                          className={`w-full h-9 flex flex-col items-center justify-center ${isSelected ? 'bg-blue-200' : ''} ${isSelectable ? 'cursor-pointer hover:bg-blue-100' : 'text-gray-400'} ${!isCurrentMonth ? 'text-gray-300' : ''}`}
                        >
                          <span>{day.getDate()}</span>
                          {isSelectable && <span className="text-xs text-cyan-500">●</span>}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-bold text-lg">次回予約作成 ({client.name}様)</h2>
            <button onClick={onBack} className="text-gray-500 hover:text-gray-800">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-grow">
            <div>
              <label className="block text-sm font-medium mb-1">担当カウンセラー</label>
              <select
                value={selectedCounselorId}
                onChange={e => setSelectedCounselorId(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                {storeCounselors.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="mt-4">
                <BookingCalendar
                  onDateChange={date => {
                    setSelectedDate(date)
                    setSelectedSlotId('')
                  }}
                  selectedDate={selectedDate}
                  availableDates={availableDates}
                />
              </div>
            </div>
            <div>
              {selectedDate && (
                <div className="h-full flex flex-col">
                  <h3 className="font-semibold text-center mb-2">{selectedDate.toLocaleDateString('ja-JP')}の空き状況</h3>
                  {availableTimesForSelectedDate.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 overflow-y-auto">
                      {availableTimesForSelectedDate.map(slot => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-2 rounded-md text-sm border ${selectedSlotId === slot.id ? 'bg-cyan-600 text-white' : 'bg-white hover:bg-cyan-50'}`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 mt-8">選択した日付に空きがありません。</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="p-3 bg-gray-50 flex justify-between items-center flex-shrink-0">
            <button onClick={onBack} className="bg-gray-200 text-gray-700 px-4 py-2 text-sm rounded-md hover:bg-gray-300">
              日報に戻る
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedSlotId}
              className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              予約を確定
            </button>
          </div>
        </div>
      </div>
    )
  }

  const DailyReportModal = ({date, counselor, reservations, onConfirm, onSubmit, onClose, onBookNext, newlyBooked}) => {
    const [reportNotes, setReportNotes] = useState('')

    const dailySessions = useMemo(
      () =>
        reservations
          .filter(
            res => res.slot && res.slot.counselorId === counselor.id && res.slot.start.toDateString() === date.toDateString()
          )
          .sort((a, b) => a.slot.start - b.slot.start),
      [date, counselor.id, reservations]
    )

    const [sessionDetails, setSessionDetails] = useState(() =>
      dailySessions.reduce((acc, session) => {
        acc[session.id] = {amount: 8800, paymentMethod: session.paymentMethod}
        return acc
      }, {})
    )

    const handleDetailChange = (sessionId, field, value) => {
      setSessionDetails(prev => {
        const updated = {...prev[sessionId], [field]: value}
        if (field === 'paymentMethod') {
          onConfirm(sessionId, value)
        }
        return {...prev, [sessionId]: updated}
      })
    }

    const handleFormSubmit = () =>
      onSubmit({date: date.toISOString().split('T')[0], counselorId: counselor.id, notes: reportNotes})

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="p-4 border-b flex-shrink-0">
            <h2 className="font-bold text-lg text-center">日報</h2>
            <div className="flex justify-between items-baseline text-sm">
              <span>氏名: {counselor.name}</span>
              <span>{date.toLocaleDateString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit'})}</span>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-grow">
            <div className="border-r pr-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-1 text-left font-semibold">クライアント名</th>
                    <th className="p-1 font-semibold w-20">金額</th>
                    <th className="p-1 font-semibold">ｶｰﾄﾞ</th>
                    <th className="p-1 font-semibold">振込</th>
                  </tr>
                </thead>
                <tbody>
                  {dailySessions.map(session => (
                    <tr key={session.id} className="border-b">
                      <td className="p-1">
                        <button onClick={() => onBookNext(session.client)} className="text-blue-600 hover:underline">
                          {session.client.name}
                        </button>
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={sessionDetails[session.id]?.amount}
                          onChange={e => handleDetailChange(session.id, 'amount', e.target.value)}
                          className="w-full text-right p-1 border rounded"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <input
                          type="radio"
                          name={`payment-${session.id}`}
                          checked={sessionDetails[session.id]?.paymentMethod === 'カード'}
                          onChange={() => handleDetailChange(session.id, 'paymentMethod', 'カード')}
                        />
                      </td>
                      <td className="p-1 text-center">
                        <input
                          type="radio"
                          name={`payment-${session.id}`}
                          checked={sessionDetails[session.id]?.paymentMethod === '振込'}
                          onChange={() => handleDetailChange(session.id, 'paymentMethod', '振込')}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td className="p-1 text-left">本日振込金</td>
                    <td className="p-1 text-right">
                      {dailySessions
                        .reduce(
                          (sum, s) =>
                            sum + (sessionDetails[s.id]?.paymentMethod === '振込' ? Number(sessionDetails[s.id]?.amount) : 0),
                          0
                        )
                        .toLocaleString()}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">次回予約</h3>
                <div className="p-2 bg-gray-50 rounded-md space-y-1 text-sm border h-32 overflow-y-auto">
                  {newlyBooked.map((res, i) => (
                    <div key={i} className="grid grid-cols-[1fr_2fr]">
                      <span className="font-medium">{res.client.name}:</span>
                      <span>
                        {res.slot.start.toLocaleString('ja-JP', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">報告・連絡事項</h3>
                <textarea
                  value={reportNotes}
                  onChange={e => setReportNotes(e.target.value)}
                  rows="5"
                  className="w-full p-2 border rounded-md"
                ></textarea>
              </div>
            </div>
          </div>
          <div className="p-3 bg-gray-50 flex justify-end space-x-2 flex-shrink-0">
            <button onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 text-sm rounded-md hover:bg-gray-300">
              閉じる
            </button>
            <button onClick={handleFormSubmit} className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700">
              送信
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900 p-2 md:p-4">
      <header className="flex-shrink-0 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-2 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-gray-800">スタッフマイページ</h1>
            <select
              value={loggedInCounselorId}
              onChange={e => setLoggedInCounselorId(Number(e.target.value))}
              className="p-1 border rounded-md text-sm"
            >
              {counselors.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <div className="flex items-center">
              <button onClick={() => changeMonth(-1)} className="p-1 rounded-md hover:bg-gray-100">
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <span className="text-md font-semibold w-32 text-center">{`${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`}</span>
              <button onClick={() => changeMonth(1)} className="p-1 rounded-md hover:bg-gray-100">
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <MyPageCalendar onDateClick={openReportModal} />
      </main>

      {modalState.type === 'report' && modalState.data.date && (
        <DailyReportModal
          date={modalState.data.date}
          counselor={loggedInCounselor}
          reservations={myReservations}
          onConfirm={handleConfirmAndUpdate}
          onSubmit={handleReportSubmit}
          onClose={() => setModalState({type: null, data: null})}
          onBookNext={client => setModalState({type: 'nextReservation', data: {client, returnDate: modalState.data.date}})}
          newlyBooked={newlyBookedForReport}
        />
      )}

      {modalState.type === 'nextReservation' && (
        <NextReservationModal
          client={modalState.data.client}
          loggedInCounselor={loggedInCounselor}
          counselors={counselors}
          slots={slots}
          reservations={reservations}
          onCreate={handleCreateNextReservation}
          onBack={() => setModalState({type: 'report', data: {date: modalState.data.returnDate}})}
        />
      )}
    </div>
  )
}

// ===================================================================================
// マスタ設定ページ (MasterSettingsPage) - NEW
// ===================================================================================
const MasterSettingsPage = ({stores, setStores, rooms, setRooms, counselors, setCounselors, clients, setClients}) => {
  const [activeTab, setActiveTab] = useState('stores')
  const [modalState, setModalState] = useState({isOpen: false, type: '', data: null})

  const openModal = (type, data = null) => setModalState({isOpen: true, type, data})
  const closeModal = () => setModalState({isOpen: false, type: '', data: null})

  const handleSave = (type, item) => {
    const isNew = !item.id
    const createNewItem = prev => [...prev, {...item, id: Date.now()}]
    const updateItem = prev => prev.map(i => (i.id === item.id ? item : i))

    switch (type) {
      case 'stores':
        setStores(isNew ? createNewItem : updateItem)
        break
      case 'rooms':
        setRooms(isNew ? createNewItem : updateItem)
        break
      case 'counselors':
        setCounselors(isNew ? createNewItem : updateItem)
        break
      case 'clients':
        setClients(isNew ? createNewItem : updateItem)
        break
    }
    closeModal()
  }

  const handleDelete = (type, id) => {
    const newLocal = true
    // Simple confirmation, replace with a custom modal in a real app
    if (newLocal) {
      // Bypassing window.confirm
      switch (type) {
        case 'stores':
          setStores(p => p.filter(i => i.id !== id))
          break
        case 'rooms':
          setRooms(p => p.filter(i => i.id !== id))
          break
        case 'counselors':
          setCounselors(p => p.filter(i => i.id !== id))
          break
        case 'clients':
          setClients(p => p.filter(i => i.id !== id))
          break
      }
    }
  }

  const tabs = [
    {key: 'stores', label: '店舗管理', icon: BuildingIcon, data: stores, columns: [{key: 'name', label: '店舗名'}]},
    {
      key: 'rooms',
      label: '部屋管理',
      icon: DoorOpenIcon,
      data: rooms,
      columns: [
        {key: 'name', label: '部屋名'},
        {key: 'storeId', label: '所属店舗', render: id => stores.find(s => s.id === id)?.name},
      ],
    },
    {
      key: 'counselors',
      label: 'カウンセラー管理',
      icon: UserIcon,
      data: counselors,
      columns: [
        {key: 'name', label: '氏名'},
        {key: 'email', label: 'Email'},
        {key: 'role', label: '権限'},
        {key: 'storeId', label: '所属店舗', render: id => stores.find(s => s.id === id)?.name},
      ],
    },
    {
      key: 'clients',
      label: '顧客管理',
      icon: UsersIcon,
      data: clients,
      columns: [
        {key: 'name', label: '氏名'},
        {key: 'phone', label: '電話番号'},
        {key: 'visitCount', label: '来店回数'},
        {key: 'cancelCount', label: 'キャンセル回数'},
      ],
    },
  ]

  const activeTabData = tabs.find(t => t.key === activeTab)

  const MasterTable = ({data, columns, onEdit, onDelete}) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            {columns.map(c => (
              <th key={c.key} scope="col" className="px-4 py-2">
                {c.label}
              </th>
            ))}
            <th scope="col" className="px-4 py-2">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
              {columns.map(c => (
                <td key={c.key} className="px-4 py-2">
                  {c.render ? c.render(item[c.key]) : item[c.key]}
                </td>
              ))}
              <td className="px-4 py-2 flex space-x-2">
                <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800">
                  <EditIcon className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const MasterFormModal = () => {
    if (!modalState.isOpen) return null

    const isNew = !modalState.data
    const getInitialState = () => {
      if (!isNew) return modalState.data
      switch (modalState.type) {
        case 'stores':
          return {name: ''}
        case 'rooms':
          return {name: '', storeId: stores[0]?.id || ''}
        case 'counselors':
          return {name: '', email: '', role: '一般', storeId: stores[0]?.id || ''}
        case 'clients':
          return {name: '', phone: '', visitCount: 0, cancelCount: 0}
        default:
          return {}
      }
    }

    const [formData, setFormData] = useState(getInitialState())
    const handleChange = e => setFormData(prev => ({...prev, [e.target.name]: e.target.value}))
    const handleSubmit = e => {
      e.preventDefault()
      handleSave(modalState.type, formData)
    }

    const renderField = key => {
      switch (`${modalState.type}-${key}`) {
        case 'rooms-storeId':
        case 'counselors-storeId':
          return (
            <select name="storeId" value={formData.storeId} onChange={handleChange} className="w-full p-2 border rounded">
              {stores.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )
        case 'counselors-role':
          return (
            <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded">
              <option>一般</option>
              <option>管理者</option>
            </select>
          )
        case 'clients-visitCount':
        case 'clients-cancelCount':
          return (
            <input type="number" name={key} value={formData[key]} onChange={handleChange} className="w-full p-2 border rounded" />
          )
        default:
          return (
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          )
      }
    }

    const labels = {
      name: '名前',
      email: 'Email',
      role: '権限',
      storeId: '所属店舗',
      phone: '電話番号',
      visitCount: '来店回数',
      cancelCount: 'キャンセル回数',
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">{isNew ? '新規追加' : '編集'}</h2>
            </div>
            <div className="p-4 space-y-4">
              {Object.keys(formData)
                .filter(k => k !== 'id')
                .map(key => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1">{labels[key] || key}</label>
                    {renderField(key)}
                  </div>
                ))}
            </div>
            <div className="p-3 bg-gray-50 flex justify-end space-x-2">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-200 text-gray-700 px-4 py-2 text-sm rounded-md hover:bg-gray-300"
              >
                キャンセル
              </button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700">
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900 p-2 md:p-4">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">マスタ設定</h1>
      </header>
      <div className="flex border-b mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center px-4 py-2 text-sm font-medium -mb-px border-b-2 ${activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{activeTabData.label}一覧</h2>
          <button
            onClick={() => openModal(activeTab)}
            className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-xs"
          >
            <PlusIcon className="w-4 h-4 mr-1" /> 新規追加
          </button>
        </div>
        <MasterTable
          data={activeTabData.data}
          columns={activeTabData.columns}
          onEdit={item => openModal(activeTab, item)}
          onDelete={id => handleDelete(activeTab, id)}
        />
      </div>
      <MasterFormModal />
    </div>
  )
}

// ===================================================================================
// メインアプリケーション (CounselingApp)
// ===================================================================================
export default function CounselingApp() {
  const [currentPage, setCurrentPage] = useState('mypage')
  const [stores, setStores] = useState(SAMPLE_STORES_DATA)
  const [rooms, setRooms] = useState(SAMPLE_ROOMS_DATA)
  const [counselors, setCounselors] = useState(SAMPLE_COUNSELORS_DATA)
  const [clients, setClients] = useState(SAMPLE_CLIENTS_DATA)
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS_DATA)
  const [slots, setSlots] = useState(INITIAL_SLOTS_DATA)

  const navButtons = [
    {key: 'form', label: '予約フォーム'},
    {key: 'schedule', label: 'スケジュール管理'},
    {key: 'mypage', label: 'スタッフマイページ'},
    {key: 'settings', label: 'マスタ設定'},
  ]

  return (
    <div>
      <nav className="bg-gray-800 text-white p-2 flex justify-center items-center space-x-2 sticky top-0 z-40 shadow-md flex-wrap">
        <h1 className="text-md font-bold absolute left-4 hidden md:block">カウンセリング予約システム</h1>
        {navButtons.map(btn => (
          <button
            key={btn.key}
            onClick={() => setCurrentPage(btn.key)}
            className={`px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${currentPage === btn.key ? 'bg-gray-900 ring-2 ring-white' : 'hover:bg-gray-700'}`}
          >
            {btn.label}
          </button>
        ))}
      </nav>

      <main>
        {currentPage === 'form' && <ReservationFormPage reservations={reservations} slots={slots} stores={stores} />}
        {currentPage === 'schedule' && (
          <SchedulePage
            stores={stores}
            rooms={rooms}
            counselors={counselors}
            clients={clients}
            reservations={reservations}
            slots={slots}
            onReservationsChange={setReservations}
            onSlotsChange={setSlots}
          />
        )}
        {currentPage === 'mypage' && (
          <StaffMyPage
            counselors={counselors}
            reservations={reservations}
            onReservationsChange={setReservations}
            clients={clients}
            slots={slots}
            onSlotsChange={setSlots}
            stores={stores}
          />
        )}
        {currentPage === 'settings' && (
          <MasterSettingsPage
            stores={stores}
            setStores={setStores}
            rooms={rooms}
            setRooms={setRooms}
            counselors={counselors}
            setCounselors={setCounselors}
            clients={clients}
            setClients={setClients}
          />
        )}
      </main>
    </div>
  )
}
