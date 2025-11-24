import React, {useMemo} from 'react'
import {colType} from '@cm/types/col-types'
import {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobal'

import {R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {SearchQuery, searchQueryKey, Sub} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/search-methods'

import useBasicFormProps from 'src/cm/hooks/useBasicForm/useBasicFormProps'

import SearchedItemList from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/useSearchHandler/SearchedItemList'
import BasicModal from 'src/cm/components/utils/modal/BasicModal'

import {myFormDefault} from 'src/cm/constants/defaults'
import {cl} from 'src/cm/lib/methods/common'

import {confirmSearch} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/SearchHandler'
import {Padding} from '@cm/components/styles/common-components/common-components'

import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import useWindowSize from '@cm/hooks/useWindowSize'
import {useJotaiByKey} from '@cm/hooks/useJotai'
import {Button} from '@cm/components/styles/common-components/Button'

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

  const [modalOpen, setmodalOpen] = useJotaiByKey<boolean>(`searchHandlerModalOpen`, false)

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
  }, [query, allData, ReactHookForm, modalOpen])

  /**modal Memo */
  const SearchModalMemo = useMemo(() => {
    if (columns.flat().length === 0) {
      return null
    }
    if (SearchCols.length > 0) {
      return (
        <R_Stack className={` flex-nowrap gap-0`}>
          {/* <Button {...{size: `sm`, type: `button`, onClick: e => setmodalOpen(true)}}>検索</Button> */}
          <BasicModal open={modalOpen} setopen={setmodalOpen} alertOnClose={true}>
            <Padding>
              <main
                className={`relative  `}
                style={{
                  ...myFormDefault?.style,
                  maxWidth: 900,
                  padding: 0,
                  maxHeight: '70vh',
                }}
              >
                <div>
                  <SearchBasicForm
                    latestFormData={latestFormData}
                    {...{
                      alignMode: `console`,
                      className: `max-h-[60vh]  overflow-auto relative p-2`,
                      onSubmit: data => {
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
                        setmodalOpen(false)
                      },

                      wrapperClass: cl('col-stack gap-3'),

                      ControlOptions: {
                        controlWrapperClassBuilder: ({col}) => {
                          const searchTypeCol = SearchColObject[col.id]
                          let className = ``
                          if (SP && searchTypeCol) {
                            className = cl(className, `mb-8`)
                          }
                          return className
                        },
                      },
                    }}
                  >
                    <div className={`row-stack sticky bottom-0 z-50  my-0! w-full justify-end  gap-4    p-3  `}>
                      {ResetBtnMemo}
                      <Button color={`primary`}>確定</Button>
                    </div>
                  </SearchBasicForm>
                </div>
              </main>
            </Padding>
          </BasicModal>
        </R_Stack>
      )
    }
  }, [SearchCols, modalOpen, query, ReactHookForm, columns])

  const SearchedItemListMemo = useMemo(() => {
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
  }, [query, ResetBtnMemo, modalOpen])

  return {SearchedItemListMemo, SearchModalMemo}
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
