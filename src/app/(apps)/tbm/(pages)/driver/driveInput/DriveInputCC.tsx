'use client'

import useCarWashGMF from '@app/(apps)/tbm/(globalHooks)/useCarWashGMF'
import useGasolineGMF from '@app/(apps)/tbm/(globalHooks)/useGasolineGMF'
import useHaishaTableEditorGMF from '@app/(apps)/tbm/(globalHooks)/useHaishaTableEditorGMF'
import useOdometerInputGMF from '@app/(apps)/tbm/(globalHooks)/useOdometerInputGMF'
import { arr__uniqArray } from '@cm/class/ArrHandler/array-utils/basic-operations'

import { Days } from '@cm/class/Days/Days'
import { toUtc } from '@cm/class/Days/date-utils/calculations'

import { NumHandler } from '@cm/class/NumHandler'
import { TextBlue, TextGray, TextGreen, TextRed } from '@cm/components/styles/common-components/Alert'
import { Button } from '@cm/components/styles/common-components/Button'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { driveInputPageType } from '@app/(apps)/tbm/(pages)/driver/driveInput/driveInput-page-type'
import { cl } from '@cm/lib/methods/common'
import { doTransaction, transactionQuery } from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import { DriveScheduleCl } from '@app/(apps)/tbm/(class)/DriveScheduleCl'
import { DriveScheduleItem } from './DriveScheduleItem'

export default function DriveInputCC({ driveScheduleList }: { driveScheduleList: driveInputPageType['driveScheduleList'] }) {
  const useGlobalProps = useGlobal()
  const { toggleLoad, session, query, router } = useGlobalProps
  const HK_HaishaTableEditorGMF = useHaishaTableEditorGMF({
    afterUpdate: ({ res }) => router.refresh(),
    afterDelete: ({ res }) => router.refresh(),
  })
  const HK_GasolineGMF = useGasolineGMF()
  const HK_CarWashGMF = useCarWashGMF()
  const HK_OdometerInputGMF = useOdometerInputGMF()
  const allVehicleIdList = arr__uniqArray(driveScheduleList.map(d => d.tbmVehicleId))

  const theDate = toUtc(query.from)
  const TextBtnClass = ` cursor-pointer text-lg font-bold hover:bg-gray-300 rounded-md p-1`

  const { unkoCompleted, carInputCompleted, gyomushuryo } = DriveScheduleCl.getStatus(driveScheduleList)
  const { setopen, handleClose, Modal } = useModal()

  return (
    <div>
      <HK_HaishaTableEditorGMF.Modal />
      <C_Stack className={` gap-8`}>
        <C_Stack className={gyomushuryo ? 'disabled ' : ''}>
          <div>
            <h2>あなたの運行予定</h2>
            <div
              className={cl(
                //
                `rounded-lg bg-white p-2.5 shadow-sm`,
                unkoCompleted ? 'bg-green-200' : ''
              )}
            >
              {!driveScheduleList.length && <TextGray>予定がありません</TextGray>}
              {driveScheduleList.map(drive => {
                const { finished } = drive
                return (
                  <div key={drive.id} className="p-2 py-4 [&:not(:last-child)]:border-b">
                    <DriveScheduleItem
                      {...{
                        drive,
                        finished: !!finished,
                        TextBtnClass,
                        HK_HaishaTableEditorGMF,
                        useGlobalProps,
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <h2>あなたの利用予定の車両</h2>
            <div
              className={cl(
                //
                `rounded-lg bg-white p-2.5 shadow-sm`,
                carInputCompleted ? 'bg-green-200' : ''
              )}
            >
              {!allVehicleIdList.length && <TextGray>予定がありません</TextGray>}
              {allVehicleIdList.map((id, i) => {
                const TbmVehicle = driveScheduleList.map(item => item.TbmVehicle).find(vehicle => vehicle?.id === id)

                const TodayMeter = TbmVehicle?.OdometerInput.find(item => {
                  return Days.validate.isSameDate(item.date, theDate)
                })

                const { odometerStart = 0, odometerEnd = 0 } = TodayMeter ?? {}

                const LastMeter = TbmVehicle?.OdometerInput.find(item => {
                  return item.date.getDate() < theDate.getDate()
                })

                const lastOdometerEnd = LastMeter?.odometerEnd ?? 0

                const handleOpenEditGMF = () => {
                  HK_OdometerInputGMF.setGMF_OPEN({
                    OdometerInput: { date: theDate, odometerStart, odometerEnd, TbmVehicle },
                  })
                }

                return (
                  <div key={i} className=" p-1 [&:not(:last-child)]:border-b">
                    <R_Stack className="justify-between   ">
                      <C_Stack className="w-[80px] justify-between gap-1 font-semibold">
                        <small>({TbmVehicle?.vehicleNumber})</small>
                      </C_Stack>

                      <R_Stack className={`gap-3`}>
                        <C_Stack className={` w-[180px] gap-0`}>
                          {/* <small className={`flex gap-1`}>
                            <span>最終:</span>
                            <span>{formatDate(LastMeter?.date, 'MM/DD(ddd)')}</span>
                            <TextOrange>{NumHandler.toPrice(lastOdometerEnd ?? 0)}km</TextOrange>
                          </small> */}
                          <div>
                            <span>乗車:</span>
                            {odometerStart ? (
                              <TextGreen {...{ onClick: handleOpenEditGMF, className: TextBtnClass }}>
                                {NumHandler.toPrice(odometerStart)}
                              </TextGreen>
                            ) : (
                              <TextRed {...{ onClick: handleOpenEditGMF, className: TextBtnClass }}>未</TextRed>
                            )}
                          </div>
                          <div>
                            <span>降車:</span>
                            {odometerEnd ? (
                              <TextGreen {...{ onClick: handleOpenEditGMF, className: TextBtnClass }}>
                                {NumHandler.toPrice(odometerEnd)}
                              </TextGreen>
                            ) : (
                              <TextRed {...{ onClick: handleOpenEditGMF, className: TextBtnClass }}>未</TextRed>
                            )}
                          </div>
                        </C_Stack>

                        {/* 給油 */}
                        <C_Stack className={`  w-[45px] gap-0 `}>
                          <TextBlue
                            {...{
                              className: TextBtnClass,
                              onClick: item => HK_GasolineGMF.setGMF_OPEN({ TbmVehicle, lastOdometerEnd }),
                            }}
                          >
                            給油
                          </TextBlue>
                          <TextBlue
                            {...{
                              className: TextBtnClass,
                              onClick: item => HK_CarWashGMF.setGMF_OPEN({ TbmVehicle }),
                            }}
                          >
                            洗車
                          </TextBlue>
                        </C_Stack>
                      </R_Stack>
                    </R_Stack>
                  </div>
                )
              })}
            </div>
          </div>
        </C_Stack>

        <section className={` text-center`}>
          <C_Stack className={` items-center`}>
            <div>{gyomushuryo && <TextRed className={` text-xl font-bold`}>当日業務は終了しています。</TextRed>}</div>

            <Button
              onClick={async () => {
                setopen(true)
              }}
              className={`text-2xl`}
              disabled={!(unkoCompleted && carInputCompleted)}
              color={gyomushuryo ? 'red' : 'blue'}
            >
              {gyomushuryo ? '業務終了を撤回する' : '業務終了'}
            </Button>

            <Modal>
              <C_Stack className={` items-center gap-[60px] p-[40px]`}>
                <TextRed className={` text-2xl font-bold`}>
                  {gyomushuryo ? '業務終了を取り消してもよろしいですか？' : '給油と洗車を入力しましたか？'}
                </TextRed>

                <Button
                  onClick={async () => {
                    const msg = `確定してよろしいですか？`

                    toggleLoad(async () => {
                      if (confirm(msg)) {
                        const transactionQueryList: transactionQuery<'tbmDriveSchedule', 'update'>[] = driveScheduleList.map(
                          d => {
                            return {
                              model: `tbmDriveSchedule`,
                              method: 'update',
                              queryObject: {
                                where: { id: d.id },
                                data: { confirmed: gyomushuryo ? false : true },
                              },
                            }
                          }
                        )
                        await doTransaction({ transactionQueryList })
                      }
                    })
                  }}
                  className={`text-2xl`}
                  disabled={!(unkoCompleted && carInputCompleted)}
                >
                  確定
                </Button>
              </C_Stack>
            </Modal>
          </C_Stack>
        </section>
      </C_Stack>
    </div>
  )
}
