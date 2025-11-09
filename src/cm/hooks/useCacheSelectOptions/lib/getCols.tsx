'use client'

import {colType} from '@cm/types/col-types'
import {generateUnivesalApiParamsForSelect} from 'src/cm/hooks/useCacheSelectOptions/lib/generateUnivesalApiParamsForSelect'

export const getCols = (props: {columns; latestFormData}) => {
  const {columns, latestFormData} = props

  const optionRelatedCols = columns.flat().filter(col => col.forSelect)
  const givenArrayCols: colType[] = []

  const manualOptionsDeps: string[] = []
  const manualFetcheTargetCols: colType[] = []
  const SWR_REQUEST_PARAM_OBJ = {}

  optionRelatedCols.forEach(async (col: colType, idx: number) => {
    if (!col.forSelect) return

    col.forSelect?.dependenceColIds?.forEach(dep => {
      manualOptionsDeps.push(dep)
    })

    const fromGivenArray = Array.isArray(col.forSelect.optionsOrOptionFetcher)

    /**fromArray */
    if (fromGivenArray) {
      givenArrayCols.push(col)
      return
    }

    const manualFetch = col.forSelect.optionsOrOptionFetcher
    /**mannually */
    if (manualFetch) {
      manualFetcheTargetCols.push(col)
      return
    }

    /**selectively */

    const doStandardPrismaPasrams = generateUnivesalApiParamsForSelect({col, latestFormData})

    SWR_REQUEST_PARAM_OBJ[col.id] = doStandardPrismaPasrams
  })

  const SWR_REQUEST_PARAMS = Object.values(SWR_REQUEST_PARAM_OBJ)

  const dependentValues = Object.fromEntries(
    Object.keys(latestFormData)
      .filter(key => manualOptionsDeps.includes(key))
      .map(key => [key, latestFormData[key]])
  )
  const CacheKeys = {
    Fetch_OP: JSON.stringify({SWR_REQUEST_PARAMS, dependentValues}),
    Mannual_OP: JSON.stringify({manualFetcheTargetCols, dependentValues}),
  }

  return {
    givenArrayCols,
    SWR_REQUEST_PARAMS,
    manualFetcheTargetCols,
    dependentValues,
    CacheKeys,
  }
}
