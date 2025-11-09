'use client'
import React from 'react'
import MidTable from '@cm/components/DataLogic/RTs/MidTable/MidTable'
import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {Prisma} from '@prisma/client'

import {HREF} from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {RoleSetting} from '@app/(apps)/edu/Grouping/components/Grouping/game/Teacher/RoleSetting'

import TaskScoring from '@app/(apps)/edu/Grouping/parts/TaskScoring'
import {Button} from '@cm/components/styles/common-components/Button'
import Link from 'next/link'
import {Card} from '@cm/shadcn/ui/card'
import MyAccordion from '@cm/components/utils/Accordions/Accordion'

export default function GameDetailPage(props) {
  const useGlobalProps = useGlobal()
  const {session, query} = useGlobalProps
  const game = props.formData ?? {}
  const {getGroupieScopes} = useGlobalProps.accessScopes()
  const {schoolId, teacherId} = getGroupieScopes()

  const queryObject: Prisma.StudentFindManyArgs = {
    where: {schoolId},
    include: {
      Classroom: {},
    },
    orderBy: [{Classroom: {grade: 'asc'}}, {Classroom: {class: 'asc'}}, {attendanceNumber: 'asc'}],
  }
  const {data: student, isLoading} = useDoStandardPrisma('student', 'findMany', {...queryObject}, {deps: []})

  const gamePath = HREF(`/edu/Grouping/game/main/${game.secretKey}`, {as: 'teacher'}, query)
  const {router} = useGlobalProps

  return (
    <C_Stack>
      <Link href={gamePath}>
        <Button color={`blue`}>PLAY</Button>
      </Link>

      <R_Stack className={`items-start gap-10`}>
        {/* <AutoGridContainer {...{maxCols: {'2xl': 2}, className: `gap-10`}}>
          <Card>
            <MyForm {...props} />
          </Card>

          <Card>
            <MidTable
              {...{
                ParentData: game,
                relation: 'manyToMany',
                candidates: student,
                models: {
                  parent: 'game',
                  mid: 'gameStudent',
                  another: 'student',
                },
                groupBy: {
                  keyArray: ['Classroom.grade', 'Classroom.class'],
                  joinWith: '-',
                },
                keysToShow: {
                  keyArray: ['name'],
                  joinWith: '-',
                },
                uniqueRelationalKey: 'unique_gameId_studentId',
              }}
            />
          </Card>

          <Card>
            <RoleSetting {...{Game: game, useGlobalProps}} />
          </Card>
          <Card>
            <TaskScoring {...{game}} />
          </Card>
        </AutoGridContainer> */}
        <C_Stack>
          <MyAccordion {...{className: `min-w-[350px]`, label: `プロジェクト情報`, defaultOpen: true, closable: false}}>
            <Card>
              <MyForm {...props} />
            </Card>
          </MyAccordion>
        </C_Stack>

        <C_Stack>
          <MyAccordion {...{className: `min-w-[350px]`, label: `参加者設定`, defaultOpen: true, closable: false}}>
            <Card>
              <MidTable
                {...{
                  ParentData: game,
                  relation: 'manyToMany',
                  candidates: student,
                  models: {
                    parent: 'game',
                    mid: 'gameStudent',
                    another: 'student',
                  },
                  groupBy: {
                    keyArray: ['Classroom.grade', 'Classroom.class'],
                    joinWith: '-',
                  },
                  keysToShow: {
                    keyArray: ['name'],
                    joinWith: '-',
                  },
                  uniqueRelationalKey: 'unique_gameId_studentId',
                }}
              />
            </Card>
          </MyAccordion>
          <MyAccordion {...{label: `役割設定`, defaultOpen: true, closable: false}}>
            <Card>
              <RoleSetting {...{Game: game, useGlobalProps}} />
            </Card>
          </MyAccordion>
        </C_Stack>
      </R_Stack>
      <TaskScoring {...{game}} />
    </C_Stack>
  )
}
