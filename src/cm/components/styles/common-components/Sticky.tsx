import useWindowSize from '@cm/hooks/useWindowSize'
import {htmlProps} from '@cm/types/utility-types'

export const StickyTop = ({children, top, style, ...props}: {children: React.ReactNode; top?: number} & htmlProps) => {
  const {appbarHeight} = useWindowSize()
  return (
    <div
      {...props}
      style={{
        position: 'sticky',
        top: top ?? appbarHeight,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export const StickyBottom = ({children, bottom, style, ...props}: {children: React.ReactNode; bottom?: number} & htmlProps) => {
  return (
    <div
      {...props}
      style={{
        position: 'sticky',
        bottom: bottom ?? 0,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
