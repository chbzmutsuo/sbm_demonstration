'use client'

import React, {useState, useMemo} from 'react'
import {CompanyHoliday} from '@prisma/client'
import {PlusCircle, Trash2, Calendar} from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {createHoliday, updateHoliday, deleteHoliday, getAllHolidays} from './_actions/calendar-actions'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

type CalendarClientProps = {
  initialHolidays: CompanyHoliday[]
}
const CalendarClient = ({initialHolidays}: CalendarClientProps) => {
  const {toggleLoad, query} = useGlobal()
  const [holidays, setHolidays] = useState<CompanyHoliday[]>(initialHolidays)
  const [formData, setFormData] = useState({
    holidayAt: new Date().toISOString().slice(0, 10),
    holidayType: '休日',
    note: '',
  })

  const AddModalReturn = useModal<{existingHoliday?: CompanyHoliday}>()

  // クエリから月を取得（デフォルトは現在月）
  const currentMonth = useMemo(() => {
    const from = query.from ? new Date(query.from) : new Date()
    return new Date(from.getFullYear(), from.getMonth(), 1)
  }, [query.from])

  // カレンダーの日付配列を生成
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    const days: (Date | null)[] = []

    // 前月の日付（空白セル）
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }, [currentMonth])

  // 指定された日付が休日かどうかを判定
  const isHoliday = (date: Date) => {
    const dateString = date.toISOString().slice(0, 10)
    return holidays.find(h => h.holidayAt.toISOString().slice(0, 10) === dateString)
  }

  // 指定された日付が今日かどうかを判定
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const loadHolidays = async () => {
    const {data} = await getAllHolidays()
    if (data) {
      setHolidays(data)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target
    setFormData(prev => ({...prev, [name]: value}))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await toggleLoad(async () => {
      const existingHoliday = AddModalReturn.open?.existingHoliday

      const data = {
        holidayAt: new Date(formData.holidayAt),
        holidayType: formData.holidayType,
        note: formData.note || null,
      }

      const result = existingHoliday ? await updateHoliday(existingHoliday.id, data) : await createHoliday(data)

      if (result.success) {
        await loadHolidays()
        AddModalReturn.handleClose()
        setFormData({
          holidayAt: new Date().toISOString().slice(0, 10),
          holidayType: '休日',
          note: '',
        })
      } else {
        alert(result.error || (existingHoliday ? '更新に失敗しました' : '登録に失敗しました'))
      }
    })
  }

  const handleDelete = async (id: number) => {
    if (confirm('この休日を削除してもよろしいですか？')) {
      await toggleLoad(async () => {
        const result = await deleteHoliday(id)
        if (result.success) {
          await loadHolidays()
        } else {
          alert(result.error || '削除に失敗しました')
        }
      })
    }
  }

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().slice(0, 10)
    const existingHoliday = holidays.find(h => h.holidayAt.toISOString().slice(0, 10) === dateString)

    if (existingHoliday) {
      // 既存の休日がある場合は編集モードで開く
      setFormData({
        holidayAt: dateString,
        holidayType: existingHoliday.holidayType,
        note: existingHoliday.note || '',
      })
      AddModalReturn.handleOpen({existingHoliday})
    } else {
      // 新規追加モードで開く
      setFormData(prev => ({
        ...prev,
        holidayAt: dateString,
      }))
      AddModalReturn.handleOpen()
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">カレンダー管理</h1>
        <button
          onClick={() => AddModalReturn.handleOpen()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          休日追加
        </button>
      </div>
      {/* 月切り替え */}
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <div className="flex items-center gap-4 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
          </h2>
        </div>
        <NewDateSwitcher monthOnly />
      </div>
      {/* カレンダー表示 */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {/* 曜日ヘッダー */}
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="bg-gray-50 p-3 text-center text-sm font-semibold text-gray-700">
              {day}
            </div>
          ))}

          {/* カレンダーの日付 */}
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={index} className="bg-white p-3 min-h-[80px]" />
            }

            const holiday = isHoliday(date)
            const today = isToday(date)

            return (
              <div
                key={index}
                className={`bg-white p-2 min-h-[120px] min-w-[120px] cursor-pointer hover:bg-gray-50 transition-colors ${
                  today ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleDateClick(date)}
              >
                <div className={`text-sm font-medium ${today ? 'text-blue-600' : 'text-gray-900'}`}>{date.getDate()}</div>
                {holiday && (
                  <div className="mt-1">
                    <div
                      className={`text-xs px-1 py-0.5 rounded ${
                        holiday.holidayType === '祝日'
                          ? 'bg-red-100 text-red-800'
                          : holiday.holidayType === '夏季休暇'
                            ? 'bg-blue-100 text-blue-800'
                            : holiday.holidayType === '年末年始'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <span className="truncate">{holiday.holidayType}</span>
                    </div>
                    {holiday.note && (
                      <div className="text-xs text-gray-600 mt-1 truncate" title={holiday.note}>
                        {holiday.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {/* 休日一覧
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-900">休日一覧</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3">日付</th>
                <th className="px-4 py-3">種別</th>
                <th className="px-4 py-3">備考</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    休日が登録されていません
                  </td>
                </tr>
              ) : (
                holidays.map(holiday => (
                  <tr key={holiday.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{formatDate(new Date(holiday.holidayAt))}</td>
                    <td className="px-4 py-3">{holiday.holidayType}</td>
                    <td className="px-4 py-3 text-gray-600">{holiday.note || '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(holiday.id)}
                        className="text-gray-500 hover:text-red-600 transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div> */}
      <AddModalReturn.Modal title={AddModalReturn.open?.existingHoliday ? '休日編集' : '休日追加'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
            <input
              type="date"
              name="holidayAt"
              value={formData.holidayAt}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">種別</label>
            <select
              name="holidayType"
              value={formData.holidayType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option>休日</option>
              <option>祝日</option>
              <option>夏季休暇</option>
              <option>年末年始</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="備考（任意）"
            />
          </div>

          <div>
            <R_Stack className={`gap-6 justify-between `}>
              <div>
                {AddModalReturn?.open?.existingHoliday && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('この休日を削除してもよろしいですか？')) {
                        await toggleLoad(async () => {
                          const result = await deleteHoliday(AddModalReturn.open.existingHoliday!.id)
                          if (result.success) {
                            await loadHolidays()
                            AddModalReturn.handleClose()
                          } else {
                            alert(result.error || '削除に失敗しました')
                          }
                        })
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    削除
                  </button>
                )}
              </div>

              <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                {AddModalReturn.open?.existingHoliday ? '更新' : '追加'}
              </button>
            </R_Stack>
          </div>
        </form>
      </AddModalReturn.Modal>
    </div>
  )
}

export default CalendarClient
