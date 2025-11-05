import {colorVariants} from '@cm/lib/methods/colorVariants'

export const baseColorList: colorVariants[] = [
  'gray',
  'red',
  'blue',
  'orange',
  'green',
  'yellow',
  'sub',
  'primary',
  'transparent',
]

export const getYiq = color => {
  const hexcolor = String(color)?.replace('#', '')
  // Convert hex color to RGB values
  const r = parseInt(hexcolor.slice(0, 2), 16)
  const g = parseInt(hexcolor.slice(2, 4), 16)
  const b = parseInt(hexcolor.slice(4, 6), 16)

  // Calculate YIQ color value
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq
}

export function getColorStyles(backgroundColor: string, options?: any) {
  const {withBorder = false, opacity = 100} = options ?? {}

  // Calculate YIQ color value
  const yiq = getYiq(backgroundColor)

  // Choose white or black text color based on YIQ value
  const color = yiq >= 100 ? `#454545` : 'white'

  const border = withBorder ? `2px solid ${backgroundColor}80` : undefined

  return {
    color,
    backgroundColor,
    border,
  }
}

export function createGradient({direction = 'to bottom', colors}) {
  const gradient = colors.join(', ')
  return `linear-gradient(${direction}, ${gradient})`
}
export function convertHexToRGBA(hexCode, alpha = 0.7) {
  if (!hexCode) {
    return hexCode
  }

  // カラーコードからRGB値を抽出する
  const red = parseInt(hexCode.slice(1, 3), 16)
  const green = parseInt(hexCode.slice(3, 5), 16)
  const blue = parseInt(hexCode.slice(5, 7), 16)

  // RGBA値を組み立てる
  const rgba = 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')'

  // RGBA値を返す
  return rgba
}
