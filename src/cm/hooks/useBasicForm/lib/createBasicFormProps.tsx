import {useRegisterOrigin} from '@cm/hooks/useBasicForm/lib/useRegisterOrigin'
import useWindowSize from '@cm/hooks/useWindowSize'

export const adjustBasicFormProps = props => {
  const {PC} = useWindowSize()

  const {alignMode = 'console', ControlOptions = {}, ...restProps} = props

  if (alignMode === 'row') {
    ControlOptions.ControlStyle = {...ControlOptions?.ControlStyle, minHeight: undefined}
    ControlOptions.direction = 'horizontal'
  }

  const {latestFormData, ReactHookForm, onFormItemBlur, formData} = restProps
  const columns = props.columns.map(cols => {
    return cols.map(col => {
      const {Register} = useRegisterOrigin({
        col,
        newestRecord: latestFormData,
        ReactHookForm,
        onFormItemBlur,
        formData,
        latestFormData,
      })
      return {...col, Register}
    })
  })

  return {
    ...restProps,
    columns,
    alignMode,
    // wrapperClass,
    ControlOptions,
  }
}
