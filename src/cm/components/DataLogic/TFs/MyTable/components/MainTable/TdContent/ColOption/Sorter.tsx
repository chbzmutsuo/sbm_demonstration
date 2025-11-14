import {C_Stack, R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {ChevronDownIcon, ChevronUpIcon} from 'lucide-react'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

export const Sorter = ({col, addQuery, query}) => {
  const set = key => {
    addQuery({orderBy: key ? col.id : undefined, orderDirection: key})
  }

  const btns = [
    {
      label: `昇順`,
      key: `asc`,
      icon: '↑',
    },
    {
      label: `降順`,
      key: `desc`,
      icon: '↓',
    },
    {
      label: `解除`,
      key: undefined,
      icon: null,
    },
  ]

  return (
    <div className={`text-sm`}>
      <C_Stack className={` items-start gap-2`}>
        <div>
          <strong>{col.label}</strong>が
        </div>
        <R_Stack className={`gap-4 text-gray-700`}>
          {btns.map((b, i) => {
            const colid = col.id
            const activeByKey = b.key === query.orderDirection
            const activeByColId = colid === query.orderBy
            const active = query.orderDirection && activeByKey && activeByColId
            return (
              <div key={i}>
                <IconBtn
                  {...{
                    size: `sm`,
                    className: ` cursor-pointer`,
                    color: active ? `blue` : `gray`,
                    onClick: () => set(b.key),
                  }}
                >
                  <div className={` flex flex-nowrap`}>
                    {b.icon}
                    {b.label}
                  </div>
                </IconBtn>
              </div>
            )
          })}
        </R_Stack>
      </C_Stack>
    </div>
  )
}

export const SortIcon = (props: {isSet; direction: `asc` | `desc`}) => {
  const {direction, isSet} = props
  const color = direction === 'asc' ? 'text-error-main' : 'text-blue-main'
  const iconClass = `w-5 absolute ${color}`

  return (
    <div className={` onHover relative h-4  w-4 rounded-full text-sm    `}>
      <ChevronUpIcon className={`${iconClass} ${direction === `asc` && isSet ? `` : `opacity-20`} -top-[4px]`} />
      <ChevronDownIcon className={`${iconClass} ${direction === `desc` && isSet ? `` : `opacity-20`}  top-[2px]`} />
    </div>
  )
}
export default Sorter
