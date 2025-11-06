'use client'

import {Popover, PopoverContent, PopoverTrigger} from '@shadcn/ui/popover'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerFooter,
  DrawerPortal,
} from '@shadcn/ui/drawer'

import {PopoverPortal} from '@radix-ui/react-popover'

import React from 'react'
import {JSX} from 'react'
import {useIsMobile} from '@shadcn/hooks/use-mobile'

type ShadPopoverProps = {
  PopoverTrigger?: JSX.Element | string
  open?: boolean
  setopen?: any

  onOpenAutoFocus?: any
  title?: string
  description?: string
  footer?: JSX.Element
  children: JSX.Element
  mode?: 'click' | 'hover'
  closeOnHoverLeave?: boolean
  closeOnOutsideClick?: boolean
  confirmBeforeClose?: boolean
  confirmMessage?: string
}
const ShadPopover = React.memo((props: ShadPopoverProps) => {
  const {
    open,
    setopen,

    PopoverTrigger: Trigger,
    children,
    onOpenAutoFocus = e => e.preventDefault(),
    title,
    description,
    mode = 'hover',
    footer,
    closeOnHoverLeave = true,
    closeOnOutsideClick = true,
    confirmBeforeClose = false,
    confirmMessage = '閉じてもよろしいですか？',
  } = props
  const mobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(false)

  const isControlled = open !== undefined
  const openState = isControlled ? open : isOpen

  const headerClass = title || description ? '' : 'hidden'
  const footerClass = footer ? '' : 'hidden'

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      // 閉じる処理の場合、確認メッセージを表示
      if (!newOpen && confirmBeforeClose) {
        const shouldClose = window.confirm(confirmMessage)
        if (!shouldClose) {
          return // ユーザーがキャンセルした場合は閉じない
        }
      }

      if (!isControlled) {
        setIsOpen(newOpen)
      }

      if (setopen) {
        setopen(newOpen)
      }
    },
    [setopen, isControlled, confirmBeforeClose, confirmMessage]
  )

  const handleMouseEnter = React.useCallback(() => {
    if (mode === 'click') return

    handleOpenChange(true)
  }, [mode, handleOpenChange])

  const handleMouseLeave = React.useCallback(() => {
    if (mode === 'click') return
    if (!closeOnHoverLeave) return // ホバーで閉じない設定の場合は何もしない

    handleOpenChange(false)
  }, [mode, handleOpenChange, closeOnHoverLeave])

  const handleTriggerClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (mode === 'hover') return
      e.preventDefault()
      e.stopPropagation()

      handleOpenChange(!openState)
    },
    [mode, openState, handleOpenChange]
  )

  const handleInteractOutside = React.useCallback(
    (e: Event) => {
      if (!closeOnOutsideClick) {
        e.preventDefault()
        return
      }
      // closeOnOutsideClickがtrueの場合は、handleOpenChangeが呼ばれる
      // その中でconfirmBeforeCloseの確認が行われる
    },
    [closeOnOutsideClick]
  )

  if (mobile) {
    return (
      <div>
        <Drawer open={openState} onOpenChange={handleOpenChange}>
          <DrawerTrigger asChild className={`PopoverTrigger`}>
            <div onClick={handleTriggerClick}>{Trigger}</div>
          </DrawerTrigger>
          <DrawerPortal>
            <DrawerContent
              onOpenAutoFocus={onOpenAutoFocus}
              className="PopoverContent  rounded-lg  bg-white  shadow-md border border-gray-200 "
            >
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader className={headerClass}>
                  <DrawerTitle>{title}</DrawerTitle>
                  <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>

                <div className={`w-fit mx-auto`}>{children}</div>

                <DrawerFooter className={footerClass}></DrawerFooter>
              </div>
            </DrawerContent>
          </DrawerPortal>
        </Drawer>
      </div>
    )
  }

  return (
    <div>
      <Popover open={openState} onOpenChange={handleOpenChange}>
        {Trigger && (
          <PopoverTrigger asChild className={`PopoverTrigger`}>
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleTriggerClick}
              style={{cursor: 'pointer'}}
            >
              {React.isValidElement(Trigger) ? Trigger : <span>{Trigger}</span>}
            </div>
          </PopoverTrigger>
        )}

        <PopoverPortal>
          <PopoverContent
            onOpenAutoFocus={onOpenAutoFocus}
            className="PopoverContent  p-3 w-fit  mx-auto  shadow-lg shadow-gray-500 border border-gray-200 bg-white"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onInteractOutside={handleInteractOutside}
          >
            <div className={`bg-white   `}>{children}</div>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  )
})

ShadPopover.displayName = 'ShadPopover'
export default ShadPopover
