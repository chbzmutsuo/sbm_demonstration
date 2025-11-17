'use client'

import {BasicFormType} from '@cm/hooks/useBasicForm/BaiscForm'
import {getFormProps, getStyleProps} from '@cm/hooks/useBasicForm/lib/hookformMethods'
import React, {Fragment, useCallback, useMemo} from 'react'
import {Controller} from 'react-hook-form'
import {ControlContextType} from '@cm/types/form-control-type'
import {liftUpNewValueOnChange} from '@cm/components/DataLogic/TFs/MyForm/MyForm'
import {DH__switchColType} from '@cm/class/DataHandler/type-converter'
import Label from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/util-components/Label'
import {cn} from '@shadcn/lib/utils'
import {Alert} from '@cm/components/styles/common-components/Alert'
import LeftControlRight from './LeftControlRight'
import Description from './Description'
import useWindowSize from '@cm/hooks/useWindowSize'

export type ControlGroupPropType = BasicFormType & {
  col
  formItemIndex
  latestFormData
}
export const ControlGroup = React.memo((props: ControlGroupPropType) => {
  const {ReactHookForm, formData, useResetValue, latestFormData, formId, ControlOptions, col, columns, alignMode} = props
  const messages = ReactHookForm?.formState?.errors
  const {Register} = col

  const {PC, SP} = useWindowSize()

  if (!col?.id && col?.label) {
    return (
      <Fragment>
        <Alert>col.label error</Alert>
      </Fragment>
    )
  } else {
    return (
      <Controller
        name={col.id}
        control={ReactHookForm.control}
        render={({field}) => {
          const errorMessage = messages?.[col.id]?.message?.toString()

          const {
            id: wrapperId,
            ControlStyle,
            isBooleanType,
          } = getStyleProps({ControlOptions, col, PC, alignMode: props.alignMode})

          const currentValue = props.ReactHookForm?.getValues(col.id)

          const type = DH__switchColType({type: col.type})
          const pointerClass = type === `boolean` ? ' cursor-pointer' : ''

          const required = !!col?.form?.register?.required

          col.inputProps = {
            ...col.inputProps,
            placeholder: col.inputProps?.placeholder,
            required,
          }

          const controlContextValue: ControlContextType = {
            ...props,
            ControlStyle,
            ControlOptions,
            errorMessage,
            formId,
            col,
            wrapperId,
            columns,
            field,
            isBooleanType,
            currentValue,
            Register,
            formProps: getFormProps({ControlOptions, isBooleanType, Register, col, errorMessage, currentValue}),
            liftUpNewValueOnChange,
            useResetValue,
            pointerClass,
            type,
          }

          const horizontal = props.alignMode === `row` || (props.alignMode === 'console' && !SP)

          const showDescription = ControlOptions?.showDescription !== false && col.form?.descriptionNoteAfter

          const {reverseLabelTitle} = col.form

          const LabelCallback = useCallback(
            (props: {position: 'left' | 'right'}) => {
              const {position} = props

              if (position === 'left' && !reverseLabelTitle) {
                return (
                  <Label
                    {...{
                      className: cn(horizontal ? 'mr-0' : `mb-0.5`, 'min-w-fit '),
                      horizontal,
                      ReactHookForm,
                      col,
                      ControlOptions,
                      required,
                    }}
                  />
                )
              }
              if (position === 'right' && reverseLabelTitle) {
                return (
                  <div>
                    {
                      <Label
                        {...{
                          className: '',
                          horizontal,
                          ReactHookForm,
                          col,
                          ControlOptions,
                          required,
                        }}
                      />
                    }
                  </div>
                )
              }

              return <></>
            },
            [ReactHookForm, reverseLabelTitle, ControlOptions, required, col]
          )

          // const offset = 0
          // const style = !horizontal ? {} : undefined

          const PcFormMemo = useMemo(() => {
            return (
              <div
                id={wrapperId}
                className={cn(
                  //
                  `relative `,
                  DH__switchColType({type: col.type}) === `boolean` ? ' cursor-pointer' : ''
                )}
              >
                <div
                  className={cn(
                    //
                    `gap-0 w-full`,
                    horizontal
                      ? cn(
                          `row-stack flex-nowrap  `,
                          'items-stretch'
                          // props.alignMode === 'console' && props.col.type === 'textarea' ? 'items-start' : 'items-stretch'
                        )
                      : 'col-stack'
                  )}
                >
                  <LabelCallback position="left" />

                  <div>
                    <LeftControlRight
                      {...{
                        col,
                        controlContextValue,
                      }}
                    />
                    {showDescription && (
                      <Description
                        {...{
                          col,
                          ControlStyle,
                          currentValue,
                          formData,
                          latestFormData,
                        }}
                      />
                    )}
                  </div>

                  <LabelCallback position="right" />
                </div>
              </div>
            )
          }, [wrapperId, horizontal, col, ControlStyle, showDescription, formData, latestFormData])

          return (
            <div>
              <div>{PcFormMemo}</div>
            </div>
          )
        }}
      />
    )
  }
})

export default ControlGroup
