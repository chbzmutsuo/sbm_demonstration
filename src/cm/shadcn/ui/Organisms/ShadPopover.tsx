'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'

import { PopoverPortal } from '@radix-ui/react-popover'

import React from 'react'
import { JSX } from 'react'
import { useIsMobile } from '@shadcn/hooks/use-mobile'
import { useJotaiByKey } from '@cm/hooks/useJotai'

type ShadPopoverProps = {
  Trigger?: JSX.Element | string
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

  popoverId?: string // 同じIDを持つPopoverをグループ化
  maxOpen?: number // 同じIDで同時に開ける最大数（デフォルト: 1）
}
const ShadPopover = React.memo((props: ShadPopoverProps) => {
  const {
    open,
    setopen,

    Trigger: Trigger,
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
    popoverId,
    maxOpen = 1,
  } = props
  const mobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(false)


  // 各PopoverインスタンスにユニークなIDを生成
  const instanceId = React.useMemo(() => `popover_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, [])

  // 同じIDを持つPopoverの開いているインスタンスIDのセットを管理
  // popoverIdが指定されている場合のみ制限機能を有効化
  const jotaiKey = popoverId ? `popover_open_instances_${popoverId}` : `popover_no_limit_${instanceId}`
  const [openInstances, setOpenInstances] = useJotaiByKey<Set<string>>(jotaiKey, new Set<string>())

  const isControlled = open !== undefined
  const openState = isControlled ? open : isOpen

  const headerClass = title || description ? '' : 'hidden'
  const footerClass = footer ? '' : 'hidden'



  // アンマウント時にインスタンスIDを削除
  React.useEffect(() => {
    return () => {
      if (popoverId) {
        setOpenInstances(prev => {
          const newSet = new Set(prev)
          newSet.delete(instanceId)
          return newSet
        })
      }
    }
  }, [popoverId, instanceId, setOpenInstances])



  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      // 開く処理の場合、最大数チェック
      if (newOpen && popoverId) {
        const currentOpenCount = openInstances.size
        if (currentOpenCount >= maxOpen) {
          // 既に最大数開いている場合は開かない
          return
        }
        // このインスタンスを開いているセットに追加
        setOpenInstances(prev => {
          const newSet = new Set(prev)
          newSet.add(instanceId)
          return newSet
        })
      }

      // 閉じる処理の場合
      if (!newOpen) {
        // 確認メッセージを表示
        if (confirmBeforeClose) {
          const shouldClose = window.confirm(confirmMessage)
          if (!shouldClose) {
            return // ユーザーがキャンセルした場合は閉じない
          }
        }

        // このインスタンスを開いているセットから削除
        if (popoverId) {
          setOpenInstances(prev => {
            const newSet = new Set(prev)
            newSet.delete(instanceId)
            return newSet
          })
        }
      }

      if (!isControlled) {
        setIsOpen(newOpen)
      }

      if (setopen) {
        setopen(newOpen)
      }
    },
    [setopen, isControlled, confirmBeforeClose, confirmMessage, popoverId, maxOpen, openInstances, instanceId, setOpenInstances]
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




  return (
    <div>
      <Popover open={openState} onOpenChange={handleOpenChange}>
        {Trigger && (
          <PopoverTrigger asChild className={`PopoverTrigger`}>
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleTriggerClick}
              style={{ cursor: 'pointer' }}
            >
              {React.isValidElement(Trigger) ? Trigger : <span>{Trigger}</span>}
            </div>
          </PopoverTrigger>
        )}

        <PopoverPortal>
          <PopoverContent
            onOpenAutoFocus={onOpenAutoFocus}
            className="PopoverContent  p-2 w-fit   mx-auto  shadow-lg shadow-gray-500 border border-gray-200 bg-white"
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
