import { ObjectMap } from 'src/cm/lib/methods/common'

export const addQuerySentence = (additionalQuery = {}, currentQuery = {}, keepOldQuery = true) => {
  let newQuery = { ...additionalQuery }
  if (keepOldQuery) {
    newQuery = { ...currentQuery, ...additionalQuery }
  }

  const newPrams = Object.keys(newQuery).reduce((accu, key) => {
    const value = newQuery[key]

    if (value) {
      // URLエンコードを追加（&などの特殊文字を正しく処理するため）
      const encodedValue = encodeURIComponent(String(value))
      const queryString = `${key}=${encodedValue}`
      const preFix = accu ? '&' : '?'

      return accu + preFix + queryString
    } else {
      return accu
    }
  }, '')

  return newPrams
}

export const makeQuery = searchParams => {
  const query: any = {}
  searchParams?.forEach((value, key) => {
    query[key] = value
  })
  return query
}

export const makeGlobalQuery = query => {
  const globalQuery = {}
  Object.keys(query ?? {}).forEach(key => {
    if (key.includes('g_')) {
      const currentValue = query[key]

      globalQuery[key] = currentValue
    }
  })

  return globalQuery
}

export const HREF = (pathname, additionalQuery, currentQuery, options?) => {
  const { forceDelete } = options ?? {}
  const isAbsolutePath = String(pathname).includes(`http`)

  const paramOrigin = { ...additionalQuery, ...makeGlobalQuery(currentQuery) }
  Object.keys(additionalQuery).forEach(key => {
    if (additionalQuery[key] === null) {
      delete paramOrigin[key]
    }
  })

  if (forceDelete) {
    Object.keys(forceDelete).forEach(key => {
      delete paramOrigin[key]
    })
  }

  const params = addQuerySentence(paramOrigin)

  if (isAbsolutePath) {
    pathname = pathname.replace(`/http`, `http`)
  }
  const href = pathname + params

  if (!href.startsWith('/') && pathname !== '' && !isAbsolutePath) {
    // console.warn('href is not start with /', {pathname, href})
  }

  return href
}

export function objectsAreEqual(objA, objB) {
  if (objA === objB) return true

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key) || !objectsAreEqual(objA[key], objB[key])) {
      return false
    }
  }

  return true
}

export const getQueryIds = (props: { query: any; queryKey: string; data?: any[]; dataId?: string }) => {
  const { query, queryKey, data, dataId } = props

  type idsArrQueryType = {
    all: string[]
    current: string[]
  }

  const idsArrQuery_tmp: idsArrQueryType = {
    all:
      data?.map(d => {
        return String(d?.[dataId ?? ''])
      }) ?? [],

    current: query[queryKey] ? String(query[queryKey] ?? '')?.split(',') : [],
  }

  const idsArrToString = ObjectMap(idsArrQuery_tmp, (key, value) => {
    return value.sort((a, b) => Number(a) - Number(b))
  }) as idsArrQueryType

  const chechIsActive = (data, dataId) => {
    const { current } = idsArrToString
    const ID = data[dataId]

    const isActive = current.includes(String(data[dataId]))
    const newQueryUserIdArr: string[] = isActive ? current.filter(id => String(id) !== String(ID)) : [...current, String(ID)]

    const toQueryStr = newQueryUserIdArr.sort((a, b) => Number(a) - Number(b)).join(',')

    return {
      isActive,
      toQueryStr,
    }
  }

  return {
    idsArrToString,
    chechIsActive,
  }
}
