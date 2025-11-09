'use client'

import useWindowSize from 'src/cm/hooks/useWindowSize'
import {cl} from 'src/cm/lib/methods/common'

import React, {CSSProperties} from 'react'
export const FitMargin = (props: htmlProps) => {
  const {className, style, ...rest} = props
  return (
    <div className={`mx-auto w-fit ${className}`} {...rest}>
      {props.children}
    </div>
  )
}
export const MyContainer = (
  props: htmlProps & {
    className?: string
    children?: React.ReactNode
  } & any
) => {
  const {className, style, children, ...rest} = props
  return (
    <div className={cl('w-fit mx-auto', className)} {...rest}>
      {props.children}
    </div>
  )
}
export const R_Stack = (props: htmlProps) => {
  const {className, ...rest} = props
  return <div className={cl(`row-stack`, className)} {...rest} />
}

export const C_Stack = (props: htmlProps) => {
  const {className, ...rest} = props
  return <div className={cl(`col-stack`, className)} {...rest} />
}

export const Absolute = (
  props: htmlProps & {
    top?: number
    bottom?: number
    right?: number
    left?: number
  }
) => {
  const {className, style, top, bottom, right, left, ...rest} = props

  return (
    <div
      {...{
        className: cl(`absolute-center`, className),
        style: {top, bottom, right, left, ...style},
        ...rest,
      }}
    />
  )
}

export const CenterScreen = (props: htmlProps) => {
  const {bodyHeight} = useWindowSize()
  const {className, style = {height: bodyHeight, width: '95vw', margin: 'auto', overflow: 'auto'}, children, ...rest} = props

  return (
    <div
      {...{
        className: cn(`flex justify-center items-center`, className),
        style,
        ...rest,
      }}
    >
      <>{children}</>
    </div>
  )
}

export const Center = (props: htmlProps) => {
  const {className, style, children, ...rest} = props
  return (
    <div
      {...{
        className: cn(`flex justify-center items-center`, className),
        style,
        ...rest,
      }}
    >
      <>{children} </>
    </div>
  )
}

export const NoData = (props: {style?: React.CSSProperties; children?: React.ReactNode}) => {
  const {style, children} = props
  return (
    <Center className={`   bg-sub-light  h-full w-full  rounded-md `} style={{...style}}>
      <span className="">{children ?? 'データがありません'}</span>
    </Center>
  )
}

export const Divider = () => {
  return <div className={` bg-sub-light my-auto h-[100%] w-[.125rem]`}></div>
}

export const KeyValuePair = props => {
  const {children, label, wrapperClass = `row-stack`, labelClass = ' font-bold w-[9.375rem] '} = props

  return (
    <div className={wrapperClass}>
      <div className={labelClass}>{label}</div>
      {children}
    </div>
  )
}

export const Circle = (
  props: htmlProps & {
    width?: number
    size?: number
    height?: number
    color?: colorVariants
    inline?: boolean
  }
) => {
  const {className, style: originalStyle, size = 24, inline = true, color = 'blue', children, ...rest} = props

  let {width, height} = props
  if (size) {
    width = width ?? size
    height = height ?? size
  }

  const style = {width: width, height: height ?? width, ...props.style}

  return (
    <>
      <span className={cl(inline ? 'mx-1 inline! w-fit' : '')}>
        <span
          {...{
            className: cl(`rounded-full border inline-block! `, iconBtnColorVariants[color], className),
            style,
            ...rest,
          }}
        >
          <Center>{children}</Center>
        </span>
      </span>
    </>
  )
}

import JsonFormatter from 'react-json-formatter'

import {CssString} from 'src/cm/components/styles/cssString'
import {Z_INDEX} from '@cm/lib/constants/constants'
import {colorVariants} from '@cm/lib/methods/colorVariants'
import {iconBtnColorVariants} from '@cm/components/styles/common-components/IconBtn'
import {cn} from '@shadcn/lib/utils'
import {htmlProps} from '@cm/types/utility-types'

export const ParseJSON = ({json}) => {
  const jsonStyle = {
    propertyStyle: {color: 'red'},
    stringStyle: {color: 'green'},
    numberStyle: {color: 'darkorange'},
  }

  return (
    <div className={`h-[12.5rem] overflow-auto`}>
      <JsonFormatter json={json} tabWith={4} jsonStyle={jsonStyle} />
    </div>
  )
}

export const Padding = (props: htmlProps & {paddingClass?: string}) => {
  const {className, style, ...rest} = props
  return (
    <div
      {...{
        className: cn('p-4', className),
        style,
        ...rest,
      }}
    />
  )
}

// export const Flex = React.memo(
//   (props: {
//     direction?: 'row' | 'column'
//     gapPixel?: number | string
//     wrapperWidth?: number
//     wrapperHeight?: number | string
//     items: any[]
//     itemWidth?: number
//     styling?: styling
//   }) => {
//     const {
//       gapPixel = 4,
//       items,
//       direction = `row`,
//       itemWidth = 150,
//       wrapperHeight,
//       wrapperWidth: wrapperWidthOrigin,
//       ...rest
//     } = props
//     const windowWidth = useWindowSize().width
//     const vw80 = windowWidth * 0.8
//     const wrapperWidth = Math.min(wrapperWidthOrigin ?? vw80, vw80)

//     const {styles, classes} = props.styling ?? {}
//     const {colCount} = getColCount({wrapperWidth})

//     const widthRatio = Math.round(100 / colCount) + '%'

//     const empty = new Array(Math.max(colCount - (items.length ?? 1 % colCount ?? 1), 0)).fill('')

//     const wrapperStyle: CSSProperties = {
//       display: 'flex',
//       flexWrap: `wrap`,
//       justifyItems: 'start',
//       alignItems: `start`,
//       flexDirection: direction,
//       margin: `auto`,
//       maxHeight: wrapperHeight,
//       // overflow: 'auto',
//       minWidth: Math.min(itemWidth * (colCount + 1), wrapperWidth),

//       maxWidth: wrapperWidth,
//       ...styles?.wrapper,
//     }

//     const showEmptyCols = items.length > empty.length
//     return (
//       <div {...{style: wrapperStyle, className: cl(classes?.wrapper), ...rest}}>
//         {items.map((item, i) => {
//           return <SingleWrapper key={i}>{item}</SingleWrapper>
//         })}
//         {showEmptyCols &&
//           empty.map((item, i) => {
//             return (
//               <SingleWrapper key={i}>
//                 <div></div>
//               </SingleWrapper>
//             )
//           })}
//       </div>
//     )

//     function getColCount({wrapperWidth}) {
//       let colCount = 1
//       for (let i = 1; i <= 5; i++) {
//         const threshold = itemWidth * i

//         const hit = threshold <= wrapperWidth

//         if (hit) {
//           colCount = i
//         } else {
//           break
//         }
//       }
//       return {colCount: Math.min(colCount, items.length)}
//     }

//     function SingleWrapper({children}) {
//       return (
//         <div style={{padding: gapPixel, ...(direction === 'row' ? {width: widthRatio} : {})}}>
//           <div className={`mx-auto flex h-full items-stretch justify-center`}>{children}</div>
//         </div>
//       )
//     }
//   }
// )

export const Vr = (props: htmlProps) => {
  const {className, style, children, ...rest} = props
  const wrapperClass = cl(` w-[0rem] border-r-[.0625rem]  `, className)
  const wrapperStyle: CssString = {...style, writingMode: 'vertical-lr', textAlign: `center`}

  if (children) {
    return (
      <div
        {...{
          className: wrapperClass,
          style: wrapperStyle,
          ...rest,
        }}
      >
        {children}
      </div>
    )
  }
  return (
    <div
      {...{
        className: wrapperClass,
        style: wrapperStyle,
        ...rest,
      }}
    >
      <span className={`text-transparent`}>-</span>
    </div>
  )
}

export const Box = (
  props: htmlProps & {
    margin?: string
    width?: any
    height?: any
    maxWidth?: any
    maxHeight?: any
    style?: CSSProperties
  }
) => {
  const {margin = `auto`, width, height, maxWidth = `80vw`, maxHeight, style, ...rest} = props

  return (
    <div
      {...rest}
      {...{
        style: {margin, width, height, maxHeight, maxWidth, overflow: `auto`, ...style},
      }}
    >
      {props.children}
    </div>
  )
}

export const NodataPlaceHolder = () => {
  return <small className={`opacity-30`}>-</small>
}

export const FloatingDataChecker = ({json}) => {
  return (
    <div
      style={{zIndex: Z_INDEX.modal}}
      className={`fixed left-4 top-4  max-h-[300px] max-w-[300px] overflow-auto rounded-sm  bg-white p-2 shadow-sm`}
    >
      <JsonFormatter json={json} />
    </div>
  )
}
