import IconLetter from '@cm/components/styles/common-components/IconLetter'
import { Calculator, JapaneseYenIcon, FileText, Truck, ListIcon, Settings, Calendar, Building, User } from 'lucide-react'

import { CleansePathSource } from 'src/non-common/path-title-constsnts'
import { PageGetterType } from 'src/non-common/path-title-constsnts'
import { getScopes } from 'src/non-common/scope-lib/getScopes'

export const tbm_PAGES = (props: PageGetterType) => {
  const { roles = [] } = props

  const { session, rootPath, pathname, query } = props

  const scopes = getScopes(session, { query, roles })
  const { login } = scopes
  const admin = scopes.admin
  const { isSystemAdmin, isShocho } = scopes.getTbmScopes()

  const publicPaths = []

  const loginPath = [
    {
      tabId: 'driver',
      label: <IconLetter {...{ Icon: Truck }}>ドライバーメニュー</IconLetter>,
      children: [
        { tabId: 'driveInput', label: <IconLetter {...{ Icon: Truck }}>運行入力</IconLetter> },
        { tabId: 'monthly-schedule', label: <IconLetter {...{ Icon: Calendar }}>月間予定</IconLetter> },
      ],
      exclusiveTo: login,
      ROOT: [rootPath, 'driver'],
    },
  ]

  const shochoPath = [
    {
      tabId: '',
      label: <IconLetter {...{ Icon: ListIcon }}>営業所メニュー</IconLetter>,
      children: [
        //

        {
          tabId: 'eigyoshoSettei',
          label: <IconLetter {...{ Icon: Settings }}>営業所設定</IconLetter>,
        },
        {
          tabId: 'haisha',
          label: <IconLetter {...{ Icon: Truck }}>配車設定</IconLetter>,
        },
        { tabId: 'etc', label: 'ETC連携' },
      ],
    },

    {
      tabId: '',
      label: <IconLetter {...{ Icon: FileText }}>各種レポート等</IconLetter>,
      children: [
        //
        { tabId: 'unkomeisai', label: <IconLetter {...{ Icon: ListIcon }}>運行明細</IconLetter> },
        { tabId: 'nempiKanri', label: <IconLetter {...{ Icon: JapaneseYenIcon }}>燃費管理</IconLetter> },
        { tabId: 'ruiseki', label: <IconLetter {...{ Icon: Calculator }}>累積距離記帳</IconLetter> },
        { tabId: 'seikyu', label: <IconLetter {...{ Icon: ListIcon }}>請求書発行</IconLetter> },


        { tabId: 'eigyosho', label: <IconLetter {...{ Icon: JapaneseYenIcon }}>営業所別売上</IconLetter> },
        { tabId: 'ninushi', label: <IconLetter {...{ Icon: JapaneseYenIcon }}>荷主別売上</IconLetter> },
        { tabId: 'sharyoBetsuUriage', label: <IconLetter {...{ Icon: JapaneseYenIcon }}>車両別売上</IconLetter> },
        { tabId: 'unkokaisu', label: <IconLetter {...{ Icon: ListIcon }}>運行回数</IconLetter> },


        { tabId: 'kyuyoSantei', label: <IconLetter {...{ Icon: JapaneseYenIcon }}>給与算定</IconLetter> },
        { tabId: 'driver/kintai', label: <IconLetter {...{ Icon: ListIcon }}>出退勤管理</IconLetter> },
        // {tabId: 'simpleDriveHistory', label: <IconLetter {...{Icon: FileText}}>簡易走行記録（PDF）</IconLetter>},
        { tabId: `testProgress`, label: 'テストレポート' },
      ],
    },
  ].map(item => ({
    ...item,
    exclusiveTo: isShocho || isSystemAdmin,
    ROOT: [rootPath],
  }))

  const systemAdminPath = [
    {
      tabId: '',
      label: <IconLetter {...{ Icon: ListIcon }}>共通設定</IconLetter>,
      children: [
        //
        {
          tabId: 'tbmBase',
          label: <IconLetter {...{ Icon: Building }}>営業所</IconLetter>,
        },
        {
          tabId: 'user',
          label: <IconLetter {...{ Icon: User }}>ユーザー</IconLetter>,
        },
        {
          tabId: 'tbmVehicle',
          label: <IconLetter {...{ Icon: Truck }}>車両</IconLetter>,
        },
        {
          tabId: 'tbmCustomer',
          label: <IconLetter {...{ Icon: Building }}>荷主</IconLetter>,
        },
        {
          tabId: 'calendar',
          label: <IconLetter {...{ Icon: Calendar }}>カレンダー</IconLetter>,
        },
        {
          tabId: `roleMaster`,
          label: <IconLetter {...{ Icon: Settings }}>権限管理</IconLetter>,
        },
      ],
    },
  ].map(item => {
    return { ...item, exclusiveTo: isSystemAdmin, ROOT: [rootPath] }
  })

  const kaizenManiaPath = [
    {
      tabId: '',
      label: <IconLetter {...{ Icon: ListIcon }}>開発者メニュー</IconLetter>,
      children: [
        //

        {
          tabId: `odometerInput`,
          label: <IconLetter {...{ Icon: Settings }}>OdometerInput</IconLetter>,
        },
        {
          tabId: `tbmRefuelHistory`,
          label: <IconLetter {...{ Icon: Settings }}>TbmRefuelHistory</IconLetter>,
        },
        {
          tabId: `tbmCarWashHistory`,
          label: <IconLetter {...{ Icon: Settings }}>tbmCarWashHistory</IconLetter>,
        },
      ],
    },
  ].map(item => {
    return { ...item, exclusiveTo: admin, ROOT: [rootPath] }
  })

  const pathSource = [
    { tabId: 'top', label: 'トップ', hide: true, ROOT: [rootPath] },
    ...loginPath,
    ...publicPaths,
    ...shochoPath,
    ...systemAdminPath,
    ...kaizenManiaPath,
  ]

  const { cleansedPathSource, navItems, breads, allPathsPattenrs } = CleansePathSource({
    rootPath,
    pathSource,
    pathname,
    session,
  })

  return {
    allPathsPattenrs,
    pathSource: cleansedPathSource,
    navItems,
    breads,
  }
}
