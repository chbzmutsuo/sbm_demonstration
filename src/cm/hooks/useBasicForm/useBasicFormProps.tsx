'use client'

import {FieldValues, useForm, UseFormReturn} from 'react-hook-form'
import React, {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react'

import {extraFormStateType, onFormItemBlurType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'

import useGlobal from 'src/cm/hooks/globalHooks/useGlobal'
import BasicForm from 'src/cm/hooks/useBasicForm/BaiscForm'
import {getLatestFormData, initColumns, makeDefaultValues} from '@cm/hooks/useBasicForm/lib/hookformMethods'
import useCacheSelectOptions, {useCacheSelectOptionReturnType} from 'src/cm/hooks/useCacheSelectOptions/useCacheSelectOptions'

import {alignModeType, ControlOptionType} from '@cm/types/form-control-type'
import {StrHandler} from '@cm/class/StrHandler'
import {DH__switchColType} from '@cm/class/DataHandler/type-converter'
import {anyObject} from '@cm/types/utility-types'

export type useAdditionalBasicFormPropType = {
  columns: colType[][]
  formData?: anyObject
  values?: anyObject
  onFormItemBlur?: onFormItemBlurType
  focusOnMount?: boolean
  autoApplyProps?: {
    form?: any
  }
}

const useBasicFormProps = (props: useAdditionalBasicFormPropType) => {
  const [startFetchingOptions, setstartFetchingOptions] = useState(true)

  const useGlobalProps = useGlobal()
  const {onFormItemBlur, autoApplyProps = {}, values = undefined} = props
  const [formData, setformData] = useState(props.formData)
  const columns = useMemo(() => initColumns({autoApplyProps, columns: props.columns}), [props.columns])

  const extraFormSateDefaultValues = Object.fromEntries(
    columns.flat().map((col: colType) => {
      if (col.multipleSelect) {
        const midTableRecords = formData?.[StrHandler.capitalizeFirstLetter(col.multipleSelect.models.mid)] ?? []
        const selectedValues = Object.fromEntries(
          midTableRecords.map(d => {
            const optionId = col?.multipleSelect?.models?.option + `Id`
            return [d[optionId], true]
          })
        )

        return [col.id, selectedValues]
      }
      const value = undefined

      return [col.id, value]
    })
  )
  const [extraFormState, setextraFormState] = useState<extraFormStateType>(extraFormSateDefaultValues)

  const {defaultValues} = makeDefaultValues({columns, formData})

  const ReactHookForm: UseFormReturn = useForm({defaultValues: {...defaultValues}, mode: `all`})

  const latestFormData = getLatestFormData({formData, ReactHookForm})

  const Cached_Option_Props: useCacheSelectOptionReturnType = useCacheSelectOptions({
    columns,
    latestFormData,
    startFetchingOptions,
  })

  const formId = useId() //onSubmit時に他
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (props.focusOnMount !== false) {
      ReactHookForm.setFocus(columns?.[0]?.[0]?.id)
    }
  }, [])

  const useResetValue = useCallback(({col, field}) => useResetValueOrigin({col, field, ReactHookForm}), [ReactHookForm])

  const newestRecord = {...latestFormData, ...formData, ...values}

  /**Basic Form */
  const BasicFormCallback = useCallback(
    (AdditionalBasicFormProp: AdditionalBasicFormPropType) => {
      return (
        <BasicForm
          {...{
            useResetValue,
            values,
            formData,
            setformData,
            formRef,
            formId,
            onFormItemBlur,
            columns,
            ReactHookForm,
            extraFormState,
            setextraFormState,
            useGlobalProps,
            Cached_Option_Props,
            newestRecord,
            ...AdditionalBasicFormProp,
          }}
        />
      )
    },

    [
      //

      Cached_Option_Props.valueHasChanged,
      useGlobalProps.query,
      columns.flat().length,
      formData,
      values,
    ]
  )

  return {
    formRef,
    Cached_Option_Props,
    ReactHookForm,
    latestFormData,
    BasicForm: BasicFormCallback,
    extraFormState,
    setextraFormState,
  }
}

export default useBasicFormProps

export type AdditionalBasicFormPropType = {
  onSubmit?: (data: FieldValues, event?: React.BaseSyntheticEvent) => void
  wrapperClass?: string | ((props: anyObject) => string)
  ControlOptions?: ControlOptionType
  children?: any
  alignMode?: alignModeType
  style?: any
  latestFormData: any
}

const useResetValueOrigin = ({col, field, ReactHookForm}) => {
  if (confirm(`値をクリアしますか？`) === false) return

  const convertedType = DH__switchColType({type: col.type})

  let nullvalue
  switch (convertedType) {
    case 'text':
    case 'color':
    case 'time': {
      nullvalue = ''
      break
    }

    default: {
      nullvalue = null
      break
    }
  }
  ReactHookForm.setValue(col.id, nullvalue)

  field.onBlur()
}
