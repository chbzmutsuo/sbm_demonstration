'use client'

import {R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {cl} from 'src/cm/lib/methods/common'

import {AccordiongPropType} from 'src/cm/components/utils/Accordions/Accordion'
import {useJotaiByKey} from '@cm/hooks/useJotai'
import {ChevronRight} from 'lucide-react'

const GlobalAccordion = (props: AccordiongPropType & {id: string}) => {
  const {styling, label, children, defaultOpen = props.closable === false ? true : false, closable = true, id, ...rest} = props

  const [open, setopen] = useJotaiByKey<boolean>(`globalAccordionOpen`, null)

  const wrapperClass = cl(``)
  const labelClass = cl(
    ` flex-nowrap  font-bold`,
    closable ? '  onHover' : ' ',
    ` p-1 text-primary-main w-full lg:text-lg xl:text-xl`
  )

  const childrenClass = `    p-1`
  const toggle = () => {
    if (closable !== false) {
      setopen(!open)
    }
  }

  return (
    <div style={styling?.styles?.wrapper} className={cl(styling?.classes?.wrapper, wrapperClass)} {...rest}>
      <div
        {...{
          onClick: toggle,
          style: styling?.styles?.label,
          className: cl(labelClass, styling?.classes?.label),
        }}
      >
        <div className={` w-full justify-between `}>
          <R_Stack className={`flex-nowrap`}>
            <ChevronRight className={cl(` h-5 font-bold duration-300`, open ? ` rotate-90  ` : ` rotate-0`)} />
            {label}
          </R_Stack>
        </div>
      </div>

      {open && (
        <div>
          {/* <hr /> */}
          <div style={styling?.styles?.value} className={cl(``, childrenClass, styling?.classes?.value)}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalAccordion
