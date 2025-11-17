import React from 'react'
import {getAllShipments, getAllProducts} from './_actions/shipment-actions'
import ShipmentClient from '@app/(excluded)/portal/(pages)/shipments/ShipmentClient'
import {FitMargin} from '@cm/components/styles/common-components/common-components'

const ShipmentsPage = async () => {
  const [shipmentsResult, productsResult] = await Promise.all([getAllShipments(), getAllProducts()])

  return (
    <FitMargin>
      <ShipmentClient initialShipments={shipmentsResult.data || []} products={productsResult.data || []} />
    </FitMargin>
  )
}

export default ShipmentsPage
