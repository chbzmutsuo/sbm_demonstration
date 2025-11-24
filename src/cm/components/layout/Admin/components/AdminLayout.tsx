import React from 'react'

import { adminContext, menuContext } from '@cm/components/layout/Admin/type'
import { useGlobalPropType } from 'src/cm/hooks/globalHooks/useGlobalOrigin'
import useWindowSize from '@cm/hooks/useWindowSize'
import Header from '@cm/components/layout/Header'
import Drawer from '@cm/components/layout/Navigation/Drawer'
import NavBar from '@cm/components/layout/Navigation/NavBar'

type AdminLayoutProps = {
  children: React.ReactNode
  adminContext: adminContext
  menuContext: menuContext
  useGlobalProps: useGlobalPropType
}

export const AdminLayout = React.memo(({ children, adminContext, menuContext, useGlobalProps }: AdminLayoutProps) => {
  const { PC, width } = useWindowSize()

  const { horizontalMenu, pathItemObject } = adminContext

  if (PC) {
    return (
      <PCLayout
        adminContext={adminContext}
        menuContext={menuContext}
        useGlobalProps={useGlobalProps}
        horizontalMenu={horizontalMenu}
        pathItemObject={pathItemObject}
      >
        {children}
      </PCLayout>
    )
  }

  return (
    <SPLayout
      adminContext={adminContext}
      menuContext={menuContext}
      useGlobalProps={useGlobalProps}
      horizontalMenu={horizontalMenu}
      pathItemObject={pathItemObject}
    >
      {children}
    </SPLayout>
  )
})

// PC用レイアウト
const PCLayout = React.memo(({ children, adminContext, menuContext, useGlobalProps, horizontalMenu, pathItemObject }: any) => (
  <div className={` max-w-screen min-h-screen overflow-x-auto overflow-y-hidden`}>
    <Header adminContext={adminContext} />

    {adminContext.navBarPosition === `left` && (
      <div>
        <Drawer menuContext={menuContext}>
          <NavBar useGlobalProps={useGlobalProps} horizontalMenu={horizontalMenu} navItems={pathItemObject.navItems} />
        </Drawer>
      </div>
    )}

    {children}
  </div>
))

// SP用レイアウト
const SPLayout = React.memo(({ children, adminContext, menuContext, useGlobalProps, horizontalMenu, pathItemObject }: any) => (
  <div className={` max-w-screen min-h-screen overflow-x-auto overflow-y-hidden`}>
    <div className="sticky top-0">
      <div>
        <Header adminContext={adminContext} />

        <Drawer menuContext={menuContext}>
          <NavBar useGlobalProps={useGlobalProps} horizontalMenu={horizontalMenu} navItems={pathItemObject.navItems} />
        </Drawer>
      </div>

      {children}
    </div>
  </div>
))

AdminLayout.displayName = 'AdminLayout'
PCLayout.displayName = 'PCLayout'
SPLayout.displayName = 'SPLayout'
