import React from 'react'
import {getAllOrders, getAllProducts} from './_actions/order-actions'
import OrderClient from '@app/(excluded)/portal/(pages)/orders/OrderClient'
import {FitMargin} from '@cm/components/styles/common-components/common-components'

const OrdersPage = async () => {
  const [ordersResult, productsResult] = await Promise.all([getAllOrders(), getAllProducts()])

  return (
    <FitMargin>
      <OrderClient initialOrders={ordersResult.data || []} products={productsResult.data || []} />
    </FitMargin>
  )
}

export default OrdersPage
