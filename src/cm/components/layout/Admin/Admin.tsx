'use client'

import useGlobal from 'src/cm/hooks/globalHooks/useGlobal'
import Redirector from 'src/cm/components/utils/Redirector'
import React, {useMemo} from 'react'
import {HREF} from 'src/cm/lib/methods/urls'
import {MetaData} from '@cm/components/layout/MetaData'

import {obj__cleanObject} from '@cm/class/ObjHandler/transformers'

// 分離したフックとコンポーネント
import {useAdminContext} from './hooks/useAdminContext'
import {useAccessValidation} from './hooks/useAccessValidation'
import {AdminLayout} from './components/AdminLayout'

import {adminProps} from '@cm/components/layout/Admin/type'

const Admin = React.memo((props: adminProps) => {
  const useGlobalProps = useGlobal()

  const {AppName, children} = props
  const {pathname, query} = useGlobalProps

  // カスタムフックを使用してロジックを
  const {adminContext, menuContext} = useAdminContext(props, useGlobalProps)

  const {isValid, redirectPath, needsRedirect} = useAccessValidation(useGlobalProps)

  // 不要なクエリパラメータのクリーンアップ
  const cleanedQuery = useMemo(() => obj__cleanObject({...query}), [query])
  const shouldRedirectForQuery = useMemo(() => {
    return Object.keys(query).some(key => !cleanedQuery[key])
  }, [query, cleanedQuery])

  // アクセス検証によるリダイレクト
  if (!isValid && needsRedirect && redirectPath) {
    return <Redirector redirectPath={redirectPath} />
  }

  if (shouldRedirectForQuery) {
    console.warn('Redirected because of undefined query parameter')
    const redirectPath = HREF(pathname, cleanedQuery, query)
    return <Redirector redirectPath={redirectPath} />
  }

  return (
    <div>
      <MetaData pathItemObject={adminContext.pathItemObject} AppName={AppName} />
      <AdminLayout adminContext={adminContext} menuContext={menuContext} useGlobalProps={useGlobalProps}>
        <div>{children}</div>
      </AdminLayout>
    </div>
  )
})

export default Admin
