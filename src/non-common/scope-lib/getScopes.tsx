import {arr__findCommonValues} from '@cm/class/ArrHandler/array-utils/data-operations'
import {anyObject} from '@cm/types/utility-types'

import {judgeIsAdmin, roleIs, typeIs} from 'src/non-common/scope-lib/judgeIsAdmin'

type GroupieScopeType = {
  schoolId?: number
  teacherId?: number
  classroomId?: number
  isSchoolLeader: boolean
}

type AdvantageScopeType = {
  isCoach: boolean
  isStudent: boolean
}

type getScopeOptionsProps = {query?: anyObject; roles?: any[]}

export const getScopes = (session: anyObject, options: getScopeOptionsProps) => {
  const {query, roles} = options ?? {}

  const roleNames = (roles ?? []).map(d => d.name)
  const login = session?.id ? true : false
  const {admin, getGlobalUserId} = judgeIsAdmin(session, query)

  const result = {
    login,
    admin,
    getGlobalUserId,
    getGroupieScopes: () => {
      const schoolId = !admin ? session?.schoolId : Number(query?.g_schoolId ?? 0)

      const teacherId = !admin ? session?.id : Number(query?.g_teacherId ?? 0)
      const isSchoolLeader = typeIs(['責任者'], session)

      let result: GroupieScopeType = {
        schoolId,
        teacherId,
        isSchoolLeader,
      }

      result = addAdminToRoles(result, session) as GroupieScopeType
      return result
    },

    getTbmScopes: () => {
      const eigyoshoKirikae = !!arr__findCommonValues([`営業所切替`], roleNames)
      const fakable = admin || eigyoshoKirikae

      const userId = !fakable ? session?.id : Number(query?.g_userId ?? session?.id ?? 0)
      const tbmBaseId = !fakable ? session?.tbmBaseId : Number(query?.g_tbmBaseId ?? session?.tbmBaseId ?? 0)

      const isSystemAdmin = !!arr__findCommonValues([`管理者`], roleNames) || admin
      const isShocho = !!arr__findCommonValues([`所長`], roleNames)

      return {userId, tbmBaseId, isSystemAdmin, isShocho, eigyoshoKirikae}
    },

    getAidocumentScopes: () => {
      const fakable = admin

      const userId = !fakable ? session?.id : Number(query?.g_userId ?? session?.id ?? 0)
      const companyId = !fakable
        ? session?.aidocumentCompanyId
        : Number(query?.g_aidocumentCompanyId ?? session?.aidocumentCompanyId ?? 0)

      const isSystemAdmin = !!arr__findCommonValues([`管理者`], roleNames) || admin

      return {userId, companyId, isSystemAdmin, fakable}
    },
  }

  return result
}

const addAdminToRoles: (targetObject: any, session: anyObject) => anyObject = (targetObject, session) => {
  // const result: anyObject = {...targetObject}
  Object.keys(targetObject).forEach(key => {
    const value = targetObject[key]
    targetObject[key] = value

    if (typeof targetObject[key] !== 'object' && roleIs(['管理者'], session) && targetObject[key] === false) {
      targetObject[key] = true
    }
  })

  return targetObject
}
