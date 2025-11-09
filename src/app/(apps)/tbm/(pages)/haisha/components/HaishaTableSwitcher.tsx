import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import React from 'react'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export default function HaishaTableSwitcher() {
  const {query, addQuery, shallowAddQuery, session} = useGlobal()
  const scopes = getScopes(session, {query})
  const {tbmBaseId} = scopes.getTbmScopes()
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: new Fields([
      //
      {
        id: `mode`,
        label: `モード`,
        forSelect: {
          optionsOrOptionFetcher: [
            {name: 'ドライバ', label: 'ドライバ', value: 'DRIVER'},
            {name: '便', label: '便', value: 'ROUTE'},
          ],
        },
      },
      {
        id: `sortBy`,
        label: `並び順`,
        forSelect: {
          optionsOrOptionFetcher: [
            {name: '出発時間順', label: '出発時間順', value: 'departureTime'},
            {name: '便コード順', label: '便コード順', value: 'routeCode'},
            {name: '荷主コード順', label: '荷主コード順', value: 'customerCode'},
          ],
        },
      },
      {
        id: `tbmCustomerId`,
        label: `荷主`,
        forSelect: {
          config: {
            modelName: 'tbmCustomer',
            where: {},
            orderBy: [{code: 'asc'}, {name: 'asc'}],
          },
        },
      },
    ]).transposeColumns(),

    formData: {
      mode: query.mode ?? 'DRIVER',
      sortBy: query.sortBy ?? 'departureTime',
      tbmCustomerId: query.tbmCustomerId ? parseInt(query.tbmCustomerId) : undefined,
    },
  })

  return (
    <>
      <R_Stack>
        <BasicForm
          {...{
            onSubmit: data => {
              shallowAddQuery(data)
            },
            alignMode: 'row',
            latestFormData,
          }}
        >
          <Button color={`blue`}>切り替え</Button>
        </BasicForm>
      </R_Stack>
    </>
  )
}
