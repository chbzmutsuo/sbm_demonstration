// import {R_Stack} from 'src/cm/components/styles/common-components/common-components'
// import React, {useMemo} from 'react'
// import {UseFormReturn} from 'react-hook-form'

// type FormButtonsProps = {
//   myForm: {
//     create?: boolean
//   }
//   ReactHookForm: UseFormReturn
// }

// const FormButtons = React.memo(({myForm, ReactHookForm}: FormButtonsProps) => {
//   const {formState} = ReactHookForm
//   const {isSubmitting} = formState

//   // ボタンの表示状態をメモ化
//   const shouldShowButton = useMemo(() => {
//     return myForm?.create !== false
//   }, [myForm?.create])

//   if (!shouldShowButton) {
//     return null
//   }

//   return (
//     <R_Stack className="sticky bottom-0 justify-end bg-white p-2">
//       <button name="update" type="submit" className="t-btn" disabled={isSubmitting}>
//         確定
//       </button>
//     </R_Stack>
//   )
// })

// FormButtons.displayName = 'FormButtons'

// export default FormButtons
