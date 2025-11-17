import React from 'react'
import {getAllProducts, getAllRawMaterials} from './_actions/product-actions'
import ProductClient from '@app/(excluded)/portal/(pages)/products/ProductClient'
import {FitMargin} from '@cm/components/styles/common-components/common-components'

const ProductsPage = async () => {
  const [productsResult, materialsResult] = await Promise.all([getAllProducts(), getAllRawMaterials()])

  return (
    <FitMargin>
      <ProductClient initialProducts={productsResult.data || []} rawMaterials={materialsResult.data || []} />
    </FitMargin>
  )
}

export default ProductsPage
