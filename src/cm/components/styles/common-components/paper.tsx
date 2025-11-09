import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@cm/shadcn/ui/card'
import {cl} from '@cm/lib/methods/common'
import {htmlProps} from '@cm/types/utility-types'

export const Wrapper = (props: htmlProps) => {
  const {className, ...rest} = props
  return <div className={cl('h-fit p-0.5 sm:p-1   shadow bg-white  ', className)}>{props.children}</div>
}
export const WrapperRounded = (props: htmlProps) => {
  const {className, ...rest} = props
  return <Wrapper className={cl('rounded-sm', className)}>{props.children}</Wrapper>
}

export const Paper = (
  props: htmlProps & {
    title?: string
    description?: string
    action?: React.ReactNode
    children: React.ReactNode
    footer?: React.ReactNode
  }
) => {
  const showHeader = props.title || props.description || props.action

  return (
    <Card {...props}>
      {showHeader && (
        <CardHeader>
          <CardTitle>{props.title}</CardTitle>
          <CardDescription>{props.description}</CardDescription>
          <CardAction>{props.action}</CardAction>
        </CardHeader>
      )}
      <CardContent>{props.children}</CardContent>
      <CardFooter className="flex-col gap-2">{props.footer}</CardFooter>
    </Card>
  )
}
export const PaperLarge = Paper
