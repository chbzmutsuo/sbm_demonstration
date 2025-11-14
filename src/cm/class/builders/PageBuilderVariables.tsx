import GlobalModal from '@cm/components/utils/modal/GlobalModal'

import {PrismaModelNames} from '@cm/types/prisma-types'
import {DetailPagePropType} from '@cm/types/types'
import {useEffect, useState} from 'react'
import {RoleMaster, User, UserRole} from '@prisma/client'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {surroundings} from '@cm/components/DataLogic/types/customParams-types'
import {anyObject} from '@cm/types/utility-types'
import IconLetter from '@cm/components/styles/common-components/IconLetter'
import {Settings, Search} from 'lucide-react'
import {Center, C_Stack} from '@cm/components/styles/common-components/common-components'

export type PageBuidlerClassType = {
  [key in PrismaModelNames]: surroundings
} & anyObject

export type DataModelBuilder = {
  table?: (props: DetailPagePropType) => React.ReactNode
  top?: (props: DetailPagePropType) => React.ReactNode
  form?: (props: DetailPagePropType) => React.ReactNode
  bottom?: (props: DetailPagePropType) => React.ReactNode
  left?: (props: DetailPagePropType) => React.ReactNode
  right?: (props: DetailPagePropType) => React.ReactNode
}

export const roleMaster: DataModelBuilder = {
  bottom: props => {
    return (
      <GlobalModal
        {...{
          id: `user-role-control`,
          Trigger: (
            <div>
              <IconLetter
                {...{
                  className: 'w-full justify-center onHover text-xl text-blue-500  underline',
                  Icon: Settings,
                }}
              >
                割当表
              </IconLetter>
            </div>
          ),
        }}
      >
        <RoleAllocationTable {...{PageBuilderExtraProps: props.PageBuilderExtraProps}} />
      </GlobalModal>
    )
  },
}

const RoleAllocationTable = ({PageBuilderExtraProps}) => {
  const {rootPath} = useGlobal()
  type user = User & {UserRole: UserRole[]}
  const [users, setusers] = useState<user[]>([])
  const [roles, setroles] = useState<RoleMaster[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all')

  const fetchUsers = async () => {
    const apps = {has: rootPath}
    const {result: users = []} = await doStandardPrisma(`user`, `findMany`, {
      where: {...PageBuilderExtraProps?.where, apps},
      include: {UserRole: {include: {RoleMaster: {}}}},
      orderBy: [{code: `asc`}, {sortOrder: `asc`}, {name: `asc`}],
    })
    setusers(users)
  }

  const fetchRoles = async () => {
    const {result: roles = []} = await doStandardPrisma(`roleMaster`, `findMany`, {})
    setroles(roles)
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [PageBuilderExtraProps?.where, PageBuilderExtraProps?.where?.userId, PageBuilderExtraProps?.where?.roleMasterId])

  // フィルタリングされたユーザーリスト
  const filteredUsers = users.filter(user => {
    // 検索条件でフィルタ
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(user.code ?? '')
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())

    // 権限フィルタ
    if (selectedRoleFilter === 'all') {
      return matchesSearch
    } else if (selectedRoleFilter === 'no-role') {
      return matchesSearch && user.UserRole.length === 0
    } else {
      return matchesSearch && user.UserRole.some(ur => ur.roleMasterId === Number(selectedRoleFilter))
    }
  })

  return (
    <div className="p-2 bg-gradient-to-br from-slate-50 to-white">
      <C_Stack>
        <div className="">
          <h2 className="text-2xl font-bold bg-gradient-to-r bg-blue-500 bg-clip-text text-transparent">ユーザー権限割当表</h2>
        </div>

        {/* 検索・フィルタエリア */}
        <div>
          {/* ユーザー検索 */}
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ユーザー名またはコードで検索..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 権限フィルタ
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">権限フィルタ</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="roleFilter"
                  value="all"
                  checked={selectedRoleFilter === 'all'}
                  onChange={e => setSelectedRoleFilter(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">すべてのユーザー</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="roleFilter"
                  value="no-role"
                  checked={selectedRoleFilter === 'no-role'}
                  onChange={e => setSelectedRoleFilter(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">権限なし</span>
              </label>
              {roles.map(role => (
                <label key={role.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="roleFilter"
                    value={role.id}
                    checked={selectedRoleFilter === String(role.id)}
                    onChange={e => setSelectedRoleFilter(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{role.name}を持つユーザー</span>
                </label>
              ))}
            </div>
          </div> */}

          {/* 検索結果件数表示 */}
          {/* <div className="text-sm text-gray-500">{filteredUsers.length}件のユーザーが見つかりました</div> */}
        </div>

        <div className="overflow-hidden  border rounded-lg border-gray-200  ">
          <div className="overflow-auto max-h-[40vw]">
            <table className="w-full border ">
              <thead>
                <tr className="bg-blue-500 sticky top-0 z-10">
                  <th className="p-3 px-6 text-left text-white font-semibold rounded-tl-lg">ユーザー</th>
                  {roles.map((r, index) => {
                    return (
                      <th
                        key={r.id}
                        className={`px-4 py-4 text-center text-white font-semibold ${
                          index === roles.length - 1 ? 'rounded-tr-lg' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <Settings className="h-4 w-4" />
                          <span className="text-sm">{r.name}</span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className={``}>
                {filteredUsers.map((u, userIndex) => {
                  return (
                    <tr
                      key={u.id}
                      className={`
                        transition-all duration-200 hover:bg-blue-50/50 border-b border-gray-100
                        ${userIndex % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'}
                      `}
                    >
                      <td className="p-3 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{u.name}</div>
                            <div className="text-sm text-gray-500">{u.code}</div>
                          </div>
                        </div>
                      </td>
                      {roles.map(r => {
                        const userRole = u.UserRole.find(ur => ur.roleMasterId === r.id)
                        const hasRole = !!userRole

                        return (
                          <td key={r.id} className="px-4 py-4 text-center">
                            <div className="flex justify-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  onChange={async e => {
                                    const apply = e.target.checked
                                    const userId_roleMasterId_unique = {
                                      userId: u.id,
                                      roleMasterId: r.id,
                                    }

                                    if (apply) {
                                      if (!confirm(`${u.name}に${r.name}を割り当てますか？`)) return

                                      await doStandardPrisma(`userRole`, `upsert`, {
                                        where: {userId_roleMasterId_unique},
                                        create: {userId: u.id, roleMasterId: r.id},
                                        update: {userId: u.id, roleMasterId: r.id},
                                      })
                                      await fetchUsers()
                                    } else {
                                      if (!confirm(`${u.name}から${r.name}を割り当て解除しますか？`)) return
                                      await doStandardPrisma(`userRole`, `delete`, {
                                        where: {userId_roleMasterId_unique},
                                      })
                                      await fetchUsers()
                                    }
                                  }}
                                  type="checkbox"
                                  defaultChecked={hasRole}
                                  className="sr-only peer"
                                />
                                <div
                                  className={`
                                  relative w-12 h-6 rounded-full transition-all duration-300 ease-in-out
                                  ${hasRole ? 'bg-blue-500 shadow-lg' : 'bg-gray-200'}
                                  peer-focus:ring-4 peer-focus:ring-blue-300/50
                                `}
                                >
                                  <div
                                    className={`
                                    absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                                    transition-all duration-300 ease-in-out shadow-md
                                    ${hasRole ? 'translate-x-6' : 'translate-x-0'}
                                  `}
                                  />
                                </div>
                              </label>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <Center className="py-12">
              <div className="text-center">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm || selectedRoleFilter !== 'all'
                    ? '検索条件に一致するユーザーが見つかりません'
                    : 'ユーザーが見つかりません'}
                </p>
              </div>
            </Center>
          )}
        </div>
      </C_Stack>
    </div>
  )
}
