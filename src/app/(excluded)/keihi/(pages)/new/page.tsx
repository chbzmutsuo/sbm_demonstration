'use client'

import ExpenseEditor from '@app/(excluded)/keihi/(pages)/expense/[id]/edit/ExpenseEditor'
import {Padding} from '@cm/components/styles/common-components/common-components'

const NewExpensePage = () => {
  return (
    <Padding>
      <ExpenseEditor expenseId={''} onUpdate={() => {}} />
    </Padding>
  )
}

export default NewExpensePage
