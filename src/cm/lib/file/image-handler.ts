import {FileHandler} from 'src/cm/class/FileHandler'
import {FileData} from '@cm/types/file-types'
import {requestResultType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'

export const updateWithImageAndAddUrlToLatestFormData = async ({latestFormData, extraFormState, columns}) => {
  if (extraFormState?.files) {
    /**画像アップロードが必要な場合はそれを実行 */
    const {updatedFileObject} = await (async () => {
      const updatedFileObject: {
        [key: string]: requestResultType[]
      } = {}
      await Promise.all(
        Object.keys(extraFormState?.files ?? {}).map(async fileKey => {
          const fileArr: FileData[] = extraFormState?.files?.[fileKey]
          const col: colType = columns.flat().find(col => col.id === fileKey)

          const updatedFileResponsesForKey: requestResultType[] = await Promise.all(
            fileArr.map(async fileState => {
              const theFile = fileState.file
              const backetKey = col?.form?.file?.backetKey
              const updatedFileRes = await FileHandler.sendFileToS3({
                file: theFile,
                formDataObj: {
                  bucketKey: `${backetKey}/${fileKey}`,
                  deleteImageUrl: latestFormData?.[fileKey],
                },
              })

              return updatedFileRes
            })
          )

          //**完了データを別オブジェクトに保存 */
          updatedFileObject[fileKey] = updatedFileResponsesForKey
          return updatedFileResponsesForKey
        })
      )
      return {updatedFileObject}
    })()

    Object.keys(updatedFileObject).forEach(fileKey => {
      const updatedFileResponsesForKey = updatedFileObject[fileKey]
      const updatedFileUrls = updatedFileResponsesForKey.map(res => {
        return res?.result?.url
      })
      latestFormData[fileKey] = updatedFileUrls[0]
    })

    return latestFormData
  }
  return latestFormData
}
