import {cn} from '@shadcn/lib/utils'
import {htmlProps} from '@cm/types/utility-types'
import {colorVariants} from '@cm/lib/methods/colorVariants'

import {tv} from 'tailwind-variants'

export const Button = (
  props: htmlProps & {
    color?: colorVariants
    active?: boolean
    size?: 'xs' | 'sm' | 'md' | 'lg'
  }
) => {
  const {className, style, color, active, size = 'md', ...rest} = props

  const buttonVariants = tv({
    base: cn(
      `t-btn transition-all duration-300 ease-in-out transform shadow-md `,
      `ring-1 `,
      `focus:outline-none focus:ring-2  focus:ring-opacity-50`,
      `disabled:opacity-50 disabled:cursor-not-allowed `
    ),
    variants: {
      color: btnColorVariants,
      size: {
        xs: 'text-[12px] py-[1px] px-[8px] ',
        sm: 'text-[14px] py-[2px] px-[10px] ',
        md: 'text-[16px] py-[4px] px-[14px] ',
        lg: 'text-[18px] py-[6px] px-[18px] ',
      },
      active: {
        false: 'opacity-50 cursor-not-allowed',
        true: 'cursor-pointer',
      },
    },
    defaultVariants: {
      size: 'md',
      active: true,
    },
  })

  return (
    <button
      {...{
        className: buttonVariants({
          color: color as any,
          size,
          active: active !== false,
          class: className,
        }),
        style,
        ...rest,
      }}
    />
  )
}

export const btnColorVariants = {
  gray: 'bg-gray-main text-white hover:bg-gray-700 ring-gray-400',
  red: 'bg-error-main text-white hover:bg-red-600 ring-red-400',
  blue: 'bg-blue-main text-white hover:bg-blue-600 ring-blue-400',
  green: 'bg-green-main text-white hover:bg-green-600 ring-green-400',
  orange: 'bg-orange-main text-white hover:bg-orange-600 ring-orange-400',
  yellow: 'bg-yellow-main text-white hover:bg-yellow-500 ring-yellow-400',
  sub: 'bg-sub-main text-white hover:bg-sub-600 ',
  primary: 'bg-primary-main text-white hover:bg-primary-600 ring-primary-main',
}
