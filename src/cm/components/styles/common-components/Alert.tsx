import {colorVariants} from '@cm/lib/methods/colorVariants'
import {tv} from 'tailwind-variants'
import React from 'react'
import {htmlProps} from '@cm/types/utility-types'
import {TextProps} from '@cm/lib/methods/Coloring'
import {iconBtnColorVariants} from '@cm/components/styles/common-components/IconBtn'
import {cl} from '@cm/lib/methods/common'
import {colorClassMaster} from '@cm/lib/methods/colorVariants'

export const textColorVariants: Record<colorVariants, string> = {
  gray: 'text-gray-500 ',
  red: 'text-error-main',
  blue: 'text-blue-main',
  green: 'text-green-main',
  orange: 'text-orange-600',
  yellow: 'text-yellow-main ',
  sub: 'text-sub-main',
  primary: 'text-primary-main',
  transparent: 'text-transparent',
  '': '',
}

export const alertColorVariants: Record<colorVariants, string> = {
  gray: 'bg-gray-50 !border-gray-500 text-gray-800',
  red: 'bg-red-50 !border-red-500 text-error-main',
  blue: 'bg-blue-50 !border-blue-500 text-blue-main',
  green: 'bg-green-50 !border-green-500 text-green-main',
  orange: 'bg-orange-50 !border-orange-500 text-orange-600',
  yellow: 'bg-yellow-50/60 !border-yellow-500 text-yellow-700',
  sub: 'bg-sub-light !border-sub-main text-sub-main',
  primary: 'bg-primary-light !border-primary-main text-primary-main',
  transparent: 'bg-transparent !border-transparent text-transparent',
  '': '',
}

export const Alert = (props: htmlProps & {color?: colorVariants}) => {
  const {className, style, color = 'sub', ...rest} = props

  const alertVariants = tv({
    base: 'border p-2 rounded-md shadow',
    variants: {color: alertColorVariants},
  })

  const elementProps = {
    className: alertVariants({color, class: className}),
    style,
    role: 'alert',
    ...rest,
  }

  return <div {...elementProps} />
}

const textVariants = tv({
  variants: {color: textColorVariants},
})

export const Text = (props: htmlProps & TextProps) => {
  const {className, style, color = `red`, asLink = false, ...rest} = props

  const colorUndetected = !iconBtnColorVariants[color ?? ''] && color
  const colorClass = colorUndetected ? '' : colorClassMaster.text[color]

  const customeStyle = {
    ...(colorUndetected
      ? {
          color: color,
        }
      : {}),
    ...style,
  }

  const elementProps = {
    ...{
      className: cl(colorClass, asLink ? 'underline underline-offset-2 cursor-pointer' : '', className),
      style: customeStyle,
      ...rest,
    },
  }
  return <span {...elementProps} />
}

export const TextLink = (props: htmlProps) => <Text {...props} color={`blue`} className={`t-link`} />
export const TextBlue = (props: htmlProps) => <Text {...props} color={`blue`} />
export const TextRed = (props: htmlProps) => <Text {...props} color={`red`} />
export const TextGreen = (props: htmlProps) => <Text {...props} color={`green`} />
export const TextYellow = (props: htmlProps) => <Text {...props} color={`yellow`} />
export const TextSub = (props: htmlProps) => <Text {...props} color={`sub`} />
export const TextPrimary = (props: htmlProps) => <Text {...props} color={`primary`} />
export const TextGray = (props: htmlProps) => <Text {...props} color={`gray`} />
export const TextOrange = (props: htmlProps) => <Text {...props} color={`orange`} />
