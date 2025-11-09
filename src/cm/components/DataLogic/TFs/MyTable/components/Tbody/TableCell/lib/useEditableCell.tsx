'use client'

import useBasicFormProps from 'src/cm/hooks/useBasicForm/useBasicFormProps'

import React from 'react'

import {toast} from 'react-toastify'
import {CssString} from 'src/cm/components/styles/cssString'

import {colType} from '@cm/types/col-types'
import {Fields} from 'src/cm/class/Fields/Fields'
import {UpsertMain} from '@cm/components/DataLogic/TFs/MyForm/helpers/UpsertMain'

const useEditableCell = (props: {record; col: colType; dataModelName; mutateRecords}) => {
  const {record, col, dataModelName, mutateRecords} = props
  if (!col.td?.editable) {
    return {}
  }

  const {upsertController = {}} = col.td?.editable

  const validateBeforeUpdate = async ({value, formData}) => {
    const validate = col?.form?.register?.validate
    if (validate) {
      const message = await validate?.(value, formData)
      return message
    }
  }

  const formStyle = {...(col?.td?.style ?? {}), width: '100%', maxWidth: 500, minHeight: undefined}

  const columns: colType[][] = new Fields([
    {
      ...col,
      inputProps: {
        [`data-usage`]: `editableCellInput`,
        ...col.inputProps,
      },
      form: {...col.form, style: formStyle},
    },
  ]).transposeColumns()

  const updateData = async data => {
    const latestFormData = {
      ...record,
      ...data,
    }

    //registerからvalidationをかける
    const message = await validateBeforeUpdate({value: data[col.id], formData: data})
    const doUpdate = message === undefined || message === true

    if (doUpdate === false) {
      toast.error(message, {position: `top-center`})
      return
    } else {
      const payload = {[col.id]: data[col.id]}
      const valuesOnKeyHasChanged = record[col.id] !== payload[col.id]

      if (valuesOnKeyHasChanged) {
        await UpsertMain({
          prismaDataExtractionQuery: {},
          latestFormData: {...latestFormData, ...payload},
          upsertController: upsertController,
          extraFormState: {},
          dataModelName,
          additional: {},
          formData: record,
          columns,
          toggleLoadFunc: async cb => {
            try {
              return await cb()
            } catch (error) {
              console.error(error.stack) //////////
              toast.error('エラーが発生しました。', {position: `top-center`})
            }
          },
        })

        mutateRecords({record: {...record, ...payload}})
      }
    }
  }

  const {
    BasicForm: EditableForm,
    ReactHookForm,
    latestFormData,
  } = useBasicFormProps({
    focusOnMount: false, //trueだとフォームが表示されるとフォーカスがあたり、無限更新が発生
    columns: columns, //col自体を変更するとあらゆるところで変更が反映されてしまう
    formData: record,
    values: record,
    onFormItemBlur: async props => {
      await updateData(props.newlatestFormData)
    },
  })

  const RawForm = (
    <div
      className={`bg-gray-100`}
      onKeyDown={async (e: React.KeyboardEvent<HTMLDivElement>) => {
        const validUsage = (e.target as HTMLElement).dataset.usage
        const validKey = e.key === 'Enter'

        if (validUsage && validKey) {
          await updateData(ReactHookForm.getValues())
        }
      }}
    >
      <EditableForm
        alignMode="row"
        latestFormData={latestFormData}
        ControlOptions={{
          controllClassName: CssString.table.editableCellFormControllClassName,
          showLabel: false,
          showDescription: false,
          ControlStyle: {
            ...(col.td?.editable?.style ?? {
              minWidth: `fit-content`,
              height: `fit-content`,
              margin: `auto`,
            }),
          },
        }}
      />
    </div>
  )

  return {
    EditableForm,

    RawForm,
    // globalEditMode,
    // setglobalEditMode,
    // editMode,
    // toggleEditMode,
  }
}
export default useEditableCell
