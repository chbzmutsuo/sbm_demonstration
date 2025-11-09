'use client'
import React, {JSX} from 'react'
import {Alert, AlertTitle, AlertDescription} from '@shadcn/ui/alert'

import {colorVariantStr} from '@shadcn/lib/variant-types'
import {cn} from '@shadcn/lib/utils'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

import {Text} from '@shadcn/ui/text'
import {InfoIcon} from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'
import {htmlProps} from '@cm/types/utility-types'

export const alertVariantClasses = {
  info: 'border-info bg-info/10 text-info',
  success: 'border-success bg-success/10 text-success',
  warning: 'border-warning bg-warning/10 text-warning',
  destructive: 'border-destructive bg-destructive/10 text-destructive',
  disabled: 'border-disabled bg-disabled/10 text-disabled',
}

export default function ShadAlert(
  props: htmlProps & {
    title: string
    list?: any[]
    variant?: colorVariantStr
    PopUpButton?: JSX.Element
  }
) {
  const {title, list, variant = 'info', PopUpButton, className, ...rest} = props

  const variantClasses = alertVariantClasses[variant]

  const Main = () => {
    return (
      <Alert className={cn(variantClasses, 'border-l-4', className)} {...rest}>
        <AlertTitle>
          <Text type="label" color={variant} className={` text-start`}>
            {title}
          </Text>
        </AlertTitle>

        <AlertDescription>
          {list && list.length > 0 && (
            <C_Stack className="gap-1 text-xs">
              {list.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-current opacity-60">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </C_Stack>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (PopUpButton) {
    return (
      <PopUp PopUpButton={PopUpButton}>
        <Main />
      </PopUp>
    )
  } else {
    return <Main />
  }
}

function PopUp(props: {children: React.ReactNode; PopUpButton?: React.ReactNode}) {
  const {children, PopUpButton = <InfoIcon className={`text-blue-500`} />} = props
  const popUpModal = useModal()

  return (
    <div>
      <div className="flex items-center justify-center ">
        <div className="flex items-center justify-center ">
          <div onClick={() => popUpModal.setopen(true)} className="">
            {PopUpButton}
          </div>
        </div>
      </div>

      <popUpModal.Modal>{props.children}</popUpModal.Modal>
    </div>
  )
}
