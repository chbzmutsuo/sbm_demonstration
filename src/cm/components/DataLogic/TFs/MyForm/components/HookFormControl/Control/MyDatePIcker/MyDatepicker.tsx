import React, {useEffect, useState} from 'react'

import {anyObject} from '@cm/types/utility-types'
import MainDatePicker from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyDatePIcker/MainDatePicker'
import {Days} from '@cm/class/Days/Days'
import {formatDate, TimeFormatType} from '@cm/class/Days/date-utils/formatters'
import {ControlContextType} from '@cm/types/form-control-type'
import {Center, R_Stack} from 'src/cm/components/styles/common-components/common-components'
import {CalendarDays} from 'lucide-react'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'

const MyDatepicker = React.forwardRef((props: anyObject, ref) => {
  const [isOpen, setIsOpen] = useState(false)

  const {
    ControlOptions,
    useResetValue,
    currentValue,
    col,
    liftUpNewValueOnChange,
    ReactHookForm,
    formProps,
    field,
    ControlStyle,
  } = props.controlContextValue as ControlContextType

  const [selectedDate, setSelectedDate] = useState<any>(null)

  useEffect(() => {
    if (currentValue === null) {
      setSelectedDate(null)
    } else {
      if (Days.validate.isDate(new Date(currentValue))) {
        setSelectedDate(new Date(currentValue))
      }
    }
  }, [currentValue])

  const toggleCalendar = () => {
    setIsOpen(!isOpen)
  }

  const timeFormat = Days.time.getTimeFormat(col.type ?? '').timeFormatForDaysJs as TimeFormatType

  const setDate = ({date, timeStr}) => {
    const time = timeStr.split(':')
    if (timeStr) {
      date.setHours(parseInt(time[0]))
      date.setMinutes(parseInt(time[1]))
      date.setSeconds(0)
    } else {
      date.setHours(0)
      date.setMinutes(0)
      date.setSeconds(0)
    }

    setSelectedDate(date)

    liftUpNewValueOnChange({id: col.id, newValue: date, ReactHookForm})

    if (isOpen) {
      toggleCalendar()
    }
    setTimeout(() => {
      field.onBlur()
    }, 200)
  }

  return (
    <>
      <ShadModal
        {...{
          open: isOpen,
          onOpenChange: setIsOpen,

          Trigger: (
            <R_Stack className={`  justify-between gap-1`}>
              <DateInputter {...{col, currentValue, formProps, selectedDate, toggleCalendar, timeFormat, ControlStyle}} />
              {col.type === `datetime` && <TimeInputter {...{col, selectedDate, setDate, formProps}} />}
            </R_Stack>
          ),
        }}
      >
        <MainDatePicker
          {...{
            ControlStyle,
            col,
            formProps,
            setIsOpen,
            field,
            useResetValue,
            selectedDate,
            setSelectedDate,
            handleDateChange: (date, e) => setDate({date, timeStr: ''}),
          }}
        />
      </ShadModal>
    </>
  )
})

export default MyDatepicker

const DateInputter = ({col, currentValue, formProps, selectedDate, toggleCalendar, timeFormat, ControlStyle}) => {
  return (
    <div
      className={`relative cursor-pointer`}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && toggleCalendar()}
      onClick={toggleCalendar}
    >
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 ">
        <CalendarDays className="text-gray-500 h-5" />
      </div>
      <Center style={{fontSize: 18, justifyContent: `start`}}>
        <div>
          {selectedDate && Days.validate.isDate(selectedDate) ? (
            <div {...{...formProps, style: {...ControlStyle}}}>{formatDate(selectedDate, timeFormat)}</div>
          ) : (
            <input
              {...{
                ...col.inputProps,
                ...formProps,
                onChange: () => undefined,
                value: selectedDate ?? '',
                type: `text`,
                style: ControlStyle,
              }}
            />
          )}
        </div>
      </Center>
    </div>
  )
}

const TimeInputter = ({col, selectedDate, setDate, formProps}) => {
  const time = selectedDate ? formatDate(selectedDate, 'HH:mm') : ''

  const [value, setvalue] = useState(time)

  useEffect(() => {
    if (formatDate(selectedDate, 'HH:mm') === `00:00`) {
      setvalue(formatDate(new Date(), 'HH:mm'))
    } else {
      setvalue(time)
    }
  }, [selectedDate, time])

  const disabled = !selectedDate
  return (
    <div>
      <input
        {...{
          disabled,
          value,
          onChange: e => {
            setvalue(e.target.value)
            setDate({date: selectedDate, timeStr: e.target.value})
          },
          onBlur: e => setDate({date: selectedDate, timeStr: e.target.value}),
          className: `${disabled ? 'disabled opacity-20' : ''} ${formProps.className} w-[120px]`,
          type: 'time',
        }}
      />
    </div>
  )
}
