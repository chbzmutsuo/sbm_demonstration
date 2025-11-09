'use client'
import {Fields} from '@cm/class/Fields/Fields'

import ContentPlayer from '@cm/components/utils/ContentPlayer'

import {v4 as uuidv4} from 'uuid'
import Image from 'next/image'

import { columnGetterType} from '@cm/types/types'
import { colType } from '@cm/types/col-types'

import {T_LINK} from '@cm/components/styles/common-components/links'

export class ColBuilder {
  static KaizenCMS = (props: columnGetterType) => {
    const textAreaProps: any = {
      type: 'slate',
      td: {style: {maxWidth: 400, maxHeight: 100}},
      form: {style: {width: 600, maxWidth: 600, maxHeight: 300}},
    }

    const col1: colType[] = [
      {id: 'contactPageMsg', label: 'お問い合わせページのメッセージ', ...textAreaProps},
      {id: 'principlePageMsg', label: '改善思想', ...textAreaProps},
    ]

    let data: colType[] = Fields.mod.addColIndexs([col1])
    data = Fields.mod.setAttribute({
      cols: data,
      attributeSetter: ({col}) => {
        const shownTds = ['contactPageMsg']
        const td = shownTds.includes(col.id) ? {} : {hidden: true}
        return {
          ...col,
          td: {...col.td, ...td},
          form: {...col.form, style: col.form?.style ?? {width: 300}},
          search: {},
        }
      },
    })

    return Fields.transposeColumns(data, {
      ...props.transposeColumnsOptions,
    })
  }
  static kaizenClient = (props: columnGetterType) => {
    const col1: colType[] = [
      ...Fields.mod.setAttribute({
        cols: [
          {id: `public`, label: '公開', type: 'boolean'},
          ...Fields.mod.aggregateOnSingleTd({
            mainTd: {id: `name`},
            cols: [
              {
                id: 'name',
                label: 'クライアント名',
                td: {
                  getRowColor: (value, row) => {
                    return row.public
                  },
                },
              },
              {id: 'organization', label: '組織'},
            ],
          }),
          {id: `iconUrl`, label: 'ロゴ', type: 'file', form: {file: {backetKey: 'kaizenClientIconUrl'}}},
          {id: `bannerUrl`, label: 'バナー', type: 'file', form: {file: {backetKey: 'kaizenClientIannerUrl'}}},
          {id: `website`, label: 'ウェブサイト', type: 'url'},
          {id: `note`, label: '備考', type: 'slate'},
          {id: `introductionRequestedAt`, label: '紹介依頼', type: 'date'},
        ],
        attributeSetter: ({col}) => ({
          ...col,
          form: {...col.form},
          search: {},
          sort: {},
          td: {...col.td},
        }),
      }),
    ]

    const data: colType[] = [...col1]
    return Fields.transposeColumns(data, {
      ...props.transposeColumnsOptions,
    })
  }

  static kaizenWork = (props: columnGetterType) => {
    const textAreaProps: any = {
      type: 'slate',
      td: {style: {maxWidth: 400, maxHeight: 100}},
      form: {style: {width: 600, maxWidth: 600, maxHeight: 300}},
    }
    const {ColBuilderExtraProps} = props

    const col1: colType[] = [
      {id: 'isPublic', label: '公開中', type: 'boolean'},
      {id: 'allowShowClient', label: '名称表示', type: 'boolean'},
      {
        id: 'clientIcon',
        label: 'アイコン',
        type: 'date',
        format: (value, row) => {
          const iconUrl = row?.KaizenClient?.iconUrl
          return iconUrl ? <Image src={iconUrl} {...{width: 40, height: 40, alt: ''}} /> : null
        },
      },

      {id: 'date', label: '日付', type: 'date'},
      {
        id: 'kaizenClientId',
        label: 'クライアント',
        forSelect: {
          config: {
            select: {
              id: `number`,
              name: `text`,
              organization: `text`,
            },
            nameChanger: op => {
              let name = ''
              if (op?.name) name = op.name
              if (op?.organization) name = name + `(${op.organization})`

              return {...op, name}
            },
          },
        },
      },

      ...Fields.mod.aggregateOnSingleTd({
        mainTd: {id: 'title'},
        cols: [
          {id: 'title', label: 'タイトル'},
          {id: 'subtitle', label: 'サブタイトル'},
        ],
      }),

      ...Fields.mod.aggregateOnSingleTd({
        mainTd: {id: 'jobCategory'},
        cols: [
          {id: 'jobCategory', label: 'jobCategory'},
          {id: 'systemCategory', label: 'systemCategory'},
          {id: 'collaborationTool', label: 'collaborationTool'},
        ],
      }),

      ...Fields.mod.aggregateOnSingleTd({
        mainTd: {id: 'dealPoint'},
        cols: [
          {id: 'dealPoint', label: '取引ポイント', type: 'float'},
          {id: 'toolPoint', label: 'ツールポイント', type: 'float'},
        ],
      }),
      {
        id: 'uuid',
        label: 'UUID',
        type: 'text',
        format: (value, row) => {
          return <T_LINK href={`/KM/top/works/confirmation/${row?.uuid}`}>{row.uuid}</T_LINK>
        },

        form: {defaultValue: uuidv4()},
      },
    ]
    const col2: colType[] = [
      {id: 'description', label: '説明', ...textAreaProps},
      {id: 'points', label: 'ポイント', ...textAreaProps},
      {id: 'impression', label: '感想', ...textAreaProps},
      {id: 'reply', label: '返信', ...textAreaProps},
      {
        id: 'KaizenWorkImage',
        label: '画像',
        format: (value, row) => {
          const imageArr = row.KaizenWorkImage
          return (
            <div style={{display: 'flex', flexWrap: 'wrap'}}>
              {imageArr?.map((image, i) => {
                return (
                  <div key={i} style={{margin: 5}}>
                    <ContentPlayer src={image.url} type={image.type} width={200} height={200} />
                  </div>
                )
              })}
            </div>
          )
        },
        form: {hidden: true},
      },
    ]

    let data: colType[] = Fields.mod.addColIndexs([col1, col2])
    data = Fields.mod.setAttribute({
      cols: data,
      attributeSetter: ({col}) => {
        const shownTds = [
          'isPublic',
          'allowShowClient',
          'clientIcon',
          'uuid',
          'date',
          'kaizenClientId',
          'title',
          'jobCategory',
          'description',
          'points',
          'impression',
          'reply',

          'KaizenWorkImage',
        ]

        const td = {...col.td, hidden: shownTds.includes(col.id) ? false : true}

        const hiddenInForm = ['clientIcon', 'KaizenWorkImage']
        const form = hiddenInForm.includes(col.id)
          ? {...col.td, hidden: true}
          : {...col.form, style: col.form?.style ?? {width: 300}}

        return {
          ...col,
          td,
          form,
          search: {},
          sort: {},
        }
      },
    })

    return Fields.transposeColumns(data, {
      ...props.transposeColumnsOptions,
    })
  }

  static kaizenWorkImage = (props: columnGetterType) => {
    const col1: colType[] = [
      ...Fields.mod.setAttribute({
        cols: [
          {
            id: 'url',
            label: '画像',
            type: 'file',
            form: {
              file: {
                backetKey: 'kaizenWorkImage',
              },
            },
          },
        ],
        attributeSetter: ({col}) => ({
          ...col,
          form: {...col.form},
          search: {},
        }),
      }),
    ]

    const data: colType[] = [...col1]
    return Fields.transposeColumns(data, {
      ...props.transposeColumnsOptions,
    })
  }
}
