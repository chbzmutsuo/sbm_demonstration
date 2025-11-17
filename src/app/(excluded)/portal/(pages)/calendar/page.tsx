import React from 'react'
import {getAllHolidays} from './_actions/calendar-actions'
import CalendarClient from '@app/(excluded)/portal/(pages)/calendar/CalendarClient'
import {FitMargin} from '@cm/components/styles/common-components/common-components'

const CalendarPage = async () => {
  const {data: holidays} = await getAllHolidays()

  return (
    <FitMargin>
      <CalendarClient initialHolidays={holidays || []} />
    </FitMargin>
  )
}

export default CalendarPage
