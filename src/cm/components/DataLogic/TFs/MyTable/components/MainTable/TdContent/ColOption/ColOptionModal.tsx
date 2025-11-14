import {Fields} from 'src/cm/class/Fields/Fields'
import {SearchQuery, searchQueryKey, Sub} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/search-methods'
import {confirmSearch} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/SearchHandler'
import {Button} from 'src/cm/components/styles/common-components/Button'
import BasicModal from 'src/cm/components/utils/modal/BasicModal'
import useBasicFormProps from 'src/cm/hooks/useBasicForm/useBasicFormProps'
import useGlobal from 'src/cm/hooks/globalHooks/useGlobal'

import React from 'react'
import {atomTypes, useJotaiByKey} from '@cm/hooks/useJotai'
import useWindowSize from '@cm/hooks/useWindowSize'

export default function ColOptionModal() {
  const [colConfigModal, setcolConfigModal] = useJotaiByKey<atomTypes[`colConfigModal`]>(`colConfigModal`, null)
  const {col, dataModelName} = colConfigModal ?? {}
  const {query, addQuery} = useGlobal()

  return (
    <BasicModal
      {...{
        alertOnClose: false,
        open: !!colConfigModal,
        setopen: setcolConfigModal,
      }}
    >
      <div>{col?.search && <SearchForm {...{dataModelName, col, query, addQuery}} />}</div>
    </BasicModal>
  )
}

const SearchForm = ({dataModelName, col, query, addQuery}) => {
  const {toggleLoad} = useGlobal()
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
