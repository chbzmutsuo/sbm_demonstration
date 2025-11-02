import React from 'react'
import {colorVariants} from '@cm/lib/methods/colors'
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
}
export default function Coloring(props: {mode?: 'text' | 'bg'} & htmlProps & iconBtnProps & TextProps) {
  const {mode = 'bg', ...rest} = props
  if (mode === 'bg') {
    const {asLink, ...rest} = props
    return <IconBtn {...rest} />
  }
  if (mode === 'text') {
    return <Text {...rest} />
  }
}
