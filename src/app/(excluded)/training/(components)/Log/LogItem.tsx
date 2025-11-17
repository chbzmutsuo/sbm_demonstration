'use client'

import React from 'react'
import {WorkoutLogWithMaster} from '../../types/training'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {PART_OPTIONS} from '@app/(excluded)/training/(constants)/PART_OPTIONS'

interface LogItemProps {
  log: WorkoutLogWithMaster
  isPR: boolean
  onEdit: () => void
  onQuickAdd: () => void
  onDelete: () => void
  showWorkName: boolean
}

export function LogItem({log, isPR, onEdit, onQuickAdd, onDelete, showWorkName}: LogItemProps) {
  const partColor = PART_OPTIONS.find(part => part.value === log.ExerciseMaster?.part)?.color

  return (
    <div className="p-2 bg-slate-50 rounded-lg  ">
      <C_Stack>
        <R_Stack className={` justify-between flex-nowrap`}>
          <div>
            <div className="font-semibold text-slate-800 flex items-center gap-2">
              {showWorkName && (
                <R_Stack className={` flex-nowrap gap-0.5`}>
                  <IconBtn
                    {...{
                      rounded: true,
                      className: 'w-5 h-5 scale-75',
                      color: partColor ?? 'gray',
                    }}
                  ></IconBtn>
                  {log.ExerciseMaster?.name}
                </R_Stack>
              )}

              {isPR && <span className="text-xs font-bold text-white bg-yellow-500 px-2 py-0.5 rounded-full">PR</span>}
            </div>
            <div className="flex items-end gap-1 mt-1">
              <span className="text-2xl font-extrabold text-gray-800 drop-shadow-sm">{log.strength}</span>
              <span className="text-base  text-gray-400 mb-0.5">{log?.ExerciseMaster?.unit}</span>
              <span className="text-xl fo text-gray-300 ml-2">×</span>
              <span className="text-2xl font-extrabold text-gray-800 ml-2">{log.reps}</span>
              <span className="text-base  text-gray-400 mb-0.5">回</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* クイック追加ボタン */}
            <button
              onClick={onQuickAdd}
              className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 text-lg font-bold transition-colors"
              title="同じ内容でセットを追加"
              aria-label="セット追加"
            >
              +
            </button>

            {/* 編集ボタン */}
            <button onClick={onEdit} className="text-sm text-blue-600 hover:underline cursor-pointer transition-colors">
              編集
            </button>

            {/* 削除ボタン */}
            <button onClick={onDelete} className="text-sm text-red-600 hover:underline cursor-pointer transition-colors">
              削除
            </button>
          </div>
        </R_Stack>
      </C_Stack>

      <div className={` flex justify-end`}>
        <small className={` text-xs`}>{formatDate(log.date, 'MM/DD(ddd) HH:mm')}</small>
      </div>
    </div>
  )
}
