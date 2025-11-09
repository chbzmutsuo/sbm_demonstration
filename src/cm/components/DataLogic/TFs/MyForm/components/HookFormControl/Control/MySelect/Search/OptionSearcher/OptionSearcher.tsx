'use client'

import {C_Stack} from 'src/cm/components/styles/common-components/common-components'

import React from 'react'

import {colType} from '@cm/types/col-types'

import {contextsType} from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/my-select-types'

import {
  ComplexSearchForm,
  SearchFormHookType,
} from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/Search/OptionSearcher/ComplexSearchForm'
import {SimpleSearchForm} from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/Search/OptionSearcher/SimpleSearchForm'

export const OptionSearcher = (props: {
  SearchFormHook: SearchFormHookType
  contexts: contextsType
  optionsISFromArray
  allowCreateOptions
}) => {
  const {SearchFormHook, contexts, optionsISFromArray, allowCreateOptions} = props

  const {MySelectContextValue, controlContextValue} = contexts

  const col: colType = controlContextValue?.col

  return (
    <C_Stack>
      {col.forSelect?.allowCreateOptions || col.forSelect?.searcher ? (
        <ComplexSearchForm {...{contexts, SearchFormHook}} />
      ) : (
        <SimpleSearchForm {...{contexts}} />
      )}
    </C_Stack>
  )
}
export default OptionSearcher
