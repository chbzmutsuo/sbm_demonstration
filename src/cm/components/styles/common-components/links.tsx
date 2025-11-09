'use client'

import React, {useCallback} from 'react'
import {htmlProps} from '@cm/types/utility-types'

import {cl, sleep} from 'src/cm/lib/methods/common'
import Link from 'next/link'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import {twMerge} from 'tailwind-merge'
import useLoader from '@cm/hooks/globalHooks/useLoader'

export const T_LINK = React.memo((props: htmlProps & {href: string; target?: '_blank'; simple?: boolean}) => {
  const {className, style, href = '#', target, simple = false, ...rest} = props
  const {setglobalLoaderAtom} = useLoader()

  const handleNavigate = useCallback(
    async e => {
      setglobalLoaderAtom(true)
      await sleep(1000)
      setglobalLoaderAtom(false)
    },
    [setglobalLoaderAtom]
  )

  return (
    <Link
      {...{
        onNavigate: handleNavigate,
        className: twMerge(className, simple ? '' : 't-link  w-fit'),
        target,
        href,
        style,
        prefetch: true,
        ...rest,
      }}
    />
  )
})

export const ShallowLink = React.memo((props: htmlProps & {href: string; target?: '_blank'; milliSeconds?: number}) => {
  const {shallowPush} = useGlobal()
  const {className, style, href = '#', target, milliSeconds = 200, ...rest} = props

  const handleClick = useCallback(() => shallowPush(href), [shallowPush, href])

  return <span onClick={handleClick} {...{target, href, className: cl(className), style, ...rest}} />
})
