import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {ControlContextType} from '@cm/types/form-control-type'
import {cn} from '@shadcn/lib/utils'

const ErrorMessage = ({controlContextValue}) => {
  const {ReactHookForm, col, ControlOptions} = controlContextValue as ControlContextType
  const showErrorMessage = ControlOptions?.showErrorMessage ?? true

  const message = ReactHookForm?.formState?.errors[col.id]?.message?.toString()

  if (message && showErrorMessage) {
    return (
      <div
        className={cn(
          'absolute -bottom-4 right-2   flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-200',
          'min-w-[50px] text-end'
        )}
      >
        <div className=" gap-1 w-fit  ml-auto  ">
          <R_Stack className={` gap-0.5 flex-nowrap justify-start`}>
            <small className="text-red-700 text-xs font-medium leading-none">{message}</small>
          </R_Stack>
        </div>
      </div>
    )
  } else return <></>
}

export default ErrorMessage
