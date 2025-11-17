import React, {useMemo} from 'react'

type MetaDataProps = {
  pathItemObject: any
  AppName: string | any
}

export const MetaData = React.memo(({pathItemObject, AppName}: MetaDataProps) => {
  const {matchedPathItem} = pathItemObject

  const titleData = useMemo(() => {
    if (!matchedPathItem) return null

    const {label, icon} = matchedPathItem
    const left = typeof AppName === 'string' ? AppName : ''
    const right = label ?? ''
    const title = left ? `${left} ${right}` : (right ?? process.env.NEXT_PUBLIC_TITLE ?? '無題')

    return {
      title: title.replace('[object Object]', ''),
      icon,
    }
  }, [matchedPathItem, AppName])

  if (!titleData) return <></>

  return (
    <>
      <title>{titleData.title}</title>
      {titleData.icon && <link rel="icon" href={`/${titleData.icon}`} />}
    </>
  )
})
