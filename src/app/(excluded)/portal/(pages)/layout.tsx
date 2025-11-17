import {PageBuilder} from '../(builders)/PageBuilder'
import Admin from '@cm/components/layout/Admin/Admin'

export default async function AppLayout(props) {
  const {children} = props

  return (
    <Admin
      {...{
        AppName: '生産管理システム',
        PagesMethod: 'portal_PAGES',
        PageBuilderGetter: {class: PageBuilder, getter: 'getGlobalIdSelector'},
      }}
    >
      <div>{children}</div>
    </Admin>
  )
}
