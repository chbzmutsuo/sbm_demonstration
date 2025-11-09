import {htmlProps} from '@cm/types/utility-types'
import {breakLines} from 'src/cm/lib/value-handler'

export const TitleDescription = (
  props: htmlProps & {
    titleSize?: number
    title?: any
    description?: any
    children?: any
  }
) => {
  const {className, title, description, titleSize = 20, children, ...rest} = props

  return (
    <div className={`wrap-break-word ${className}`} {...rest}>
      <h2 style={{fontSize: titleSize}} className={`text-primary-main rounded px-2 `}>
        {title ?? children}
      </h2>
      <div style={{fontSize: titleSize * 0.8, color: '#3c3c3c'}}>{breakLines(description)}</div>
    </div>
  )
}
