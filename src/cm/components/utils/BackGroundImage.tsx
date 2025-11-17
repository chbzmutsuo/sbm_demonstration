'use client '

import Image from 'next/image'
import React from 'react'

const BackGroundImage = React.memo(
  (props: {style?: React.CSSProperties; url: string; className?: string; children?: React.ReactNode}) => {
    const {style, className} = props

    return (
      <>
        <Image
          {...{
            className: '',
            alt: '',
            src: props.url,
            fill: true,
            style: {objectFit: 'cover', objectPosition: `center`},
          }}
        />
      </>
    )
  }
)

export default BackGroundImage
