'use client'

import ExpenseEditor from '@app/(excluded)/keihi/(pages)/expense/[id]/edit/ExpenseEditor'
import {useParams, useRouter} from 'next/navigation'
import React from 'react'

export default function Page() {
  const router = useRouter()
  const params = useParams()
  const expenseId = params?.id as string
  return (
    <ExpenseEditor
      expenseId={expenseId}
      onUpdate={() => {
        router.push('/keihi')
      }}
    />
  )
}
