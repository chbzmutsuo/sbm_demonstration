import {useMemo} from 'react'
import {identifyPathItem, PAGES} from 'src/non-common/path-title-constsnts'
import {rootPaths} from 'src/middleware'
import {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobalOrigin'
import {AccessValidationResult, CheckValidAccessProps} from '@cm/components/layout/Admin/type'

const checkValidAccess = (props: CheckValidAccessProps) => {
  const {allPathsPatterns, pathname, origin = ''} = props
  const matchedPathItem = identifyPathItem({allPathsPattenrs: allPathsPatterns, pathname})

  if (matchedPathItem?.exclusiveTo === false) {
    const rootPath = matchedPathItem?.href?.split('/')[1]
    const path = `${origin}/not-found?rootPath=${rootPath}`

    return {valid: false, path}
  } else {
    return {valid: true, path: ''}
  }
}

export const useAccessValidation = (useGlobalProps: useGlobalPropType): AccessValidationResult => {
  const {session, rootPath, pathname, query, roles, waitRendering} = useGlobalProps

  const validationResult = useMemo(() => {
    // レンダリング待機中またはロール未定義の場合はスキップ
    if (waitRendering || roles === undefined) {
      return {isValid: true, needsRedirect: false}
    }

    // パスチェック
    const pathChecks = rootPaths
      .filter(path => path.rootPath === rootPath)
      .map(d => {
        const rootPath = d.rootPath
        const GET_PAGE_METHOD_NAME = `${rootPath}_PAGES`
        const PAGE_GETTER = PAGES[GET_PAGE_METHOD_NAME]

        if (!PAGE_GETTER) {
          return {valid: true, path: ''}
        }

        const allPathsPatterns = PAGE_GETTER({session, rootPath, pathname, query, roles}).allPathsPattenrs

        return checkValidAccess({
          allPathsPatterns,
          pathname,
          origin: '',
        })
      })

    const invalidCheck = pathChecks.find(item => item.valid === false)

    if (invalidCheck) {
      return {
        isValid: false,
        redirectPath: invalidCheck.path,
        needsRedirect: true,
      }
    }

    return {isValid: true, needsRedirect: false}
  }, [session, rootPath, pathname, query, roles, waitRendering])

  return validationResult
}
