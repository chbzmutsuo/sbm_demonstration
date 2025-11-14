'use client'

import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'
export class ColBuilder {
  static user = (props: columnGetterType) => {
    return new Fields([
      {id: 'name', label: '名称', form: {...defaultRegister}},
      {id: 'email', label: 'Email', form: {...defaultRegister}},
      {id: 'password', label: 'パスワード', type: `password`, form: {...defaultRegister}},
    ]).transposeColumns()
  }
}
