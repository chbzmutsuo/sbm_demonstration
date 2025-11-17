import {PageBuilder} from '../(builders)/PageBuilder'
import Admin from '@cm/components/layout/Admin/Admin'

export default async function AppLayout(props) {
  const {children} = props

  return (
    <Admin
      {...{
        AppName: 'テストアプリ',
        PagesMethod: 'sbm_PAGES',
        PageBuilderGetter: {class: PageBuilder, getter: 'getGlobalIdSelector'},
      }}
    >
      <div>
        <div className={` p-2`}>{children}</div>
      </div>
    </Admin>
  )
}
