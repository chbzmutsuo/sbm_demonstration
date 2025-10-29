'use client'

import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'
import {DetailPagePropType} from '@cm/types/types'

import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {createUpdate} from '@cm/lib/methods/createUpdate'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {toastByResult} from '@cm/lib/ui/notifications'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'
import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import BulkCalendarSetter from '@app/(apps)/tbm/(pages)/eigyoshoSettei/components/BulkCalendarSetter'
import {RouteGroupCl} from '@app/(apps)/tbm/(class)/RouteGroupCl'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {useState} from 'react'

export default function TbmRouteGroupDetail(props: DetailPagePropType) {
  const {useGlobalProps} = props
  const {query, session} = useGlobalProps
  const [shareBaseIds, setShareBaseIds] = useState<number[]>(
    props.formData?.TbmRouteGroupShare?.map(share => share.tbmBaseId) || []
  )

  const handleSaveShare = async () => {
    await doStandardPrisma('tbmRouteGroupShare', 'deleteMany', {where: {tbmRouteGroupId}})

    const res = await doTransaction({
      transactionQueryList: [
        // 既存の共有設定を削除

        // 新しい共有設定を追加
        ...shareBaseIds.map(tbmBaseId => ({
          model: 'tbmRouteGroupShare',
          method: 'create',
          queryObject: {
            data: {
              tbmRouteGroupId,
              tbmBaseId,
              isActive: true,
            },
          },
        })),

        // 便の共有状態フラグを更新
        {
          model: 'tbmRouteGroup',
          method: 'update',
          queryObject: {
            where: {id: tbmRouteGroupId},
            data: {isShared: shareBaseIds.length > 0},
          },
        },
      ],
    })
  }
  const {tbmBaseId: currentBaseId} = session.scopes.getTbmScopes()

  const {data: calendar = []} = useDoStandardPrisma(`tbmRouteGroupCalendar`, `findMany`, {
    where: {tbmRouteGroupId: props.formData?.id},
    orderBy: {date: 'asc'},
  })

  // 営業所データを取得
  const {data: allBases = []} = useDoStandardPrisma('tbmBase', 'findMany', {
    select: {id: true, name: true, code: true},
    orderBy: {name: 'asc'},
  })

  const theMonth = toUtc(query.from || query.month || new Date())
  const theYear = theMonth.getFullYear()

  const {firstDateOfYear, lastDateOfYear, getAllMonthsInYear} = Days.year.getYearDatum(theYear)
  const months = getAllMonthsInYear()

  const days = Days.day.getDaysBetweenDates(firstDateOfYear, lastDateOfYear)

  const defaultSelectedDays = calendar.filter(c => c.holidayType === '稼働').map(c => c.date)
  const tbmRouteGroupId = props.formData?.id
  const routeGroupCl = new RouteGroupCl(props.formData as any)

  // 共有状態管理のコンポーネント
  const ShareManagement = () => {
    const baseOptions = allBases
      .filter(base => base.id !== currentBaseId)
      .map(base => ({
        value: base.id,
        label: `${base.code || ''} ${base.name}`,
      }))

    return (
      <div className="p-4">
        {/* <h3 className="text-lg font-medium mb-4">便の共有設定</h3> */}

        {routeGroupCl.isShared && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-md">
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-yellow-400"></div>
              <span className="text-sm font-medium text-yellow-800">
                この便は {routeGroupCl.shareCount} 営業所と共有されています
              </span>
            </div>
            {routeGroupCl.sharedBases.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                共有先: {routeGroupCl.sharedBases.map(base => base?.name ?? '').join(', ')}
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">共有先営業所を選択</label>
            <R_Stack className="gap-8">
              {baseOptions.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={shareBaseIds.includes(option.value) || routeGroupCl.isOwner(option.value)}
                    onChange={e => {
                      if (e.target.checked) {
                        setShareBaseIds([...shareBaseIds, option.value])
                      } else {
                        setShareBaseIds(shareBaseIds.filter(id => id !== option.value))
                      }
                    }}
                    className="mr-2"
                  />
                  {option.label}
                </label>
              ))}
            </R_Stack>
          </div>
        </div>
      </div>
    )
  }

  let TabComponentArray = [
    {
      label: `基本情報`,
      component: (
        <div>
          <ShareManagement />
          <MyForm
            {...{
              ...props,
              myForm: {
                ...props.myForm,
                create: {
                  ...(props?.myForm?.create as any),
                  finalizeUpdate: async () => {
                    await handleSaveShare()
                  },
                },
              },
            }}
          ></MyForm>
        </div>
      ),
    },
  ]

  if (props.formData?.id) {
    TabComponentArray = [
      ...TabComponentArray,
      // 共有管理タブ（所有者のみ表示）

      {
        label: `付帯作業/運賃`,
        component: (
          <ChildCreator
            {...{
              ParentData: props.formData,
              models: {parent: `tbmRouteGroup`, children: `tbmRouteGroupFee`},
              additional: {
                orderBy: [{startDate: `desc`}],
              },

              columns: ColBuilder.tbmRouteGroupFee({useGlobalProps}),
              useGlobalProps,
            }}
          />
        ),
      },
      {
        label: `委託パターン`,
        component: (
          <div>
            <BulkCalendarSetter
              {...{
                months,
                days: days,
                defaultSelectedDays: defaultSelectedDays,
                onConfirm: async ({selectedDays}) => {
                  if (!confirm('変更を反映しますか？')) return

                  const res = await doTransaction({
                    transactionQueryList: days.map(day => {
                      const isSelected = selectedDays.some(d => Days.validate.isSameDate(d, day))

                      const unique_tbmRouteGroupId_date = {
                        tbmRouteGroupId,
                        date: day,
                      }

                      return {
                        model: 'tbmRouteGroupCalendar',
                        method: 'upsert',
                        queryObject: {
                          where: {unique_tbmRouteGroupId_date},
                          ...createUpdate({...unique_tbmRouteGroupId_date, holidayType: isSelected ? '稼働' : ''}),
                        },
                      }
                    }),
                  })
                  toastByResult(res)
                },
              }}
            />
          </div>
        ),
      },
    ]
  }

  return (
    <div>
      <div className="mb-4">
        <div className="text-xl font-bold">{props.formData?.name}</div>
        {routeGroupCl.isShared && (
          <div className="mt-2 flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-yellow-400"></div>
            <span className="text-sm text-gray-600">この便は {routeGroupCl.shareCount} 営業所と共有されています</span>
          </div>
        )}
        {!routeGroupCl.isOwner(currentBaseId) && (
          <div className="mt-1 text-sm text-blue-600">共有元: {props.formData?.TbmBase?.name}</div>
        )}
      </div>
      <BasicTabs
        {...{
          style: {width: '90vw', height: '90vh'},
          id: `tbmVechicleDetailPage`,
          showAll: false,
          TabComponentArray,
        }}
      />
    </div>
  )
}
