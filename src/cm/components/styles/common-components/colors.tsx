import {htmlProps} from '@cm/types/utility-types'
import {IconBtn} from 'src/cm/components/styles/common-components/IconBtn'

import {twMerge} from 'tailwind-merge'

export const ColoredText = (props: htmlProps & {bgColor?: string}) => {
  const {className, style, bgColor, children, ...rest} = props
  if (!bgColor) return <div>{children}</div>

  return (
    <IconBtn
      {...{
        color: bgColor,
        className: twMerge(className, 'border-none'),
        style: {height: '100%', fontSize: 12, textAlign: 'center', width: '100%', ...style},
        ...rest,
      }}
    >
      {children}
    </IconBtn>
  )
}
