'use client'

import {useIsMobile} from '@shadcn/hooks/use-mobile'
import {Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from '@shadcn/ui/dialog'
import {
  Drawer,
  // DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@shadcn/ui/drawer'

import dynamic from 'next/dynamic'
const DialogContent = dynamic(() => import('@shadcn/ui/dialog').then(mod => mod.DialogContent), {
  loading: () => <></>,
})

const DrawerContent = dynamic(() => import('@shadcn/ui/drawer').then(mod => mod.DrawerContent), {
  loading: () => <></>,
})

import {cn} from '@shadcn/lib/utils'

import React from 'react'
import {JSX} from 'react'

type ShadModalProps = {
  Trigger?: JSX.Element | string
  open?: boolean
  onOpenChange?: any
  onOpenAutoFocus?: any
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  childrenProps?: {
    className?: string
  }
}

const ShadModal = React.memo((props: ShadModalProps) => {
  const {
    open,
    onOpenChange,
    Trigger: Trigger,
    childrenProps,
    children,
    onOpenAutoFocus = e => e.preventDefault(),
    title,
    description,
    footer,
    className = 'p-2',
    style,
  } = props
  const mobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      setIsOpen(newOpen)
      if (onOpenChange) {
        onOpenChange(newOpen)
      }
    },
    [onOpenChange]
  )

  const isControlled = open !== undefined
  const openState = isControlled ? open : isOpen

  if (mobile) {
    return (
      <Drawer open={openState} onOpenChange={handleOpenChange}>
        {Trigger && <DrawerTrigger asChild>{Trigger}</DrawerTrigger>}

        {openState && (
          <DrawerContent
            style={style}
            onOpenAutoFocus={onOpenAutoFocus}
            className={cn(`ModalContent rounded-lg bg-white p-1 shadow-md border border-gray-200 ${className}`)}
          >
            <div
              style={{
                maxHeight: '75vh',
                maxWidth: '95vw',
                overflow: 'auto',
              }}
            >
              <div className="mx-auto w-full ">
                <DrawerHeader>
                  <DrawerTitle>{title}</DrawerTitle>
                  <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>

                <div className="w-fit mx-auto">{children}</div>

                {footer && <DrawerFooter>{footer}</DrawerFooter>}
              </div>
            </div>
          </DrawerContent>
        )}
      </Drawer>
    )
  }

  return (
    <Dialog open={openState} onOpenChange={handleOpenChange}>
      {Trigger && <DialogTrigger asChild>{Trigger}</DialogTrigger>}

      {openState && (
        <DialogContent
          onOpenAutoFocus={onOpenAutoFocus}
          style={{
            ...style,
            maxHeight: '85vh',
            maxWidth: '95vw',
            overflow: 'auto',
          }}
          className={cn(
            `ModalContent  w-fit mx-auto shadow-lg shadow-gray-500  border-gray-200 bg-white ${className}`,
            childrenProps?.className
          )}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="bg-white">{children}</div>

          <DialogFooter>{footer}</DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
})

ShadModal.displayName = 'ShadModal'
export default ShadModal
