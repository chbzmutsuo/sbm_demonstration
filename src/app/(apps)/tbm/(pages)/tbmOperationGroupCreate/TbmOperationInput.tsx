'use client'

import {getFormList, UserInputType} from '@app/(apps)/tbm/(pages)/tbmOperationGroupCreate/FormList/formList'
import {TextBlue, TextRed} from '@cm/components/styles/common-components/Alert'
import {Button} from '@cm/components/styles/common-components/Button'

import {Absolute, C_Stack, Center, R_Stack} from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {atomKey, useJotaiByKey} from '@cm/hooks/useJotai'
import {colorVariants} from '@cm/lib/methods/colorVariants'

import React from 'react'

export type InputType = 'base' | 'go' | 'back' | 'refuel' | 'complete' | null

export default function TbmOperationInput({latestOperation}) {
  const {toggleLoad} = useGlobal()
  // 現在の入力画面の状態を管理

  const {go, back, base} = getData({TbmOperationGroup: latestOperation})

  const [userInput, setuserInput] = useJotaiByKey<UserInputType>('userInput' as atomKey, {
    base: base,
    go: go,
    back: back,
    refuel: null,
    complete: base?.confirmed,
  })

  const formList = getFormList(userInput)
  const [currentForm, setcurrentForm] = useJotaiByKey<InputType>('currentForm' as atomKey, null)

  // 入力画面を表示する関数
  const renderCurrentForm = () => {
    const Theitem = formList.find(form => form.key === currentForm)

    if (Theitem) {
      return (
        <div className={` absolute-center mx-auto  scale-125`}>
          <C_Stack>
            <strong className={`text-gray-500`}>{Theitem?.label}</strong>
            <div>{Theitem?.main?.({userInput})}</div>
            <R_Stack className={`mt-10`}>
              <div className={`t-link`} onClick={() => setcurrentForm(null)}>
                戻る
              </div>
            </R_Stack>
          </C_Stack>
        </div>
      )
    }
  }

  return (
    <Center className={`max-w-[600px] py-2`}>
      {/* 入力フォームを表示 */}
      {renderCurrentForm()}

      <C_Stack className={`gap-8`}>
        {/* ボタン */}
        {currentForm ? (
          <></>
        ) : (
          <C_Stack className={`items-center gap-8`}>
            <Absolute className={`top-[30px]! w-full text-center `}>
              {latestOperation ? (
                <TextRed>未完了の運行入力が{latestOperation.length}件存在します。</TextRed>
              ) : (
                <TextBlue>「営業所・車両選択」から運行を開始できます。</TextBlue>
              )}
            </Absolute>
            {formList.map(form => (
              <Button
                disabled={form.disabled}
                className={`h-[50px] w-[240px] text-[20px]! `}
                size="lg"
                key={form.label}
                color={form.color as colorVariants}
                onClick={() => {
                  if (form.onClick) {
                    form.onClick?.(toggleLoad)
                  } else {
                    setcurrentForm(form.key)
                  }
                }}
              >
                {form.label}
              </Button>
            ))}
          </C_Stack>
        )}
      </C_Stack>
    </Center>
  )
}

const getData = ({TbmOperationGroup}) => {
  if (TbmOperationGroup) {
    const go = TbmOperationGroup?.TbmOperation?.find(op => op.type === 'go')
    const back = TbmOperationGroup?.TbmOperation?.find(op => op.type === 'back')

    return {go, back, base: TbmOperationGroup}
  } else {
    return {go: null, back: null, base: null}
  }
}
