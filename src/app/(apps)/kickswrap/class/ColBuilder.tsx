'use client'

import {Fields} from '@cm/class/Fields/Fields'
import {colType} from '@cm/types/col-types'
import {columnGetterType} from '@cm/types/types'

export class ColBuilder {
  static user = (props: columnGetterType) => {
    const {ColBuilderExtraProps} = props

    const col1: colType[] = [
      {
        id: 'name',
        label: '氏名',
        form: {
          register: {required: '必須です'},
        },
        sort: {},
        search: {},
      },
      {
        id: 'email',
        label: 'メールアドレス',
        form: {
          register: {required: '必須です'},
        },
        sort: {},
        search: {},
        type: 'email',
      },
      {
        id: 'password',
        label: 'パスワード',
        type: 'password',
        form: {register: {required: '必須です'}},
        td: {hidden: true},
      },

      {
        id: 'type',
        label: '権限',
        // forSelect: {},
        form: {
          register: {required: '必須です'},
        },
        sort: {},
        search: {},
      },
    ]

    const data: colType[] = [...col1]
    return Fields.transposeColumns(data, {
      ...props.transposeColumnsOptions,
    })
  }
}
