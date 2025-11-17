import {Days} from '@cm/class/Days/Days'
import {fetchAlt} from '@cm/lib/http/fetch-client'
import prisma from 'src/lib/prisma'

const AUTH_USER_URL = 'https://api.jquants.com/v1/token/auth_user'
const AUTH_REFRESH_URL = 'https://api.jquants.com/v1/token/auth_refresh'

export const getRefreshToken = async () => {
  const email = process.env.JQUANTS_EMAIL
  const password = process.env.JQUANTS_PW

  if (!email || !password) {
    return {success: false, result: null, message: 'JQUANTS_EMAILまたはJQUANTS_PWが設定されていません'}
  }

  try {
    const result = await fetchAlt(AUTH_USER_URL, {mailaddress: email, password})
    return {success: true, result}
  } catch (e: any) {
    return {success: false, message: e.message || '取得に失敗しました'}
  }
}

export const getIdToken = async () => {
  const {result} = await getRefreshToken()
  const refreshToken = result.refreshToken

  if (!refreshToken) {
    return {success: false, message: 'refreshTokenが取得できませんでした'}
  }

  try {
    const result = await fetchAlt(AUTH_REFRESH_URL + `?refreshtoken=${refreshToken}`, {refreshToken})

    return {success: true, result, message: '取得に成功しました'}
  } catch (e: any) {
    return {success: false, message: e.message || '取得に失敗しました'}
  }
}

// export const getJQUANTS_ID_TOKEN = async () => {
//   return await updateJquantsTokenInPg()
// }

export const getJQUANTS_ID_TOKEN = async () => {
  try {
    const tokenName = `JQUANTS_ID_TOKEN`
    const current = await prisma.tokens.findUnique({where: {name: tokenName}})

    const currentTokenIsEffective = current?.expiresAt && current.expiresAt > new Date()

    if (currentTokenIsEffective) {
      return current.token
    } else {
      const token = (await getIdToken()).result.idToken

      const expiresAt = Days.hour.add(new Date(), 3)
      if (token) {
        const newToken = await prisma.tokens.upsert({
          where: {name: tokenName},
          create: {name: tokenName, token, expiresAt},
          update: {token, expiresAt},
        })
        return newToken.token
      }
    }
  } catch (error) {
    console.error(error.stack) //////////
    console.error(error.message)
  }
}
