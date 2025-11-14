'use client'

import {useDeviceContext} from '@cm/providers/DeviceContextProvider'

export const appbarHeight = 40
export const footerHeight = 40
export const headerMargin = 0
export default function useWindowSize() {
  return useDeviceContext()
}

export const getWindow: () => {width: number; height: number} = () => {
  const result = typeof window === 'undefined' ? {width: 0, height: 0} : {width: window.innerWidth, height: window.innerHeight}
  return result
}

export const GetDevice: (width: number) => 'SP' | 'TB' | 'PC' = (width: number) => {
  if (width <= 599) {
    return 'SP'
  } else if (599 < width && width < 1280) {
    return 'TB'
  } else if (width >= 1280) {
    return 'PC'
  } else {
    return 'SP'
  }
}
