import {Grouping} from '@app/(apps)/edu/class/Grouping'
import React, {useEffect, useState} from 'react'

import {anyObject} from '@cm/types/utility-types'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {Prisma} from '@prisma/client'
import {toast} from 'react-toastify'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import SimpleTable from '@cm/components/utils/SimpleTable'

import NormalQuestions from '@app/(apps)/edu/Grouping/components/Grouping/game/question/NormalQuestion'
import {Alert} from '@cm/components/styles/common-components/Alert'
import {colType} from '@cm/types/col-types'

const PsychoQuestion = React.memo((props: any) => {
  const [sortedQuestions, setsortedQuestions] = useState<any[]>([])

  const {toggleLoad, Game, playerInfo, player, activePrompt, useGlobalProps, mustSummarize} = props.GameCtxValue

  const hisAllAnswer = Game.Answer.filter(a => a.studentId === player?.id)

  // const mustSummarize = true

  const [answers, setanswers] = useState<Prisma.AnswerUncheckedCreateInput | anyObject>({})
  const [showFurigana, setshowFurigana] = useState(false)
  const {router, asPath, addQuery} = useGlobalProps
  const headerClass = `my-2 w-full  p-2 text-center text-2xl font-bold text-sub-main`

  useEffect(() => {
    let flattenQuestions: any[] = []
    Grouping.QUESTIONS.map((data, i) => {
      const {key, label, questions} = data
      questions.forEach((q, idx) => {
        const questionKey = `${q.type}${idx + 1}`

        flattenQuestions.push({key, questionKey, ...q})
      })
    })

    flattenQuestions = flattenQuestions.sort((a, b) => {
      return Math.random() - Math.random()
    })
    setsortedQuestions(flattenQuestions)
  }, [])

  const {latestFormData, BasicForm} = (() => {
    let columns: colType[][] = []
    const summaryCuolumns: colType[] = [
      {
        id: 'lessonSatisfaction',
        label: <div className={headerClass}>グループでおこなった活動の満足度はどうでしたか？</div>,
        type: 'rating',
        form: {
          register: {required: '必ず入力してください'},
        },
      },
    ]

    columns = [[...(mustSummarize ? summaryCuolumns : [])]]

    const {latestFormData, BasicForm} = useBasicFormProps({
      columns,
    })
    return {latestFormData, BasicForm}
  })()

  const {readyToSend} = (() => {
    const nonAnsweredQuestions = sortedQuestions.filter(obj => {
      const {questionKey} = obj
      return !answers[questionKey]
    })
    const readyToSend =
      answers?.impression && nonAnsweredQuestions.length === 0 && (mustSummarize ? latestFormData?.lessonSatisfaction : true)

    return {readyToSend}
  })()

  const {questionToAnswer} = playerInfo
  const onSubmit = async () => {
    const payload = {
      ...answers,
      gameId: Game.id,
      studentId: player?.id,
      questionPromptId: questionToAnswer?.questionPromptId ?? undefined,
      impression: answers?.impression,
      lessonSatisfaction: latestFormData?.lessonSatisfaction,
      asSummary: !!mustSummarize,
    }

    await toggleLoad(async () => {
      await doStandardPrisma('answer', 'upsert', {
        where: {id: questionToAnswer?.id ?? 0},
        create: payload,
        update: payload,
      })
      const result = await doStandardPrisma('answer', 'deleteMany', {
        where: {
          studentId: player?.id,
          curiocity1: null,
          questionPromptId: null,
        },
      })
      toast.success('回答を送信しました')
    })
  }

  return (
    <Alert color={readyToSend ? 'green' : 'red'} className={`mx-auto w-fit text-center `}>
      <div className={`mb-4`}>
        <button className={`t-btn bg-error-main text-lg`} onClick={() => setshowFurigana(prev => !prev)}>
          {showFurigana ? '漢字のみ' : 'かなを表示'}
        </button>
      </div>
      <SimpleTable
        {...{
          style: {
            width: '100%',
            maxHeight: '70vh',
            overflow: 'auto',
            margin: 'auto',
            background: 'white',
          },
          headerArr: [1, 2, 3, 4, 5],
          bodyArr: [['まったくそう思わない', 'あまりそう思わない', 'どちらともいえない', 'ややそう思う', 'とてもそう思う']],
          options: {
            th: {widthArr: ['20%', '20%', '20%', '20%', '20%']},
          },
        }}
      />

      <NormalQuestions
        {...{
          headerClass,
          BasicForm,
          sortedQuestions,
          setanswers,
          answers,
          showFurigana,
          mustSummarize,
        }}
      />
      <button className={`t-btn rounded-lg px-4 py-2 text-lg`} disabled={!readyToSend} type="button" onClick={onSubmit}>
        送信
      </button>
    </Alert>
  )
})
export default PsychoQuestion
