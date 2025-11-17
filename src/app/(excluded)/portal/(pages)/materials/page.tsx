import React from 'react'
import {getAllRawMaterials, calculateCurrentStock} from './_actions/material-actions'
import MaterialClient from './MaterialClient'
import {FitMargin} from '@cm/components/styles/common-components/common-components'

const MaterialsPage = async () => {
  const {data: materials} = await getAllRawMaterials()

  // サーバーサイドで在庫計算を行う
  const materialsWithStock = await Promise.all(
    (materials || []).map(async material => {
      const {currentStock} = await calculateCurrentStock(material.id)
      return {
        ...material,
        currentStock,
        isAlert: currentStock < material.safetyStock,
      }
    })
  )

  return (
    <FitMargin>
      <MaterialClient initialMaterials={materialsWithStock} />
    </FitMargin>
  )
}

export default MaterialsPage
