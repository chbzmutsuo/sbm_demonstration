import {mergeHtmlProps} from '@cm/components/styles/common-components/type'
import {htmlProps} from '@cm/types/utility-types'

export const Head1 = (props: htmlProps & {}) => {
  return (
    <h1
      {...mergeHtmlProps(props, {
        className: `text-xl font-bold text-blue-700 drop-shadow-lg`,
      })}
    >
      {props.children}
    </h1>
  )
}

export const Head2 = (props: htmlProps & {}) => (
  <h2
    {...mergeHtmlProps(props, {
      className: `text-lg font-bold text-blue-800 tracking-wider drop-shadow-lg border-l-4 border-blue-400 px-2 pr-4 bg-blue-50 rounded`,
    })}
  >
    {props.children}
  </h2>
)

export const Head3 = (props: htmlProps & {}) => (
  <h3
    {...mergeHtmlProps(props, {
      className: `'text-base font-semibold text-blue-600 italic bg-blue-100 px-3 py-1 rounded shadow-sm border-l-2 border-blue-300'`,
    })}
  >
    {props.children}
  </h3>
)
