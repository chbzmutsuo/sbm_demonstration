'use client'

import React, {Fragment} from 'react'
import {onFormItemBlurType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'
import {C_Stack, R_Stack} from 'src/cm/components/styles/common-components/common-components'
import {FormProvider, UseFormReturn} from 'react-hook-form'
import {AdditionalBasicFormPropType} from 'src/cm/hooks/useBasicForm/useBasicFormProps'
import {useCacheSelectOptionReturnType} from 'src/cm/hooks/useCacheSelectOptions/useCacheSelectOptions'

import {adjustBasicFormProps} from '@cm/hooks/useBasicForm/lib/adjustBasicFormProps'
import ControlGroup from '@cm/hooks/useBasicForm/molecules/ControlGroup'
import {Card} from '@cm/shadcn/ui/card'

import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import {cn} from '@shadcn/lib/utils'

import {getUse2ColSpan} from '@cm/hooks/useBasicForm/lib/hookformMethods'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'
import {alignModeType} from '@cm/types/form-control-type'

export type useRegisterType = (props: {col: colType; newestRecord: any}) => {
  currentValue: any
  Register: any
}

export type useResetValueType = (props: {col: colType; field: any}) => void

export type BasicFormType = {
  formData: any
  setformData: any
  values: any
  columns: colType[][]
  latestFormData: any
  extraFormState: any
  setextraFormState: any
  useGlobalProps: any
  Cached_Option_Props: useCacheSelectOptionReturnType
  ReactHookForm: UseFormReturn
  formId: string
  formRef: any
  alignMode?: alignModeType
  // useRegister: useRegisterType
  useResetValue: useResetValueType
  onFormItemBlur?: onFormItemBlurType
} & AdditionalBasicFormPropType

const FormSection = React.memo(
  ({columns, ControlOptions, children}: {columns: colType[]; ControlOptions: any; children: React.ReactNode}) => {
    const colFormIndexGroupName = ControlOptions?.showLabel === false ? undefined : columns[0]?.form?.colIndex

    return (
      <>
        {isNaN(colFormIndexGroupName) && colFormIndexGroupName ? (
          <>
            <Card className={` px-4`}>
              <div className={`  text-primary-main text-center text-lg font-bold `}>{colFormIndexGroupName}</div>
              {children}
            </Card>
          </>
        ) : (
          children
        )}
      </>
    )
  }
)

const BasicForm = (props: BasicFormType) => {
  const {formRef, formId, alignMode, style, ControlOptions, columns, ReactHookForm} = adjustBasicFormProps(props)

  const onSubmit = async e => {
    const handleFormSubmit = props.onSubmit ? ReactHookForm.handleSubmit(props.onSubmit) : undefined
    e.preventDefault()

    const requiredColsRest = columns.flat().filter(col => col.form?.register?.required && !ReactHookForm.getValues(col.id))

    if (requiredColsRest.length > 0) {
      alert(`必須項目が入力されていません: ${requiredColsRest.map(col => col.label).join(', ')}`)
      return
    }
    const formElement = e.target as HTMLFormElement
    if (formElement?.getAttribute('id') === formId && handleFormSubmit) {
      return await handleFormSubmit(e)
    }
  }

  const ChildComponent = () => {
    if (props.children) {
      return <div className={alignMode === `row` ? `` : 'pb-2 pt-4'}>{props.children}</div>
    }
    return <></>
  }

  const {transposedRowsForForm} = makeFormsByColumnObj(columns)

  if (alignMode === `row`) {
    return (
      <div>
        <FormProvider {...ReactHookForm}>
          <form {...{ref: formRef, id: formId, onSubmit}}>
            <R_Stack>
              {transposedRowsForForm.map((columns, i) => {
                return (
                  <Fragment key={i}>
                    <div className={cn('row-stack gap-x-6')}>
                      {columns.map((col: colType, formItemIndex) => {
                        const uniqueKey = `${i}-${formItemIndex}`
                        return (
                          <div key={uniqueKey}>
                            <ControlGroup {...{...props, col, formItemIndex, alignMode}} />
                          </div>
                        )
                      })}
                      {/* ボタン */}
                    </div>
                    <ChildComponent />
                  </Fragment>
                )
              })}
            </R_Stack>
          </form>
        </FormProvider>
      </div>
    )
  } else if (alignMode === `rowBlock`) {
    return (
      <FormProvider {...ReactHookForm}>
        <form {...{ref: formRef, id: formId, onSubmit}}>
          <R_Stack className={` items-stretch w-full`}>
            {transposedRowsForForm.map((columns, i) => {
              return (
                <Fragment key={i}>
                  <FormSection {...{columns, ControlOptions}}>
                    <C_Stack className={cn(`gap-8`)}>
                      {columns.map((col: colType, formItemIndex) => {
                        const use2ColSpan = getUse2ColSpan(col)
                        const uniqueKey = `${i}-${formItemIndex}`
                        const colSpan = use2ColSpan ? `lg:col-span-2 ` : ` lg:col-span-1`

                        return (
                          <div key={uniqueKey} className={cn(colSpan)}>
                            <ControlGroup {...{...props, col, formItemIndex, alignMode}} />
                          </div>
                        )
                      })}
                      {/* ボタン */}
                    </C_Stack>
                  </FormSection>
                </Fragment>
              )
            })}
          </R_Stack>
          <div className={` flex justify-end`}>
            <ChildComponent />
          </div>
        </form>
      </FormProvider>
    )
  } else if (alignMode === 'col') {
    return (
      <div>
        <FormProvider {...ReactHookForm}>
          <form {...{ref: formRef, id: formId, onSubmit}}>
            <C_Stack className={` items-center`}>
              <C_Stack className={`items-center gap-8 `}>
                {transposedRowsForForm.map((columns, i) => {
                  return (
                    <Fragment key={i}>
                      <FormSection {...{columns, ControlOptions}}>
                        <C_Stack className={cn(`gap-8`)}>
                          {columns.map((col: colType, formItemIndex) => {
                            const use2ColSpan = getUse2ColSpan(col)
                            const uniqueKey = `${i}-${formItemIndex}`
                            const colSpan = use2ColSpan ? `lg:col-span-2 ` : ` lg:col-span-1`

                            return (
                              <div key={uniqueKey} className={cn(colSpan)}>
                                <ControlGroup {...{...props, col, formItemIndex, alignMode}} />
                              </div>
                            )
                          })}
                          {/* ボタン */}
                        </C_Stack>
                      </FormSection>
                    </Fragment>
                  )
                })}
              </C_Stack>
              <ChildComponent />
            </C_Stack>
          </form>
        </FormProvider>
      </div>
    )
  } else if (alignMode === 'grid') {
    return (
      <div>
        <FormProvider {...ReactHookForm}>
          <form {...{ref: formRef, id: formId, onSubmit}}>
            <AutoGridContainer
              maxCols={{xl: 2}}
              className={cn(
                //
                'gap-[40px] '
              )}
            >
              {transposedRowsForForm.map((columns, i) => {
                return (
                  <Fragment key={i}>
                    <FormSection {...{columns, ControlOptions}}>
                      <AutoGridContainer maxCols={{xl: 2}} className={`gap-[30px] gap-y-[60px]`}>
                        {columns.map((col: colType, formItemIndex) => {
                          const use2ColSpan = getUse2ColSpan(col)
                          const uniqueKey = `${i}-${formItemIndex}`
                          const colSpan = use2ColSpan ? `lg:col-span-2 ` : ` lg:col-span-1`

                          return (
                            <div key={uniqueKey} className={cn(colSpan)}>
                              <ControlGroup {...{...props, col, formItemIndex, alignMode}} />
                            </div>
                          )
                        })}
                        {/* ボタン */}
                      </AutoGridContainer>
                    </FormSection>
                  </Fragment>
                )
              })}
            </AutoGridContainer>
            <ChildComponent />
          </form>
        </FormProvider>
      </div>
    )
  } else if (alignMode === 'console') {
    return (
      <form {...{ref: formRef, id: formId, onSubmit}}>
        <C_Stack className={` items-start `}>
          <AutoGridContainer maxCols={{lg: 2}} className={` gap-8 mx-auto w-fit`}>
            {transposedRowsForForm.map((columns, i) => {
              const SectionLabel = columns.find(col => col.form?.colIndex)?.form?.colIndex

              return (
                <Fragment key={i}>
                  <div className={`  flex flex-col  `}>
                    <div className={` font-bold text-lg `}>{SectionLabel}</div>
                    {columns.map((col: colType, formItemIndex) => {
                      const use2ColSpan = getUse2ColSpan(col)
                      const uniqueKey = `${i}-${formItemIndex}`
                      const colSpan = use2ColSpan ? `lg:col-span-2 ` : ` lg:col-span-1`

                      return (
                        <div key={uniqueKey} className={cn(colSpan, 'mb-6')}>
                          <ControlGroup
                            {...{
                              ...props,
                              col,
                              formItemIndex,
                              alignMode: 'console',
                              ControlOptions: {
                                LabelStyle: {
                                  padding: '4px 8px',
                                  marginRight: '6px',

                                  backgroundColor: 'rgb(240, 240, 240)',
                                  width: 200,
                                  fontSize: '16px',
                                },
                                ControlStyle: {
                                  borderRadius: '0px',
                                },
                              },
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                </Fragment>
              )
            })}
          </AutoGridContainer>
        </C_Stack>
        <div className={`flex justify-center`}>
          <ChildComponent />
        </div>
      </form>
    )
  }
}

export default BasicForm

//カラム作成
const makeFormsByColumnObj = (columns: any) => {
  const validColumnsForEditForm: colType[] = columns.flat().filter(col => col.form && col?.form?.hidden !== true)
  const formsByColumnObj: any = {}

  validColumnsForEditForm.sort((x: colType, y: colType) => {
    return Number(x.originalColIdx) - Number(y.originalColIdx)
  })

  validColumnsForEditForm.forEach((col: colType) => {
    const colIndex = col?.form?.colIndex ?? 0
    obj__initializeProperty(formsByColumnObj, colIndex, [])
    formsByColumnObj[colIndex].push(col)
  })

  const transposedRowsForForm: colType[][] = Object.keys(formsByColumnObj).map(key => {
    return formsByColumnObj[key]
  })
  const colIndexes = Object.keys(formsByColumnObj)

  return {transposedRowsForForm, colIndexes}
}
