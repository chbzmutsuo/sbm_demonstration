'use client'

import {additionalPropsType, requestResultType} from '@cm/types/types'
import {anyObject} from '@cm/types/utility-types'
import {PrismaModelNames} from '@cm/types/prisma-types'
import {prismaDataExtractionQueryType} from '@cm/components/DataLogic/TFs/Server/Conf'
import {toast} from 'react-toastify'
import {toastByResult} from '@cm/lib/ui/notifications'
import {myFormDefaultUpsert} from '@cm/lib/formMethods/myFormDefaultUpsert'
import {upsertControllerType} from '@cm/types/form-types'

export type UpsertMainProps = {
  latestFormData: anyObject
  upsertController: upsertControllerType | undefined
  extraFormState: anyObject
  dataModelName: PrismaModelNames
  additional: additionalPropsType
  formData: anyObject
  columns: anyObject
  prismaDataExtractionQuery: prismaDataExtractionQueryType
  toggleLoadFunc?: (props: any) => Promise<requestResultType>
}

export const UpsertMain = async (props: UpsertMainProps): Promise<requestResultType> => {
  const {additional, latestFormData, upsertController, extraFormState, dataModelName, formData, columns} = props

  const args = {latestFormData, extraFormState, dataModelName, additional, formData, columns}
  const toggleLoadFunc = additional?.toggleLoadFunc ?? (async (cb: () => Promise<any>) => await cb())

  const errorResult: requestResultType = {
    success: false,
    message: 'このデータは更新できません',
    result: null,
  }

  // upsertControllerの型チェック
  if (typeof upsertController !== 'object' || !upsertController) {
    return errorResult
  }

  const {executeUpdate, validateUpdate, finalizeUpdate} = upsertController

  try {
    // バリデーション処理
    const validateResultRequest = !validateUpdate
      ? {success: true, message: ''}
      : await validateUpdate({
          latestFormData,
          extraFormState,
          dataModelName,
          additional,
          formData,
          columns,
        })

    if (!validateResultRequest.success) {
      toast.error(validateResultRequest.message)
      return validateResultRequest
    }

    // メイン処理の実行
    const res = await toggleLoadFunc(async () => {
      const createMethod = executeUpdate ?? myFormDefaultUpsert

      // メインの更新処理を実施する
      const updateResult = await createMethod?.(args)

      toastByResult(updateResult)

      // 更新後の処理を実行する
      if (finalizeUpdate) {
        await finalizeUpdate({res: updateResult, formData})
      }

      return updateResult
    })

    return res
  } catch (error: any) {
    console.error('UpsertMain error:', error)
    const errorMessage = error?.message || '予期しないエラーが発生しました'
    toast.error(errorMessage)

    return {
      success: false,
      message: errorMessage,
      result: null,
    }
  }
}
