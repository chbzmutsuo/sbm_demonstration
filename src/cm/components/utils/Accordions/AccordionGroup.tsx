'use client'

import {C_Stack} from 'src/cm/components/styles/common-components/common-components'
import Accordion, {AccordiongPropType} from 'src/cm/components/utils/Accordions/Accordion'

const AccordionGroup = (props: {dataArr: AccordiongPropType[]}) => {
  const {dataArr} = props

  return (
    <C_Stack className={`gap-3`}>
      {dataArr
        .filter(d => d.exclusiveTo !== false)
        .map((data, idx) => {
          return <Accordion {...data} key={idx} />
        })}
    </C_Stack>
  )
}

export default AccordionGroup
