'use client'

import {R_Stack} from 'src/cm/components/styles/common-components/common-components'
import {MinusCircle, PlusCircle} from 'lucide-react'
import {cl} from 'src/cm/lib/methods/common'
import {useState} from 'react'

import {styling} from 'src/cm/components/styles/common-components/type'

export type AccordiongPropType = {
  styling?: styling
  label
  children?: any
  exclusiveTo?: boolean
  defaultOpen?: boolean
  closable?: boolean
  hideLabelWhenOpen?: boolean
}
const MyAccordion = (props: AccordiongPropType) => {
  const {
    styling,
    label,
    children,
    defaultOpen = props.closable === false ? true : false,
    closable = true,
    hideLabelWhenOpen = false,
    ...rest
  } = props

  const [open, setopen] = useState(defaultOpen)

  const wrapperClass = cl(`bg-gray-200 p-2 mb-1 rounded  border  relative  flex-nowrap justify-between`)

  const labelClass = cl(` flex-nowrap text-sub-main  `, closable ? '  onHover' : ' ', ` w-full px-1 `)

  const childrenClass = ` animate-fade-in pt-1`
  const toggle = () => {
    if (closable !== false) {
      setopen(!open)
    }
  }

  const showMainLabel = !open || hideLabelWhenOpen === false
  const MainLabel = () => {
    return (
      <>
        <button
          {...{
            type: `button`,
            onClick: toggle,
            style: {...styling?.styles?.label},
            className: cl(labelClass, styling?.classes?.label),
          }}
        >
          <R_Stack className={` w-full justify-between `}>
            <span>{label}</span>
            {closable !== false && <Arrow />}
            {/* {!open && <Arrow />} */}
          </R_Stack>
        </button>
      </>
    )
  }

  const Arrow = () => {
    const Icon = open ? MinusCircle : PlusCircle
    return (
      <Icon
        {...{
          onClick: toggle,
          className: cl(`text-gray-500 onHover w-6  `),
        }}
      />
    )
  }

  return (
    <div
      style={{...styling?.styles?.wrapper, position: `relative`}}
      className={cl(styling?.classes?.wrapper, wrapperClass)}
      {...rest}
    >
      {showMainLabel && <MainLabel />}
      {open && (
        <div>
          <div style={styling?.styles?.value} className={cl(``, childrenClass, styling?.classes?.value)}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAccordion
