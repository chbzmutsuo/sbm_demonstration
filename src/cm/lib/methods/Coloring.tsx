import React from 'react'
import {colorVariants} from '@cm/lib/methods/colorVariants'
import {htmlProps} from '@cm/types/utility-types'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {Text} from '@cm/components/styles/common-components/Alert'
export type TextProps = {
  asLink?: boolean
  color?: colorVariants | string
  inline?: boolean
}

export type iconBtnProps = {
  color?: colorVariants | string
  active?: boolean
  vivid?: boolean
  rounded?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}
export default function Coloring(props: {mode?: 'text' | 'bg'} & htmlProps & iconBtnProps & TextProps) {
  const {mode = 'bg', asLink, size, ...commonProps} = props
  if (mode === 'bg') {
    return <IconBtn {...{size, ...commonProps}} />
  }
  if (mode === 'text') {
    return <Text {...{asLink, ...commonProps}} />
  }
}
