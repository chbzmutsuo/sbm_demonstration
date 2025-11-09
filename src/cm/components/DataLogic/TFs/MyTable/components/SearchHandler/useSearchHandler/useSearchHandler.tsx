import React, {useMemo, useState} from 'react'
import {colType} from '@cm/types/col-types'
import {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobal'

import {R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {SearchQuery, searchQueryKey, Sub} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/search-methods'

import useBasicFormProps from 'src/cm/hooks/useBasicForm/useBasicFormProps'

import SearchedItemList from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/useSearchHandler/SearchedItemList'

import {Button} from '@cm/components/styles/common-components/Button'
import {Main} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/useSearchHandler/Main'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import useWindowSize from '@cm/hooks/useWindowSize'

type SearchHandler = {
  columns: colType[][]
  dataModelName: string
  useGlobalProps: useGlobalPropType
}
export const useSearchHandler = (props: SearchHandler) => {
  const {dataModelName, useGlobalProps} = props
  const SearchCols = props.columns.flat().filter((col: colType) => col.search)
  const {toggleLoad, query, shallowAddQuery} = useGlobalProps
  const {SP} = useWindowSize()
  const [modalOpen, setmodalOpen] = useState(false)
  const addQuery = shallowAddQuery

  const columns = Sub.makeSearchColumns({columns: props.columns, dataModelName, SP})

  const currentSearchedQuerys = SearchQuery.getSearchDefaultObject({dataModelName, query})

  /**search form 関係 */

  const {MainColObject, SearchColObject} = Sub.makeMainColsAndSearchCols({columns})

  const {
    BasicForm: SearchBasicForm,
    latestFormData,
    ReactHookForm,
    Cached_Option_Props,
  } = useBasicFormProps({
    columns,
    formData: currentSearchedQuerys,
    autoApplyProps: {form: {}},
  })

  /**全ての入力データ */
  const allData = {...latestFormData}

  //confirm
  const ResetBtnMemo = useMemo(() => {
    return (
      <IconBtn
        {...{
          rounded: false,
          color: `red`,
          onClick: () => {
            addQuery({[searchQueryKey]: ``})
            setmodalOpen(false)
          },
        }}
      >
        解除
      </IconBtn>
    )
  }, [query, allData, ReactHookForm])

  /**modal Memo */
  const SearchHandlerMemo = useMemo(() => {
    if (columns.flat().length === 0) {
      return null
    }
    if (SearchCols.length > 0) {
      return (
        <R_Stack className={` flex-nowrap gap-0`}>
          <Button {...{size: `sm`, type: `button`, onClick: e => setmodalOpen(true)}}>検索</Button>
          <Main
            {...{
              SP,
              SearchBasicForm,
              columns,
              ResetBtnMemo,
              modalOpen,
              setmodalOpen,
              toggleLoad,
              addQuery,
              dataModelName,
              MainColObject,
              SearchColObject,
            }}
          />
        </R_Stack>
      )
    }
  }, [SearchCols, modalOpen, query, ReactHookForm, columns])

  const SearchingStatusMemo = useMemo(() => {
    if (query[searchQueryKey]) {
      return (
        <div>
          <R_Stack className={`text-gray-main gap-2  `}>
            <SearchedItemList
              {...{
                SearchQuery,
                searchQueryKey,
                Cached_Option_Props,
                columns,
                dataModelName,
                ResetBtnMemo,
                query,
                addQuery,
              }}
            />
            {ResetBtnMemo}
          </R_Stack>
        </div>
      )
    }
  }, [query, ResetBtnMemo])

  return {
    SearchBasicForm,
    SearchCols,
    SearchHandlerMemo,
    SearchingStatusMemo,
  }
}

export const confirmSeach = ({
  allData,
  MainColObject,
  SearchColObject,
  dataModelName,
  addQuery,
  searchQueryKey,
  SearchQuery,
  toggleLoad,
}) => {
  const searchQueryResult = SearchQuery.createQueryStr({allData, MainColObject, SearchColObject})

  const newQuery = {
    [searchQueryKey]: `${dataModelName.toUpperCase()}${searchQueryResult}`,
  }

  toggleLoad(async () => {
    addQuery(newQuery)
  })
}
