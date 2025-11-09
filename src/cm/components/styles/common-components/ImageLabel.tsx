import {htmlProps} from '@cm/types/utility-types'
import {CSSProperties} from 'react'

export const ImageLabel = (props: htmlProps & {label?: any; src: string; imgClass?: string; style?: CSSProperties}) => {
  const {label, src, imgClass = `inline-block rounded-sm bg-white shadow-md  p-1`, style = {width: 130}} = props

  return (
    <div className={`flex gap-4 items-center`}>
      {src && <img src={src} className={imgClass} style={style} />}
      {label && <span>{label}</span>}
    </div>
  )
}
