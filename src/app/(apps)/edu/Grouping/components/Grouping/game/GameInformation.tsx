import Link from 'next/link'
import QRCodeComponent from '@cm/components/utils/QRCodeComponent'

import {cl} from '@cm/lib/methods/common'
import {toast} from 'react-toastify'

import ProcessVisualizer from '@cm/components/List/ProcessVisualizer'

import {Grouping} from '@app/(apps)/edu/class/Grouping'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import {QueryBuilder} from '@app/(apps)/edu/class/QueryBuilder'
import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import BasicModal from '@cm/components/utils/modal/BasicModal'
import {Center, C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import RandomSamplingSwith from '@app/(apps)/edu/Grouping/components/Grouping/game/Teacher/RandomSamplingSwith'
import Award from '@app/(apps)/edu/Grouping/components/Grouping/game/Award/Award'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'

export default function GameInformation({GameCtxValue, useGroupReturnObj, groupConfig}) {
  const {Game, GAME_CLASS, isNewPromptAvailabel, url, secretKey, players, activePrompt, useGlobalProps} = GameCtxValue
  const {toggleLoad, router, session, query} = useGlobalProps
  const {GameStatus} = GAME_CLASS.handleGameStatus()
  const {onSummary, onQuestionStart, onQuestionEnd, onFinish} = GameStatus

  const handleOnQuestionStart = async () => {
    toggleLoad(async () => {
      if (!isNewPromptAvailabel) {
        alert('現在、実施中のアンケートがあります。')
        return
      }
      await Grouping.createNewPrompt({Game, newStatus: onQuestionStart.label, players, dev: query.g_dev === 'ON'})

      toast.warning(
        <>
          <h4 className={`text-warning-main`}>アンケートを実施しました</h4>
          <p>全員が回答した段階で、「回答を終了」ボタンを押してください</p>
        </>
      )
    })
  }

  const handleQuestionFinish = async () => {
    const updatedPrompt = await toggleLoad(async () => {
      //未回答の児童・生徒はデータを作る
      let transactionQueryList: transactionQuery<any, any>[] = [
        ...players.map(student => {
          const data = {
            studentId: student.id,
            gameId: Game.id,
            questionPromptId: activePrompt?.id,
          }
          return {
            model: 'answer',
            method: 'upsert',
            queryObject: {
              where: {
                unique_gameId_studentId_questionPromptId: {
                  gameId: Game.id,
                  studentId: student.id,
                  questionPromptId: activePrompt?.id ?? 0,
                },
              },
              create: data,
              update: data,
            },
          }
        }),
      ]
      transactionQueryList = [
        ...transactionQueryList,
        {
          model: 'game',
          method: 'update',
          queryObject: {
            where: {id: Game.id},
            data: {
              activeQuestionPromptId: null,
            },
          },
        },
      ]

      await doTransaction({transactionQueryList})

      const {result: updatedPrompt} = await doStandardPrisma('questionPrompt', 'update', {
        where: {id: activePrompt?.id ?? 0},
        include: QueryBuilder.getInclude({session, query}).questionPrompt?.include,
        data: {active: false},
      })

      return updatedPrompt
    })

    toast.warning(
      <>
        <h4 className={`text-warning-main`}>アンケートが締め切られました。</h4>
        <p>このアンケート結果から、上記のグループが提案されました。</p>
        <small>採用しなかった場合、後からグループ作成をすることもできます。</small>
      </>
    )

    useGroupReturnObj.handleCreateGroup({prompt: updatedPrompt, groupConfig})
  }

  const handleOnSummary = async () => {
    toggleLoad(async () => {
      await Grouping.createNewPrompt({Game, newStatus: onSummary.label, players, asSummary: true, dev: query.g_dev === 'ON'})
    })
    toast.success(`まとめアンケートを開始しました。`)
  }

  const handleOnFinish = async () => {
    toggleLoad(async () => {
      const currentActiveQuestionPromptId = Game.activeQuestionPromptId
      await doStandardPrisma('game', 'update', {where: {id: Game.id}, data: {activeQuestionPromptId: null}})
      await doStandardPrisma('questionPrompt', 'update', {where: {id: currentActiveQuestionPromptId}, data: {active: false}})
    })
    toast.warning(`まとめアンケートを締め切りました。`)
  }

  const processesOrigin = [
    {
      process: onQuestionStart,
      className: `t-btn `,
      onClick: handleOnQuestionStart,
      confirmMsg: 'アンケートを実施しますか？',
      disabledWhen: [onSummary, onQuestionStart, onFinish],
      disabledWhenTrue: [],
    },
    {
      process: onQuestionEnd,
      className: `t-btn `,
      onClick: async () => {
        await handleQuestionFinish()
      },
      confirmMsg: 'アンケートを終了しますか？',
      disabledWhen: [onQuestionEnd, onSummary, onFinish],
      disabledWhenTrue: [],
    },
    {
      process: onSummary,
      className: `t-btn `,
      onClick: handleOnSummary,
      confirmMsg: 'まとめアンケートを開始しますか？',
      disabledWhen: [onQuestionStart, onSummary, onFinish],
      disabledWhenTrue: [Game?.Group?.length === 0],
    },
    {
      process: onFinish,
      className: `t-btn `,
      onClick: handleOnFinish,
      confirmMsg: 'まとめアンケートを締め切り表彰に移りますか？',
      disabledWhen: [onQuestionStart, onQuestionEnd, onFinish],
      disabledWhenTrue: [],
    },
  ]

  const processes = processesOrigin.map((thisProcess, idx) => {
    const {process, className, onClick, confirmMsg, disabledWhen, disabledWhenTrue} = thisProcess
    const previousProcess = processesOrigin[idx - 1]
    const isNextAction = previousProcess && previousProcess.process.label === Game.status

    const isDisabled =
      disabledWhen?.map(status => status.label).includes(Game.status) || disabledWhenTrue.filter(v => v).length > 0

    const component = (
      <button
        disabled={isDisabled}
        className={cl(className, isNextAction ? ' bg-error-main animate-pulse opacity-100' : '')}
        onClick={async () => {
          const confirmed = confirm(confirmMsg)
          if (confirmed) {
            await onClick()
            const res = await Grouping.switchGameStatus({Game, status: process.label})
            router.refresh()
          }
        }}
      >
        {process.label}
      </button>
    )

    return {component}
  })

  return (
    <div className={`col-stack   items-stretch`}>
      <div className={`  `}>
        <div className={`row-stack items-stretch justify-start gap-10`}>
          <div className={`col-stack gap-2 [&_td]:border-y-[1px]! [&_th]:border-y-[1px]!`}>
            {CsvTable({
              records: [
                {
                  csvTableRow: [
                    {
                      label: '基本情報',
                      cellValue: (
                        <>
                          <C_Stack className={` items-start gap-0.5 p-1`}>
                            <div>
                              <strong>{Game?.name}</strong>
                            </div>
                            <div>
                              担当者:<strong>{Game?.Teacher?.name}</strong>
                            </div>
                            <div>
                              生徒数: <strong>{players.length}人</strong>
                            </div>
                          </C_Stack>
                        </>
                      ),
                    },
                    {
                      label: 'キー/QR',
                      cellValue: (
                        <>
                          <C_Stack className={` items-center `}>
                            <Link className={`t-link  text-xl font-bold w-fit mx-auto`} href={url}>
                              {secretKey}
                            </Link>

                            <BasicModal
                              Trigger={
                                <div className={` onHover`}>
                                  <QRCodeComponent url={url} style={{height: 120, width: 120}} />
                                </div>
                              }
                            >
                              <Center style={{height: 640, width: 640}}>
                                <div>
                                  <p className={`mb-4 text-center text-4xl font-bold`}>{secretKey}</p>
                                  <QRCodeComponent url={url} style={{height: 600, width: 600}} />
                                </div>
                              </Center>
                            </BasicModal>
                          </C_Stack>
                        </>
                      ),
                      thStyle: {width: 100, height: undefined},
                      style: {width: 100},
                    },
                    {label: '表彰結果', cellValue: <>{Game.status === onFinish.label && <Award {...{GameCtxValue}} />}</>},
                    {label: 'ステータス', cellValue: <ProcessVisualizer processes={processes} />},
                    {
                      label: 'ランダムサンプリング',
                      cellValue: (
                        <>
                          <R_Stack className={`gap-4`}>
                            <div className={`w-24 text-xs font-bold`}>
                              <div>ランダム</div>
                              <div>サンプリング</div>
                            </div>
                            <RandomSamplingSwith {...{GameCtxValue}} />
                          </R_Stack>
                        </>
                      ),
                    },
                  ],
                },
              ],
            }).WithWrapper({})}
            {/* <SimpleTable
              {...{
                showIndex: false,
                headerArr: ['基本情報', 'キー/QR', '表彰結果', 'ステータス', `ランダムサンプリング`],
                bodyArr: [
                  [
                    <C_Stack className={` items-start gap-0.5 p-1`}>
                      <div>
                        <strong>{Game?.name}</strong>
                      </div>
                      <div>
                        担当者:<strong>{Game?.Teacher?.name}</strong>
                      </div>
                      <div>
                        生徒数: <strong>{players.length}人</strong>
                      </div>
                    </C_Stack>,
                    <C_Stack className={`p-1`}>
                      <Link className={`t-link mx-1 text-xl font-bold`} href={url}>
                        {secretKey}
                      </Link>

                      <BasicModal
                        Trigger={
                          <div className={` onHover`}>
                            <QRCodeComponent url={url} style={{height: 90, width: 90}} />
                          </div>
                        }
                      >
                        <Center style={{height: 650, width: 650}}>
                          <div>
                            <p className={`mb-4 text-center text-4xl font-bold`}>{secretKey}</p>
                            <QRCodeComponent url={url} style={{height: 600, width: 600}} />
                          </div>
                        </Center>
                      </BasicModal>
                    </C_Stack>,
                    <div>{Game.status === onFinish.label && <Award {...{GameCtxValue}} />}</div>,

                    <div>
                      <ProcessVisualizer processes={processes} />
                    </div>,
                    <div>
                      <R_Stack className={`gap-4`}>
                        <div className={`w-24 text-xs font-bold`}>
                          <div>ランダム</div>
                          <div>サンプリング</div>
                        </div>
                        <RandomSamplingSwith {...{GameCtxValue}} />
                      </R_Stack>
                    </div>,
                  ],
                ],
                style: {width: 'fit-content'},
                options: {
                  th: {
                    widthArr: ['200px', '100px', '100px', 500, 500],
                  },
                },
              }}
            /> */}
          </div>
        </div>
      </div>
    </div>
  )
}
