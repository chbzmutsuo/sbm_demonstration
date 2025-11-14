import {CSSProperties} from 'react'

import {cl} from 'src/cm/lib/methods/common'
import {R_Stack} from 'src/cm/components/styles/common-components/common-components'
import {IconBtn} from 'src/cm/components/styles/common-components/IconBtn'

import {EasySearchObject} from '@cm/class/builders/QueryBuilderVariables'

import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import {twMerge} from 'tailwind-merge'
import useMyNavigation from '@cm/hooks/globalHooks/useMyNavigation'
import {cn} from '@cm/shadcn/lib/utils'

export type EsButtonProps = {
  IsSingleItemGroup: boolean
  dataSource: EasySearchObject
  count: number
  isActive: boolean
  conditionMatched: boolean
  createNextQuery
}
export const EsButton = (props: EsButtonProps) => {
  const {addQuery, router, query, pathname, shallowAddQuery} = useMyNavigation()
  const {IsSingleItemGroup, dataSource, count, isActive, createNextQuery} = props
  const {label, notify} = dataSource ?? {}

  const notZero = count > 0

  const countBtnStyle: CSSProperties = {
    ...(notZero && notify ? (typeof notify === 'object' ? notify : {}) : {}),
  }

  let iconBtnColor = isActive ? '' : !notZero ? '' : notZero && notify ? 'red' : `gray`
  if (typeof notify === 'object') {
    iconBtnColor = 'yellow'
  }

  const activeClass = twMerge(
    isActive
      ? 'bg-white ring-2 ring-primary-main bg-primary-main/30  animate-pulse  rounded scale-110 text-gray-900 font-bold shadow-lg '
      : ''
  )

  const nextQuery = createNextQuery({dataSource})

  return (
    <div
      onClick={() => shallowAddQuery(nextQuery)}
      className={cl(
        //
        `transition-all duration-200 transform    `,
        `flex h-[26px] items-center    hover:bg-gray-200 onHover`,
        ` transition-colors  `,
        `p-0.5 text-xs gap-0.5`,
        `sm:p-1 sm:text-sm  sm:gap-1`,
        activeClass
      )}
    >
      <MarkDownDisplay className={` text-[11px] leading-3 `}>{label}</MarkDownDisplay>
      {/* } */}
      <IconBtn
        {...{
          size: 'sm',
          className: cn('!px-[1px] !py-[0px] ', notZero ? '' : 'opacity-50'),
          color: iconBtnColor,

          // style: countBtnStyle,
        }}
      >
        <div>{count}</div>
      </IconBtn>
    </div>
  )
  return (
    <R_Stack
      className={`
       ${isActive ? ' animate-pulse' : ''}
       relative  h-full items-stretch gap-0.5 `}
      onClick={() => {
        createNextQuery({dataSource})
      }}
    >
      <IconBtn
        {...{
          // className: CLs.wrapper,
          active: notZero,
        }}
      >
        <R_Stack className={`items-center gap-0.5 text-xs`}>
          {IsSingleItemGroup ? <></> : <MarkDownDisplay className={` leading-3`}>{label}</MarkDownDisplay>}

          <div {...{style: countBtnStyle}}>{count}</div>
        </R_Stack>
      </IconBtn>
    </R_Stack>
  )
}
