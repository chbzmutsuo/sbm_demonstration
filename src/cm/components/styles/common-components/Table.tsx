import {NumHandler} from '@cm/class/NumHandler'
import {htmlProps} from '@cm/types/utility-types'
import {cn} from '@shadcn/lib/utils'

export const TableWrapper = (props: any & {className?: string; children: React.ReactNode}) => {
  const {className, children, useOriginalWrapperClass, ...rest} = props

  return (
    <div
      {...{
        className: cn(
          //
          className,
          useOriginalWrapperClass ? '' : `table-wrapper overflow-auto border-collapse w-fit  h-fit `
        ),
        ...rest,
      }}
    >
      {children}
    </div>
  )
}

export const TableBordered = (props: htmlProps & {size?: `sm` | `base` | `lg` | `xl`}) => {
  const {className, style, children, size = `base`, ...rest} = props
  let sizeClass = ''
  if (size === `sm`) {
    sizeClass = [
      //
      `[&_td]:p-[3px]`,
      `[&_td]:px-[5px]`,
      `[&_th]:p-[3px]`,
      `[&_th]:px-[5px]`,
    ].join(` `)
  }

  if (size === `base`) {
    sizeClass = [
      //
      `[&_td]:p-1.5`,
      `[&_th]:p-1.5`,
    ].join(` `)
  }

  if (size === `lg`) {
    sizeClass = [
      //
      `[&_td]:p-1`,
      `[&_td]:px-2.5`,
      `[&_th]:p-1`,
      `[&_th]:px-2.5`,
    ].join(` `)
  }
  if (size === `xl`) {
    sizeClass = [
      //
      `[&_td]:p-1`,
      `[&_td]:px-4`,
      `[&_th]:p-1`,
      `[&_th]:px-4`,
    ].join(` `)
  }

  return (
    <table
      {...{
        className: [
          //
          // `t-paper`,
          className,
          sizeClass,
          `[&_td]:align-top`,
        ].join(' '),
        style,
        ...rest,
      }}
    >
      {children}
    </table>
  )
}

export const Counter = (props: htmlProps & {children: number}) => {
  const {className, style, children, ...rest} = props
  return (
    <span {...rest} className={`${className} ${children ? '' : 'opacity-30'}`}>
      {children ? NumHandler.toPrice(children) : children}
    </span>
  )
}

export const NoEffectTd = (props: htmlProps) => {
  const {className, style, children, ...rest} = props
  return (
    <td {...rest} className={`${className} noEffect`}>
      {children}
    </td>
  )
}
