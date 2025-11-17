'use client'

import {PART_OPTIONS} from '@app/(excluded)/training/(constants)/PART_OPTIONS'
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
  static workoutLog = (props: columnGetterType) => {
    return new Fields([
      {id: 'date', label: '日付', type: 'date', form: {...defaultRegister}},
      {id: 'strength', label: '強度', type: 'number', form: {...defaultRegister}},
      {id: 'reps', label: '回数', type: 'number', form: {...defaultRegister}},
      {id: 'exerciseId', label: '種目ID', type: 'number', form: {...defaultRegister}},
      {
        id: 'userId',
        label: 'ユーザーID',
        forSelect: {},
        form: {...defaultRegister},
      },
    ]).transposeColumns()
  }

  static exerciseMaster = (props: columnGetterType) => {
    return new Fields([
      {
        id: 'part',
        label: '部位',
        forSelect: {
          optionsOrOptionFetcher: PART_OPTIONS.map(item => {
            return {
              value: item.label,
              label: item.label,
              color: item.color,
            }
          }),
        },
        form: {...defaultRegister},
      },
      {id: 'name', label: '名称', form: {...defaultRegister}},
      {id: 'unit', label: '単位', form: {...defaultRegister, defaultValue: 'kg'}},
      // {id: 'color', label: '色', type: 'color', form: {}},
    ]).transposeColumns()
  }
}
