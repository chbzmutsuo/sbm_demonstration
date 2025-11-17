import {PageBuilder} from '../(builders)/PageBuilder'
import Admin from '@cm/components/layout/Admin/Admin'

export default async function AppLayout(props) {
  const {children} = props

  return (
    <Admin
      {...{
        AppName: '経費',
        PagesMethod: 'keihi_PAGES',
        PageBuilderGetter: {class: PageBuilder, getter: 'getGlobalIdSelector'},
      }}
    >
      <div>
        {/* <Tasks /> */}
        <div>{children}</div>
      </div>
    </Admin>
  )
}
