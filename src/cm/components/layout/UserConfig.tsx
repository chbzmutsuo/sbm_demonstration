import useNavMenu from '@cm/components/layout/Navigation/useNavMenu'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {T_LINK} from '@cm/components/styles/common-components/links'
import MyPopover from '@cm/components/utils/popover/MyPopover'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useWindowSize from '@cm/hooks/useWindowSize'
import {HREF} from '@cm/lib/methods/urls'
import {Card} from '@cm/shadcn/ui/card'
import LabelValue from '@cm/shadcn/ui/Organisms/LabelValue'
import { UserCircleIcon} from 'lucide-react'

import React from 'react'

export const UserConfig = () => {
  const {router, accessScopes, session, rootPath, query} = useGlobal()
  const {width} = useWindowSize()
  const HK_NAV = useNavMenu()

  const styling = {styles: {wrapper: {padding: 0, width: `100%`}}}
  const maxWidth = Math.min(width * 0.8, 400)
  const minWidth = Math.min(width * 0.8, 240)

  if (accessScopes().login) {
    return (
      <div
        onMouseEnter={() => {
          HK_NAV.handleCloseMenu(HK_NAV.activeNavWrapper)
        }}
      >
        <MyPopover
          {...{
            mode: `click`,
            alertOnClose: false,
            button: (
              <button className={`row-stack gap-0`}>
                <UserCircleIcon className={` w-7 text-gray-700 `} />
              </button>
            ),
          }}
        >
          <Card>
            <R_Stack style={{maxWidth, minWidth, margin: `auto`}}>
              <LabelValue {...{styling, label: `氏名`, value: session.name}} />
              <LabelValue {...{styling, label: `Email`, value: session?.email}} />

              <R_Stack className={`w-full justify-end`}>
                <T_LINK href={HREF(`/logout`, {rootPath}, query)}>ログアウト</T_LINK>
              </R_Stack>
            </R_Stack>
          </Card>
        </MyPopover>
      </div>
    )
  } else {
    return <T_LINK href={HREF(`/login`, {rootPath}, query)}>ログイン</T_LINK>
  }
}
