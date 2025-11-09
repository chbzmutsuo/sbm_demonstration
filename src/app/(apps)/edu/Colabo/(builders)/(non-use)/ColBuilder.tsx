// 'use client'

// import {formatDate} from '@cm/class/Days/date-utils/formatters'
// import {Fields} from '@cm/class/Fields/Fields'
// import {addQuerySentence} from '@cm/lib/methods/urls'
// import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
// import {Button} from '@cm/components/styles/common-components/Button'

// export class ColBuilder {
//   static slide = (props: columnGetterType) => {
//     const {useGlobalProps} = props
//     const {session, query, router, rootPath, addQuery} = useGlobalProps

//     const data: colType[] = [
//       {
//         id: 'title',
//         label: 'スライドタイトル',
//         form: {register: {required: '必須です'}},
//         search: {},
//       },
//       {
//         id: 'templateType',
//         label: 'テンプレート',
//         forSelect: {
//           optionsOrOptionFetcher: [
//             {value: 'normal', label: 'ノーマル'},
//             {value: 'psychology', label: '心理アンケート'},
//             {value: 'choice_quiz', label: '選択クイズ'},
//             {value: 'free_text_quiz', label: '自由記述クイズ'},
//             {value: 'summary_survey', label: 'まとめアンケート'},
//           ]
//         },
//         form: {register: {required: '必須です'}},
//         search: {},
//       },
//       {
//         id: 'isActive',
//         label: '現在表示中',
//         type: 'boolean',
//         format: (value) => (
//           <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
//             {value ? '表示中' : '非表示'}
//           </span>
//         ),
//       },
//       {
//         id: 'sortOrder',
//         label: '順序',
//         type: 'number',
//         form: {},
//         td: {style: {width: 80}},
//       },
//       {
//         id: 'actions',
//         label: '操作',
//         format: (value, row) => (
//           <div className="flex gap-2">
//             <Button
//               size="sm"
//               onClick={() => router.push(`${rootPath}/slide/edit/${row.id}`)}
//             >
//               編集
//             </Button>
//             <Button
//               size="sm"
//               variant="outline"
//               onClick={async () => {
//                 await doStandardPrisma('slide', 'update', {
//                   where: {id: row.id},
//                   data: {isActive: !row.isActive}
//                 })
//                 router.refresh()
//               }}
//             >
//               {row.isActive ? '非表示' : '表示'}
//             </Button>
//           </div>
//         ),
//         td: {style: {width: 150}},
//       }
//     ]

//     return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
//   }

//   static slideBlock = (props: columnGetterType) => {
//     const data: colType[] = [
//       {
//         id: 'blockType',
//         label: 'ブロック種別',
//         forSelect: {
//           optionsOrOptionFetcher: [
//             {value: 'text', label: 'テキスト'},
//             {value: 'image', label: '画像'},
//             {value: 'link', label: 'リンク'},
//             {value: 'quiz_question', label: 'クイズ問題'},
//             {value: 'choice_option', label: '選択肢'},
//           ]
//         },
//         form: {register: {required: '必須です'}},
//       },
//       {
//         id: 'content',
//         label: 'コンテンツ',
//         type: 'textarea',
//         form: {style: {minWidth: 300}},
//       },
//       {
//         id: 'imageUrl',
//         label: '画像URL',
//         type: 'url',
//         form: {},
//       },
//       {
//         id: 'linkUrl',
//         label: 'リンクURL',
//         type: 'url',
//         form: {},
//       },
//       {
//         id: 'alignment',
//         label: '配置',
//         forSelect: {
//           optionsOrOptionFetcher: [
//             {value: 'left', label: '左寄せ'},
//             {value: 'center', label: '中央'},
//             {value: 'right', label: '右寄せ'},
//           ]
//         },
//         form: {},
//       },
//       {
//         id: 'textColor',
//         label: 'テキスト色',
//         type: 'color',
//         form: {},
//       },
//       {
//         id: 'backgroundColor',
//         label: '背景色',
//         type: 'color',
//         form: {},
//       },
//       {
//         id: 'fontWeight',
//         label: '太字',
//         forSelect: {
//           optionsOrOptionFetcher: [
//             {value: 'normal', label: '通常'},
//             {value: 'bold', label: '太字'},
//           ]
//         },
//         form: {},
//       },
//       {
//         id: 'isCorrectAnswer',
//         label: '正解',
//         type: 'boolean',
//         form: {},
//       },
//       {
//         id: 'sortOrder',
//         label: '順序',
//         type: 'number',
//         form: {},
//         td: {style: {width: 80}},
//       }
//     ]

//     return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
//   }

//   static slideResponse = (props: columnGetterType) => {
//     const data: colType[] = [
//       {
//         id: 'studentName',
//         label: '生徒名',
//         format: (value, row) => row.Student?.name || '',
//         search: {},
//       },
//       {
//         id: 'responseType',
//         label: '回答種別',
//         forSelect: {
//           optionsOrOptionFetcher: [
//             {value: 'choice', label: '選択'},
//             {value: 'text', label: 'テキスト'},
//             {value: 'psychology', label: '心理アンケート'},
//           ]
//         },
//         search: {},
//       },
//       {
//         id: 'choiceAnswer',
//         label: '選択回答',
//         format: (value) => value || '',
//       },
//       {
//         id: 'textAnswer',
//         label: 'テキスト回答',
//         format: (value) => value || '',
//       },
//       {
//         id: 'isCorrect',
//         label: '正解',
//         type: 'boolean',
//         format: (value) => value === null ? '' : (value ? '○' : '×'),
//       },
//       {
//         id: 'createdAt',
//         label: '回答日時',
//         format: (value) => formatDate(value, 'datetime'),
//       }
//     ]

//     return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
//   }

//   // Reuse game builder from Grouping with slide-specific additions
//   static game = (props: columnGetterType) => {
//     const {useGlobalProps} = props
//     const {session, accessScopes, status, query, asPath, router, pathname, rootPath, addQuery} = useGlobalProps
//     const scopes = accessScopes()
//     const {schoolId, teacherId} = scopes.getGroupieScopes()

//     const data: colType[] = [
//       {
//         id: 'date',
//         label: '日時',
//         type: 'date',
//         form: {register: {required: '必須です'}, defaultValue: formatDate(new Date(), 'iso')},
//       },
//       {
//         id: 'name',
//         label: '授業名',
//         form: {register: {required: '必須です'}},
//       },
//       {
//         id: 'subjectNameMasterId',
//         label: '教科',
//         form: {register: {required: '必須です'}},
//         forSelect: {
//           config: {
//             modelName: `subjectNameMaster`,
//             where: {schoolId: schoolId},
//           },
//         },
//       },
//       {
//         id: 'learningContent',
//         label: '学習内容',
//         type: `textarea`,
//         form: {style: {minWidth: 400}, register: {required: '必須です'}},
//       },
//       {
//         id: 'task',
//         label: '学習課題',
//         type: `textarea`,
//         form: {style: {minWidth: 400}, register: {required: '必須です'}},
//       },
//       {
//         id: 'teacherId',
//         label: '担当者',
//         form: {
//           defaultValue: teacherId,
//           register: {required: '必須です'},
//           disabled: true,
//         },
//         forSelect: {
//           config: {
//             modelName: `teacher`,
//             where: {
//               id: session?.id,
//               schoolId: schoolId,
//             },
//           },
//         },
//       },
//       {
//         id: 'slideCount',
//         label: 'スライド数',
//         format: (value, row) => `${row.Slide?.length || 0}`,
//         affix: {label: '枚'},
//       },
//       {
//         id: 'secretKey',
//         label: '授業開始',
//         td: {style: {width: 120}},
//         format: (value: any, row: any) => {
//           const newPath = `/${rootPath}/presentation/${row.secretKey}` + addQuerySentence({as: 'teacher'}, query)

//           return (
//             <div className="flex flex-col gap-1">
//               <Button
//                 size="sm"
//                 onClick={() => router.push(`${rootPath}/slide-editor/${row.id}`)}
//               >
//                 スライド編集
//               </Button>
//               <Button
//                 size="sm"
//                 variant="outline"
//                 onClick={() => router.push(newPath)}
//               >
//                 授業開始
//               </Button>
//             </div>
//           )
//         },
//       },
//     ]

//     return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
//   }
// }
