import { cn } from '@cm/shadcn/lib/utils'
import ReactMarkdown from 'react-markdown'

export const MarkDownDisplay = props => {
  const { className, ...rest } = props
  if (!props.children) return <></>
  let text = props.children
  text = String(text).replace(/\n|\r/g, '\n\n')

  return (
    <div {...{ className: cn('react-markdown  ', className) }}>
      <ReactMarkdown {...rest}>{text}</ReactMarkdown>
    </div>
  )
}

export const arrToLines = arr => {
  return arr.join('\n')
}

export const addMarkdownNotation = (props: { arr: string[]; prefix?: string; affix?: string }) => {
  const { arr, prefix, affix } = props
  const result = arr.map((d, i) => {
    return `${prefix ?? ''}${d}${affix ?? ''}\n`
  })

  return result
}
