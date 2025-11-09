'use client'
import {C_Stack} from 'src/cm/components/styles/common-components/common-components'

import useElementRef from 'src/cm/hooks/useElementRef'
import {cl} from 'src/cm/lib/methods/common'
import {useState} from 'react'
import {ChevronsDown, ChevronsUp} from 'lucide-react'

const TextAccordion = ({children, minHeight = 0, maxHeight = 150}) => {
  const [open, setopen] = useState(false)
  const {TargetElementProps, TargetElementRef} = useElementRef()
  const elementHeight = TargetElementProps.rect.height
  const overflowing = elementHeight >= maxHeight

  const toggleOpen = () => setopen(prev => !prev)
  const Main = () => {
    return (
      <div className={cl(!open ? '  pointer-events-none  ' : '')}>
        <div
          className={!open ? '   ' : ''}
          style={{
            minHeight,
            maxHeight: open ? undefined : maxHeight,
            overflowY: 'hidden',
          }}
        >
          <div ref={TargetElementRef}>{children}</div>
        </div>
      </div>
    )
  }

  const Chevron = open ? ChevronsUp : ChevronsDown
  const letter = open ? '閉じる' : '続きを見る'

  const {TargetElementProps: btnProps, TargetElementRef: btnRef} = useElementRef()

  const zoomInClass = cl(open ? '' : 'cursor-zoom-in  onHover ')

  return (
    <div
      onClick={() => {
        !open && setopen(true)
      }}
    >
      <C_Stack className={cl('relative gap-0', zoomInClass)}>
        <Main />
        {overflowing && !open && (
          <div className={` w-full justify-between text-center`}>
            {/* <small className={` flex  items-center  align-middle `}>
              <ChevronDoubleDownIcon className={`w-4`} />
              <ChevronDoubleDownIcon className={`w-4`} />
              <ChevronDoubleDownIcon className={`w-4`} />
            </small> */}
          </div>
        )}
        {overflowing && (
          <div className={`z-10 my-1 `}>
            <div
              {...{
                ref: btnRef,
                onClick: toggleOpen,
                className: cl(
                  `onHover `,
                  ` bg-sub-main text-xs  text-white   w-fit ml-auto `,
                  `p-0.5   rounded-md shadow-md px-1.5 `
                ),
              }}
            >
              <small className={` flex items-center gap-1  align-middle  text-white`}>
                <Chevron className={`w-3`} />
                {letter}
              </small>
            </div>
          </div>
        )}
      </C_Stack>
    </div>
  )
}
export default TextAccordion
