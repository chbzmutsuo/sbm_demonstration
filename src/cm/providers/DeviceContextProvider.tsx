'use client'
import React, {createContext, useContext, ReactNode, useState, useEffect} from 'react'
import {GetDevice} from '@cm/hooks/useWindowSize'

import Loader from '@cm/components/utils/loader/Loader'

export const appbarHeight = 0
export const footerHeight = 40
export const headerMargin = 0
type DeviceContextType = {
  appbarHeight: number
  footerHeight
  bodyHeight: number
  headerMargin: number
  useWindowSizeDeps: number[]
  currentDevice: string
  width: number
  height: number
  device: any
  SP: boolean
  TB: boolean
  PC: boolean
}
const DeviceContext = createContext<DeviceContextType | null>(null)

const DeviceContextProvider = ({children}: {children: ReactNode}) => {
  const [windowSize, setWindowSize] = useState({width: 0, height: 0})

  const handleResize = () => {
    const data = {width: window.innerWidth, height: window.innerHeight}

    setWindowSize(data)
  }

  useEffect(() => {
    // const debounce = (func: () => void, delay: number) => {
    //   let timeoutId: NodeJS.Timeout
    //   return () => {
    //     clearTimeout(timeoutId)
    //     timeoutId = setTimeout(func, delay)
    //   }
    // }
    // const handleResizeDebounced = debounce(handleResize, 0)
    // window.addEventListener('resize', handleResizeDebounced)

    handleResize()
    // return () => window.removeEventListener('resize', handleResizeDebounced)
  }, [])
  const width = windowSize?.width ?? 0
  const height = windowSize?.height ?? 0
  const currentDevice = GetDevice(width)
  const SP = currentDevice === 'SP'
  const TB = currentDevice === 'TB'
  const PC = currentDevice === 'PC'
  const device = {SP, TB, PC}
  const useWindowSizeDeps = [width]

  const bodyHeight = height - appbarHeight - headerMargin

  if (!device || width === 0) {
    return <Loader></Loader>
  }

  const value = {
    appbarHeight,
    footerHeight,
    bodyHeight,
    headerMargin,
    useWindowSizeDeps,
    currentDevice,
    width,
    height,
    device,
    SP,
    TB,
    PC,
  }

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
}

export function useDeviceContext() {
  const context = useContext(DeviceContext)
  if (!context) {
    throw new Error('useDeviceContext must be used within DeviceProvider')
  }
  return context
}

export default DeviceContextProvider
