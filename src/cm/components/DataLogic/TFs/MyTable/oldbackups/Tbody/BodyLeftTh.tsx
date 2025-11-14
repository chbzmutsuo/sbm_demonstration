import React, {Fragment} from 'react'

import {R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {cl} from 'src/cm/lib/methods/common'

import {ArrowUpDownIcon} from 'lucide-react'
import useWindowSize from '@cm/hooks/useWindowSize'
import {getColorStyles} from '@cm/lib/methods/colors'

export const BodyLeftTh = ({myTable, showHeader, rowColor, dndProps, rowSpan, colSpan, recordIndex, children}) => {
  const {SP, PC} = useWindowSize()

  const className = cl(`p-0.5  items-center  gap-0.5 gap-x-2 flex-nowrap`, showHeader && !SP ? `row-stack` : `col-stack gap-2`)
  return (
    <Fragment>
      <th
        style={{
          background: getColorStyles(rowColor).backgroundColor,
        }}
        {...{rowSpan, colSpan, className: 'px-0.5  align-top   '}}
        {...dndProps}
      >
        <R_Stack className={`mx-auto px-1  flex-nowrap justify-around  gap-0`}>
          {myTable?.showRecordIndex === false ? (
            <></>
          ) : (
            <>
              <span className="text-gray-400">{recordIndex}.</span>
              {/* <Circle width={24}>{recordIndex}</Circle> */}
            </>
          )}
          <div className={className}>
            {dndProps && PC && <ArrowUpDownIcon className={`w-4 onHover`} />}
            {children}
          </div>
        </R_Stack>
      </th>
    </Fragment>
  )
}
