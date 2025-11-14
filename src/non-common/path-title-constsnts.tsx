import {anyObject} from '@cm/types/utility-types'
import {JSX} from 'react'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

import {tbm_PAGES} from 'src/non-common/getPages/getTbm_PAGES'

import {KM_PAGES} from 'src/non-common/getPages/KM_PAGES'
import {stock_PAGES} from 'src/non-common/getPages/stock_PAGES'

import {training_PAGES} from 'src/non-common/getPages/training_PAGES'

const getEduCommonMenus = ({isSchoolLeader, admin}) => {
  return {
    appSelector: {
      ROOT: ['edu'],
      tabId: '',
      label: 'アプリ',
      children: [
        {tabId: 'Grouping', label: 'Grouping'},
        {tabId: 'Colabo', label: 'Colabo'},
      ],
    },
    config: {
      tabId: '',
      ROOT: ['edu'],
      label: '各種設定',
      exclusiveTo: isSchoolLeader,
      children: [
        {tabId: 'school', label: '学校', exclusiveTo: admin},
        {tabId: 'teacher', label: '教員', exclusiveTo: isSchoolLeader},
        {tabId: 'classroom', label: 'クラス', exclusiveTo: isSchoolLeader},
        {tabId: 'student', label: '児童・生徒', exclusiveTo: isSchoolLeader},
        {tabId: 'subjectNameMaster', label: '教科', exclusiveTo: isSchoolLeader},
        {tabId: 'csv-import', label: 'CSV取り込み', exclusiveTo: isSchoolLeader},
      ],
    },
  }
}

export const PAGES: any = {
  teamSynapse_PAGES: (props: PageGetterType) => {
    const {roles, session, rootPath, query, pathname, dynamicRoutingParams} = props

    const scopes = getScopes(session, {query, roles})

    const {admin} = scopes

    const normalPaths: pathItemType[] = [
      //
      {
        //
        ROOT: [rootPath],
        tabId: '',
        label: 'TOP',
        exclusiveTo: 'always',
      },
    ]

    const adminPaths: pathItemType[] = []
    const pathSource = [
      //
      ...normalPaths,
      ...adminPaths,
    ] as pathItemType[]

    const {cleansedPathSource, navItems, breads, allPathsPattenrs} = CleansePathSource({
      rootPath,
      pathSource,
      pathname,
      query,
      session,
      dynamicRoutingParams,
    })

    return {
      allPathsPattenrs,
      pathSource: cleansedPathSource,
      navItems,
      breads,
    }
  },
  tbm_PAGES,
  KM_PAGES,
  stock_PAGES,
  training_PAGES,
  Colabo_PAGES: (props: PageGetterType) => {
    const {roles, session, rootPath, query, pathname, dynamicRoutingParams} = props

    const scopes = getScopes(session, {query, roles})
    const {isSchoolLeader} = scopes.getGroupieScopes()
    const {admin} = scopes
    const configROOTS = [rootPath]

    const {appSelector, config} = getEduCommonMenus({isSchoolLeader, admin})
    const normalPaths: pathItemType[] = [
      //
      {ROOT: [rootPath], tabId: '', label: 'TOP', exclusiveTo: 'always'},
      appSelector,
      config,
    ]

    const adminPaths: pathItemType[] = [
      {
        tabId: 'admin',
        label: 'デバッグメニュー',
        link: {},
        exclusiveTo: true,
        children: [
          {tabId: 'game', label: '授業', link: {}, exclusiveTo: true},
          {tabId: 'slide', label: 'スライド', link: {}, exclusiveTo: true},
        ],
      },
    ].map(item => {
      return {
        ...item,
        ROOT: configROOTS,
        exclusiveTo: admin,
      }
    })

    const pathSource = [
      //
      ...normalPaths,
      ...adminPaths,
    ] as pathItemType[]

    const {cleansedPathSource, navItems, breads, allPathsPattenrs} = CleansePathSource({
      rootPath,
      pathSource,
      pathname,
      query,
      session,
      dynamicRoutingParams,
    })

    return {
      allPathsPattenrs,
      pathSource: cleansedPathSource,
      navItems,
      breads,
    }
  },

  Grouping_PAGES: (props: PageGetterType) => {
    const {roles, session, rootPath, query, pathname, dynamicRoutingParams} = props

    const scopes = getScopes(session, {query, roles})

    const {admin} = scopes
    const {isSchoolLeader} = scopes.getGroupieScopes()

    const configROOTS = [rootPath]

    const pathSource: pathItemType[] = [
      {
        ROOT: [rootPath],
        tabId: '',
        label: 'アプリ',
        children: [
          {tabId: 'Grouping', label: 'Grouping'},
          {tabId: 'Colabo', label: 'Colabo'},
        ],
      },

      {
        ROOT: configROOTS,
        tabId: '',
        label: '各種設定',
        exclusiveTo: isSchoolLeader,
        children: [
          {tabId: 'school', label: '学校', exclusiveTo: admin},
          {tabId: 'teacher', label: '教員', exclusiveTo: isSchoolLeader},
          {tabId: 'classroom', label: 'クラス', exclusiveTo: isSchoolLeader},
          {tabId: 'student', label: '児童・生徒', exclusiveTo: isSchoolLeader},
          {tabId: 'subjectNameMaster', label: '教科', exclusiveTo: isSchoolLeader},
          {tabId: 'csv-import', label: 'CSV取り込み', exclusiveTo: isSchoolLeader},
        ],
      },
      {ROOT: [rootPath], tabId: 'public', label: '公開ページ', children: [{tabId: 'enter', label: '児童・生徒用', link: {}}]},
      {ROOT: [rootPath, `admin`], tabId: 'dataManagement', label: 'データ抽出（管理者用）', exclusiveTo: admin},
    ]
    const {cleansedPathSource, navItems, breads, allPathsPattenrs} = CleansePathSource({
      rootPath,
      pathSource,
      pathname,
      query,
      session,
      dynamicRoutingParams,
    })

    return {
      allPathsPattenrs,
      pathSource: cleansedPathSource,
      navItems,
      breads,
    }
  },

  keihi_PAGES: (props: PageGetterType) => {
    const {roles, query, session, rootPath, pathname} = props

    const {login, admin} = getScopes(session, {query, roles})

    const loginPaths = [
      {
        tabId: '',
        label: '経費管理',
        children: [
          {tabId: '/', label: '一覧', ROOT: [rootPath]},
          {tabId: 'new', label: '新規登録', ROOT: [rootPath]},
          {tabId: 'new/bulk', label: '一括登録', ROOT: [rootPath]},
        ],
      },
      {
        tabId: '',
        label: 'マスタ管理',
        children: [{tabId: 'master', label: 'マスタ設定', ROOT: [rootPath]}],
      },
    ].map((item, i) => {
      return {
        ...item,
        ROOT: [rootPath],
        exclusiveTo: !!login,
      }
    })

    // const adminPaths = [
    //   {
    //     tabId: '',
    //     label: '管理者メニュー',
    //     children: [{tabId: 'admin', label: '管理者設定', ROOT: [rootPath]}],
    //   },
    // ].map((item, i) => {
    //   return {
    //     ...item,
    //     ROOT: [rootPath],
    //     exclusiveTo: true,
    //   }
    // })

    const pathSource: pathItemType[] = [...loginPaths]

    const {cleansedPathSource, navItems, breads, allPathsPattenrs} = CleansePathSource({
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
  },

  sbm_PAGES: (props: PageGetterType) => {
    const {roles, query, session, rootPath, pathname} = props

    const {login, admin} = getScopes(session, {query, roles})

    const loginPaths = [
      {tabId: 'dashboard', label: 'ダッシュボード', ROOT: [rootPath]},
      {
        tabId: '',
        label: '予約',
        ROOT: [rootPath],
        children: [
          {tabId: 'reservations', label: '予約管理'},
          {tabId: 'delivery-route', label: '配達ルート管理'},
          {tabId: 'ingredients/usage', label: '材料使用量計算'},
        ],
      },

      {tabId: 'invoices', label: '伝票印刷', ROOT: [rootPath]},
      {tabId: 'rfm', label: 'RFM分析', ROOT: [rootPath]},

      {
        tabId: '',
        label: '管理',
        ROOT: [rootPath],
        children: [
          {tabId: 'ingredients', label: '材料マスタ', ROOT: [rootPath]},
          {tabId: 'products', label: '商品マスタ', ROOT: [rootPath]},
          {tabId: 'customers', label: '顧客マスタ', ROOT: [rootPath]},
          {tabId: 'customer-merge', label: '顧客統合', ROOT: [rootPath]},
          {tabId: 'users', label: 'ユーザーマスタ', ROOT: [rootPath]},
          {tabId: 'seed', label: 'データ管理・シード', ROOT: [rootPath]},
        ],
      },
    ].map((item, i) => {
      return {...item, ROOT: [rootPath], exclusiveTo: !!login}
    })

    const pathSource: pathItemType[] = [...loginPaths]

    const {cleansedPathSource, navItems, breads, allPathsPattenrs} = CleansePathSource({
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
  },

  counseling_PAGES: (props: PageGetterType) => {
    const {roles, query, session, rootPath, pathname} = props

    const {login, admin} = getScopes(session, {query, roles})

    const loginPaths = [{tabId: 'settings', label: 'マスタ設定', ROOT: [rootPath]}]

    const pathSource: pathItemType[] = [...loginPaths]

    const {cleansedPathSource, navItems, breads, allPathsPattenrs} = CleansePathSource({
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
  },
  portal_PAGES: (props: PageGetterType) => {
    const {roles, query, session, rootPath, pathname} = props

    const {login, admin} = getScopes(session, {query, roles})

    const loginPaths = [
      {tabId: '', label: 'ダッシュボード', ROOT: [rootPath]},

      {
        tabId: '',
        label: 'データ入力',
        ROOT: [rootPath],
        children: [
          {tabId: 'orders', label: '受注', ROOT: [rootPath]},
          {tabId: 'productions', label: '生産', ROOT: [rootPath]},
          {tabId: 'shipments', label: '出荷', ROOT: [rootPath]},
        ],
      },
      {
        tabId: '',
        label: 'マスタ管理',
        ROOT: [rootPath],
        children: [
          {tabId: 'materials', label: '原材料マスター', ROOT: [rootPath]},
          {tabId: 'products', label: '製品マスター', ROOT: [rootPath]},
          {tabId: 'calendar', label: 'カレンダー管理', ROOT: [rootPath]},
        ],
      },
    ]

    const pathSource: pathItemType[] = [...loginPaths]

    const {cleansedPathSource, navItems, breads, allPathsPattenrs} = CleansePathSource({
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
  },

  aidocument_PAGES: (props: PageGetterType) => {
    const {roles, query, session, rootPath, pathname} = props

    const {login, admin} = getScopes(session, {query, roles})

    const loginPaths = [
      {
        tabId: 'company',
        label: '自社情報管理',
        ROOT: [rootPath],
        exclusiveTo: !!login,
      },
      {
        tabId: 'clients',
        label: '取引先マスタ管理',
        ROOT: [rootPath],
        exclusiveTo: !!login,
      },
    ]

    const adminPaths = [
      {
        tabId: '',
        label: '管理者',
        ROOT: [rootPath],
        children: [
          {tabId: 'aidocumentCompany', label: '企業一覧', ROOT: [rootPath]},
          {tabId: 'user', label: 'ユーザー一覧', ROOT: [rootPath]},
        ],
        exclusiveTo: !!admin,
      },
    ]

    const pathSource: pathItemType[] = [...loginPaths, ...adminPaths]

    const {cleansedPathSource, navItems, breads, allPathsPattenrs} = CleansePathSource({
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
  },
}

export const CleansePathSource = (props: anyObject) => {
  const {rootPath, pathname, query, session, dynamicRoutingParams, roles} = props
  const {login} = getScopes(session, {query, roles})
  const {pathSource} = props

  const navItems: pathItemType[] = []
  const breads: any[] = []
  const allPathsPattenrs: object[] = []

  Object.keys(pathSource).forEach(key => {
    const item = pathSource[key]
    type roopCleansingProps = {
      parent: pathItemType
      item: pathItemType
      key?: string
    }
    /**exclusiveToによるデータクレンジング */
    const roopCleansing = (props: roopCleansingProps) => {
      const {parent, item, key} = props
      const {children} = parent
      if (children && children?.length > 0) {
        children.forEach(child => {
          roopCleansing({parent: item, item: child})
        })
      }
    }
    roopCleansing({parent: pathSource, item, key})
  })

  type constructItemProps = {
    item: pathItemType
    CURRENT_ROOT?: any[]
  }

  const constructItem = (props: constructItemProps) => {
    let {item} = props

    const {CURRENT_ROOT} = props
    const {tabId, link = {query: {}}, label, children, ROOT} = item

    const thisRoot = ROOT ? ROOT : (CURRENT_ROOT ?? [])
    let href: string | undefined = item?.href ?? undefined
    if (href === undefined) {
      if (thisRoot?.join('/').length > 0) {
        href = link
          ? '/' + thisRoot?.join('/') + '/' + tabId
          : // + addQuerySentence(query)
            undefined
      } else {
        href = link
          ? '/' + tabId
          : // + addQuerySentence(query)
            undefined
      }
    }

    item = {...item, href}

    /**bread crumbようの処理 */
    const pathObject: pathItemType = {
      ...item,
      href: `/${[...thisRoot, tabId].join('/')}`,
      joinedPath: [...(thisRoot ?? []), tabId].join('/'),
    }
    allPathsPattenrs.push(pathObject)

    if (item.children) {
      item.children.forEach((item, i) => {
        const newRoot = [...thisRoot, tabId]
        constructItem({item, CURRENT_ROOT: newRoot})
      })
    }

    return item
  }
  /**nav itemsを作る ( 部分的にbreadsの前処理を含む) */
  pathSource?.forEach((item: pathItemType) => {
    const recursive = (props: {item: pathItemType; result: pathItemType[]}) => {
      let {item} = props
      const {result} = props
      const {ROOT} = item
      item = {
        ...constructItem({item: item, CURRENT_ROOT: ROOT}),
        children: item.children?.map(child => {
          if (child?.exclusiveTo === undefined) {
            child.exclusiveTo = item.exclusiveTo
          }
          return constructItem({
            item: child,
            CURRENT_ROOT: ROOT,
          })
        }),
      }

      if (item.exclusiveTo !== false) {
        result.push(item)
        return result
      }
    }
    recursive({item, result: navItems})
  })

  /**breadsを作る */
  const pathnameSplit: string[] = String(pathname).split('/')

  const curr: any = []

  for (let i = 0; i < pathnameSplit.length; i++) {
    curr.push(pathnameSplit[i])
    const A = curr.join('/') //現在のパス

    const matched = allPathsPattenrs.find((path: {joinedPath: string}) => {
      const B = `/${path.joinedPath}` //ループ対象パス
      const isHit = A === B

      return isHit
    })
    if (matched) {
      breads.push(matched)
    }
  }

  return {cleansedPathSource: pathSource, navItems, breads, allPathsPattenrs}
}

export const identifyPathItem = ({allPathsPattenrs, pathname}) => {
  const pathnameSplitArr = String(pathname).split('/')
  const matchedPathItem = allPathsPattenrs.find(item => {
    const itemHrefArray = item?.href?.split('/')

    const check = itemHrefArray.reduce((acc, cur, i) => {
      const pathSegmentMatched = pathnameSplitArr[i] === cur
      return pathSegmentMatched ? (acc += 1) : acc
    }, 0)

    return check === pathnameSplitArr.length && pathnameSplitArr.length === itemHrefArray.length
  })

  return matchedPathItem as pathItemType
}

export type pathItemType = {
  tabId?: string | RegExp
  label?: string | JSX.Element
  icon?: string
  href?: string
  target?: `_blank` | undefined
  ROOT?: string[]
  hide?: boolean
  exclusiveTo?: boolean | 'always'
  children?: pathItemType[]
  link?: {
    query?: object
  }
  joinedPath?: any
}

export type breadType = {
  href: string
  label: string
  joinedPath: string
} & pathItemType

export type PageGetterType = {
  session: anyObject
  rootPath: string
  pathname: string
  query: anyObject
  dynamicRoutingParams: anyObject
  roles: any[]
}
