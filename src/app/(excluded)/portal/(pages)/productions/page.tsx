import React from 'react'
import {getAllProductions, getAllProducts} from './_actions/production-actions'
import ProductionClient from '@app/(excluded)/portal/(pages)/productions/ProductionClient'
import {FitMargin} from '@cm/components/styles/common-components/common-components'

const ProductionsPage = async () => {
  const [productionsResult, productsResult] = await Promise.all([getAllProductions(), getAllProducts()])

  return (
    <FitMargin>
      <ProductionClient initialProductions={productionsResult.data || []} products={productsResult.data || []} />
    </FitMargin>
  )
}

export default ProductionsPage
