'use client'

import PlaceHolder from 'src/cm/components/utils/loader/PlaceHolder'
import {useEffect} from 'react'
import {signOut} from 'next-auth/react'

const SignOuter = ({redirectPath}) => {
  useEffect(() => {
    signOut()
  }, [])

  return <PlaceHolder>Redirecting...</PlaceHolder>
}

export default SignOuter
