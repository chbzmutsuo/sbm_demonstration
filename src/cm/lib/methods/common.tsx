import {anyObject} from '@cm/types/utility-types'
import {CSSProperties} from 'react'
import {toast} from 'react-toastify'
import {memoize} from 'lodash'

export const basePath = typeof window === `undefined` ? (process.env.NEXT_PUBLIC_BASEPATH ?? '') : window.location.origin
export const isDev = process.env.NODE_ENV === 'development'
export const apiPath = `${basePath}/api`
export const systemEmailTo = String(process.env.SYSTEM_EMAIL_TO ?? '').split(',')

export const routePath = `${basePath}/api/prisma`
export const routeEndpoint = {
  search: `${routePath}/search`,
  universal: `${routePath}/universal`,
}

export const isServer = typeof window === 'undefined'

export const handleDB = async callback => {
  try {
    const result = await callback()
    if (result?.success === false) {
      // toast.error(result?.message ?? '更新に失敗しました。')
      throw new Error(result?.message ?? '更新に失敗しました。', {})
    } else {
      return result
    }
  } catch (error) {
    console.error(error.stack)
    toast.error(`更新失敗`)
    return error
  }
}

export async function logKeys(obj) {
  Object.keys(obj).forEach(key => {
    console.info(key, obj[key])
  })
  console.info('keys:', Object.keys(obj))
}
export async function logJson(data) {
  console.info(JSON.stringify(data))
}

export function isAuthorized(session, roleArr = ['管理者']) {
  return roleArr.includes(session?.role)
}

export function sleep(time) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

export const toJson = str => {
  try {
    JSON.parse(str)
    return JSON.parse(str)
  } catch (e) {
    return false
  }
}

export function superTrim(value) {
  return String(value ?? '')
    .replace(/\s| |/g, '')
    .replace(/\n|\r|\\n/g, '')
    .replace('（', '(')
    .replace('）', ')')
    .replace('¥', '')
}

export function shorten(string, letterCount = 4, rest = '..') {
  if (!string) {
    return ''
  }
  return String(string).slice(0, letterCount) + (string.length > letterCount ? rest : '')
}

export const responsiveClass = (className: string, size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl') => {
  if (!size) return className
  return String(
    className
      .split(/\s/)
      .map(value => `${size}:${value}`)
      .join(' ')
  )
}
export const mapper = (key: string, classNameList: string[]) => {
  const result = classNameList
    .map(className => {
      return `${key}:!${className}`
    })
    .join(` `)

  return result
}
export const cl = (...classNames) => {
  return String(classNames?.join(' '))
}

export function darkenHexColor(hex, percent) {
  // #があれば取り除く
  hex = hex.replace(/^#/, '')

  // 3桁のHEXコードを6桁に変換
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(function (hexChar) {
        return hexChar + hexChar
      })
      .join('')
  }

  // 各カラー成分（R, G, B）を抽出
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)

  // 指定した割合で暗くする
  r = Math.floor(r * (1 - percent))
  g = Math.floor(g * (1 - percent))
  b = Math.floor(b * (1 - percent))

  // 16進数に変換し、2桁にゼロ埋め
  const newHex = '#' + ('0' + r.toString(16)).slice(-2) + ('0' + g.toString(16)).slice(-2) + ('0' + b.toString(16)).slice(-2)

  return newHex
}

export const getUniqueColorById = memoize((id: any, numColors = 100) => {
  id = String(id)

  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }

  const goldenAngle = 137.508 // degrees
  const hue = (Math.abs(hash % numColors) * goldenAngle) % 360

  // Convert to RGB and format as a hex color code
  const result = hslToHex(hue, 100, 50)
  return result

  // Converts an HSL color value to RGB and formats it as a hex color code.
  function hslToHex(h, s, l) {
    h /= 360
    s /= 100
    l /= 100
    let r, g, b
    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return '#' + toHex(r) + toHex(g) + toHex(b)
  }
})

export function generateColorCodeInRange(value, minVal, maxVal, whiteAdjustment = 0.4) {
  // 値が範囲外の場合は調整
  value = Math.max(minVal, Math.min(maxVal, value))

  // 範囲内での値の位置を0～1の範囲で計算
  const ratio = (value - minVal) / (maxVal - minVal)

  let r, g, b

  if (ratio < 0.5) {
    // 緑から黄色
    r = ratio * 2 * 255
    g = 255
    b = 0
  } else if (ratio < 0.75) {
    // 黄色からオレンジ
    r = 255
    g = 255 - (ratio - 0.5) * 4 * 255
    b = 0
  } else {
    // オレンジから赤
    r = 255
    g = (1 - ratio) * 4 * 255
    b = 0
  }

  // 白色の調整
  r += (255 - r) * whiteAdjustment
  g += (255 - g) * whiteAdjustment
  b += (255 - b) * whiteAdjustment

  // 16進数の文字列に変換
  const colorCode = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b)
    .toString(16)
    .padStart(2, '0')}`

  return colorCode
}

export function ObjectMap(obj, callback) {
  let i = 0
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key] = callback(key, value, i)
    i++
  }
  return result
}

export const funcOrVar = (value, ...args) => {
  return typeof value === 'function' ? value(...args) : value
}

export const absSize = (props: {width?: any; height?: any}) => {
  const {width, height} = props
  return {
    minWidth: width ? width : undefined,
    maxWidth: width ? width : undefined,
    minHeight: height ? height : undefined,
    maxHeight: height ? height : undefined,
  } as CSSProperties
}

export const JsonLength = (data: anyObject) => {
  return console.info(JSON.stringify(data).length)
}
