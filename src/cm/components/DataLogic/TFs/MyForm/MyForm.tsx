'use client'
import React, {useId, useMemo, useCallback} from 'react'
import {DetailPagePropType} from '@cm/types/types'
import FormHeader from '@cm/components/DataLogic/TFs/MyForm/components/FormHeader'
import {myFormDefault} from 'src/cm/constants/defaults'
import {Button} from 'src/cm/components/styles/common-components/Button'
import useBasicFormProps from 'src/cm/hooks/useBasicForm/useBasicFormProps'
import {liftUpNewValueOnChangeType} from '@cm/types/form-control-type'
import {UseFormReturn} from 'react-hook-form'
import {prismaDataExtractionQueryType} from '@cm/components/DataLogic/TFs/Server/Conf'
import {useFormSubmit} from './hooks/useFormSubmit'

const MyForm = React.memo<DetailPagePropType>(props => {
  const prismaDataExtractionQuery = props?.prismaDataExtractionQuery as prismaDataExtractionQueryType

  // プロパティをメモ化（依存関係を細分化）
  const memoizedProps = {...props, myForm: {...myFormDefault, ...props.myForm}}
  const {mutateRecords, dataModelName, myForm, formData, setformData, columns, editType, additional} = memoizedProps

  const formId = useId()

  // onFormItemBlurをメモ化（より効率的に）
  const onFormItemBlur = useMemo(() => {
    const flatColumns = columns.flat()
    return flatColumns.find(col => col?.onFormItemBlur)?.onFormItemBlur
  }, [columns])

  // BasicFormPropsの引数をメモ化
  const basicFormPropsArgs = useMemo(
    () => ({
      columns: memoizedProps?.columns,
      formData: formData ?? {},
      values: formData ?? {},
      autoApplyProps: {},
      onFormItemBlur: onFormItemBlur,
    }),
    [memoizedProps?.columns, formData, onFormItemBlur]
  )

  const {BasicForm, ReactHookForm, extraFormState, latestFormData} = useBasicFormProps(basicFormPropsArgs)

  // フォーム送信フックの引数をメモ化
  const formSubmitArgs = useMemo(
    () => ({
      prismaDataExtractionQuery,
      myForm,
      dataModelName,
      additional,
      formData,
      columns,
      mutateRecords,
      setformData,
      editType,
    }),
    [prismaDataExtractionQuery, myForm, dataModelName, additional, formData, columns, mutateRecords, setformData, editType]
  )

  const {uploading, handleOnSubmit} = useFormSubmit(formSubmitArgs)

  // 送信ハンドラーをメモ化
  const wrappedHandleOnSubmit = useCallback(async () => {
    return handleOnSubmit(latestFormData, extraFormState)
  }, [handleOnSubmit, latestFormData, extraFormState])

  // 計算値をメモ化
  const updateMode = !!formData?.id
  const formElementId = useMemo(() => `myform-${formId}`, [formId])
  const buttonText = updateMode ? '更新' : '新規作成'
  // const buttonColor = useMemo(() => (updateMode ? 'blue' : 'primary'), [updateMode])

  // customActionsの引数をメモ化
  const customActionsArgs = useMemo(() => ({...memoizedProps, ReactHookForm}), [memoizedProps, ReactHookForm])

  // スタイルをメモ化
  const containerStyle = {...myForm?.style, maxHeight: undefined}

  return (
    <div id={formElementId} style={containerStyle}>
      <section>
        <FormHeader myForm={myForm} formData={formData} />
        <div>{myForm?.customActions && myForm.customActions(customActionsArgs)}</div>
      </section>

      <section className="mx-auto w-fit ">
        <div className={`pb-8`}>
          <BasicForm
            alignMode={myForm?.alignMode}
            latestFormData={latestFormData}
            onSubmit={wrappedHandleOnSubmit}
            ControlOptions={myForm?.basicFormControlOptions}
          >
            <div className="flex justify-end w-full pt-2 text-center">
              <Button color="blue" disabled={uploading} size="lg" className=" max-w-[80vw] " type="submit">
                {buttonText}
              </Button>
            </div>
          </BasicForm>
        </div>
      </section>
    </div>
  )
})

MyForm.displayName = 'MyForm'

export default MyForm

// liftUpNewValueOnChange関数も最適化
export const liftUpNewValueOnChange: liftUpNewValueOnChangeType = (props: {
  id: string
  newValue: any
  ReactHookForm: UseFormReturn
}) => {
  const {id, newValue, ReactHookForm} = props

  try {
    ReactHookForm.setValue(id, newValue)
  } catch (error: any) {
    console.error(`Failed to set form value for field "${id}":`, error?.message || error)
  }
}
