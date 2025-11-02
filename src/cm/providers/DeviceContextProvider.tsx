// 'use client'
// import React, {createContext, useContext, ReactNode} from 'react'
// import useWindowSize from '@cm/hooks/useWindowSize'
// import {DeviceContextType} from './types'
// import Loader from '@cm/components/utils/loader/Loader'

// const DeviceContext = createContext<DeviceContextType | null>(null)

// const DeviceContextProvider = ({children}: {children: ReactNode}) => {
//   const deviceData = useWindowSize()

//   const {device, width} = deviceData

//   if (!device || width === 0) {
//     return <Loader>Validating Device Data...</Loader>
//   }

//   return <DeviceContext.Provider value={deviceData}>{children}</DeviceContext.Provider>
// }

// export function useDeviceContext() {
//   const context = useContext(DeviceContext)
//   if (!context) {
//     throw new Error('useDeviceContext must be used within DeviceProvider')
//   }
//   return context
// }

// export default DeviceContextProvider
