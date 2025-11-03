import {DH__convertDataType} from '@cm/class/DataHandler/type-converter'
import {requestResultType} from '@cm/types/types'
import {updateWithImageAndAddUrlToLatestFormData} from '@cm/lib/file/image-handler'
import {myFormDefaultUpsertPropType} from '@cm/lib/formMethods/separateFormData'
import {updateSimply} from '@cm/lib/formMethods/updateSimply'

export const myFormDefaultUpsert: (props: myFormDefaultUpsertPropType) => Promise<requestResultType> = async (
  props: myFormDefaultUpsertPropType
) => {
  const {latestFormData, extraFormState, dataModelName, additional, formData, columns} = props

  const latestFormDataWithImageUrl = await updateWithImageAndAddUrlToLatestFormData({
    latestFormData,
    extraFormState,
    columns,
  })

  Object.keys(latestFormDataWithImageUrl).forEach(key => {
    const value = latestFormDataWithImageUrl[key]
    const col = columns.flat().find(col => col.id === key)

    if (col) {
      latestFormDataWithImageUrl[key] = DH__convertDataType(value, col.type, 'server')
    }
  })

  const res: requestResultType = await updateSimply({
    columns,
    latestFormData: latestFormDataWithImageUrl,
    dataModelName,
    additionalPayload: additional?.payload,
    additionalInclude: {...additional?.include},
    initialModelData: formData,
    extraFormState,
  })

  return res
}
