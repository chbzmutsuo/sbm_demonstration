'use client'

import {RegisterOptions} from 'react-hook-form'

import {funcOrVar} from '@cm/lib/methods/common'

import {DH__convertDataType} from '@cm/class/DataHandler/type-converter'

export const useRegisterOrigin = ({newestRecord, col, ReactHookForm, onFormItemBlur, formData, latestFormData}) => {
  const currentValue = ReactHookForm.watch(col?.id)
  const registerProps: RegisterOptions = funcOrVar(col?.form?.register, {latestFormData, col, ReactHookForm})

  if (col?.form?.disabled) {
    col.form.disabled = funcOrVar(col?.form?.disabled, {record: newestRecord, col})
  }

  return {
    currentValue: currentValue,
    Register: ReactHookForm.register(col?.id, {
      ...registerProps,
      onBlur: async e => {
        const {target} = e
        const {id, value, name} = target

        if (onFormItemBlur) {
          const validate = col?.form?.register?.validate
          if (validate) {
            const message = await validate?.(value, formData)
            if (message) {
              ReactHookForm.setValue(col.id, null)
              return alert(message)
            }
          }

          const newlatestFormData = {...latestFormData, [name]: value}
          await onFormItemBlur({id, value, name, e, newlatestFormData, ReactHookForm})
        }
      },

      setValueAs: value => {
        const result = DH__convertDataType(value ?? null, col?.type, `server`)
        return result
      },
    }),
  }
}
