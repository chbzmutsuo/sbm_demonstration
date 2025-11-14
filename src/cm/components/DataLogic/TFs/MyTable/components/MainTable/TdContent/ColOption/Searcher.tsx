import {Fields} from 'src/cm/class/Fields/Fields'

import {Button} from 'src/cm/components/styles/common-components/Button'
import useBasicFormProps from 'src/cm/hooks/useBasicForm/useBasicFormProps'
import React from 'react'
import {SearchQuery, searchQueryKey, Sub} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/search-methods'

import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobalOrigin'
import {confirmSearch} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/SearchHandler'
import useWindowSize from '@cm/hooks/useWindowSize'

export default function Searcher({dataModelName, col, useGlobalProps}) {
  const {query, addQuery, toggleLoad} = useGlobalProps as useGlobalPropType
  const {SP} = useWindowSize()
  const columns = Sub.makeSearchColumns({columns: new Fields([col ?? {}]).transposeColumns(), dataModelName, SP})
  const currentSearchedQuerys = SearchQuery.getSearchDefaultObject({dataModelName, query})
  const FormHook = useBasicFormProps({columns, formData: currentSearchedQuerys})
  const {MainColObject, SearchColObject} = Sub.makeMainColsAndSearchCols({columns})

  return (
    <div>
      <FormHook.BasicForm
        latestFormData={FormHook.latestFormData}
        onSubmit={data => {
          confirmSearch({
            toggleLoad,
            allData: data,
            MainColObject,
            SearchColObject,
            dataModelName,
            addQuery,
            searchQueryKey,
            SearchQuery,
          })
        }}
      >
        <Button>検索</Button>
      </FormHook.BasicForm>
    </div>
  )
}
