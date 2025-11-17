import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
// import {faker} from '@faker-js/faker'

import {getUniqueColorById, ObjectMap} from '@cm/lib/methods/common'

import {anyObject} from '@cm/types/utility-types'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import {Prisma} from '@prisma/client'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {NumHandler} from '@cm/class/NumHandler'

import {arr__sortByKey} from '@cm/class/ArrHandler/array-utils/sorting'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'

export class Grouping {
  static setRandomTargetStudentIds = async ({Game, randomSamplingState, setshowTargetPlayers}) => {
    setshowTargetPlayers(true)
    const student = Game.Room.RoomStudent.map(rs => rs.Student)
    const randomTargetStudentIds = student
      .sort(() => Math.random() - 0.5)
      .slice(0, randomSamplingState?.count)
      .map(s => s.id)

    return await doStandardPrisma('game', 'update', {
      where: {id: Game.id},
      data: {randomTargetStudentIds},
    })
  }
  static RandomTargetStudentIds = async ({Game}) => {
    return await doStandardPrisma('game', 'update', {
      where: {id: Game.id},
      data: {randomTargetStudentIds: []},
    })
  }

  static isActiveAnswer = answer => {
    return answer?.curiocity1 !== null
  }
  static getStudentComments = ({Game, Student}) => {
    const StudentAnswer = Game.Answer.filter(ans => ans.studentId === Student.id)
    const impressionsFromAnswer =
      StudentAnswer?.map(data => {
        return {...Student, comment: data.impression}
      }) ?? []

    const finalImpressions = []
    const allImpressions = [...impressionsFromAnswer, ...finalImpressions].filter(data => data.comment)

    return allImpressions
  }

  static createNewPrompt = async ({newStatus = `アンケート実施`, Game, players, asSummary = false, dev = false}) => {
    const gameId = Game.id
    const prompt = await doStandardPrisma('questionPrompt', 'create', {
      data: {asSummary, gameId},
    }).then(res => res.result)

    const questionPromptId = prompt.id

    await doStandardPrisma('game', 'update', {
      where: {id: Game.id},
      data: {activeQuestionPromptId: prompt?.id ?? 0},
    })

    await Grouping.switchGameStatus({Game, status: newStatus})
    // faker.locale = 'ja'

    const transactionQueryList: transactionQuery<'answer', 'create'>[] = []
    players.map(async s => {
      // const forTestSeed = makeTestSeed(asSummary)
      const studentId = s.id

      const query: transactionQuery<'answer', 'create'> = {
        model: 'answer',
        method: 'create',
        queryObject: {
          data: {
            gameId,
            studentId,
            questionPromptId,

            // ...(dev ? forTestSeed : {}),
          },
        },
      }

      transactionQueryList.push(query)
    })

    const test = transactionQueryList.map(q => {
      return q.queryObject.data.curiocity1
    })

    const res = await doTransaction({transactionQueryList})
    if (dev) {
      await doStandardPrisma('game', 'update', {where: {id: Game.id}, data: {status: 'アンケート終了'}})
    }
  }

  static switchGameStatus = async ({Game, status}) => {
    return await doStandardPrisma('game', 'update', {where: {id: Game.id}, data: {status}})
  }

  /**班の番号 */
  static getGroupIndexNumber = ({squad, activeGroup}) => {
    return activeGroup?.Squad?.findIndex(data => data.id === squad.id) + 1
  }

  static sorter = {
    classroom: data => {
      data.sort((a, b) => {
        const keyA = String(`${a.grade}-${a.class}`)
        const keyB = String(`${b.grade}-${b.class}`)

        return keyA.localeCompare(keyB, 'ja', {numeric: true})
      })
      return data
    },
    student: data => {
      data.sort((a, b) => {
        const classNameA = String(new ClassRoom(a.Class).className)
        const classNameB = String(new ClassRoom(b.Class).className)

        return classNameA.localeCompare(classNameB, 'ja', {numeric: true})
      })
      return data
    },
  }

  //好奇心と効力感
  static getCuriocityAndEfficacy(answer) {
    if (answer) {
      let curiocity = 0
      let efficacy = 0

      for (let i = 1; i <= 5; i++) {
        curiocity += answer?.[`curiocity${i}`] ?? 0
        efficacy += answer?.[`efficacy${i}`] ?? 0
      }
      return {curiocity, efficacy}
    } else {
      return {curiocity: 0, efficacy: 0}
    }
  }

  static QUESTIONS = [
    {
      key: 'curiocity',
      label: '課題への効力感',
      questions: [
        {
          label: '「 自分（じぶん）はこの授業（じゅぎょう）の課題（かだい）は努力（どりょく）しなくてもやっていける」',
          type: 'curiocity',
        },
        {
          label: '「自分（じぶん）はこの授業（じゅぎょう）の課題（かだい）をうまくやる自信（じしん）がある」',
          type: 'curiocity',
        },
        {
          label: '「 自分（じぶん）はこの授業（じゅぎょう）の課題（かだい）を達成（たっせい）できる力がある」',
          type: 'curiocity',
        },
        {
          label: '「 自分（じぶん）はこの授業（じゅぎょう）の課題（かだい）を あきらめずにとりくめる」',
          type: 'curiocity',
        },
        {
          label:
            '「 自分（じぶん）はこのレベルの課題（かだい）を達成（たっせい）するのに時間（じかん）はあまりかからないと思（おも）う」',
          type: 'curiocity',
        },
      ],
    },
    {
      key: 'efficacy',
      label: '課題への好奇心',
      questions: [
        {
          label: '「この授業（じゅぎょう）の課題（かだい）をさらに深（ふか）めたいと思（おも）う」',
          type: 'efficacy',
        },
        {
          label: '「 この授業（じゅぎょう）の課題（かだい）についてもっとしらべたいと思（おも）う」',
          type: 'efficacy',
        },
        {
          label: '「 この授業（じゅぎょう）の課題（かだい）について興味（きょうみ）をもってとりくむことができる」',
          type: 'efficacy',
        },
        {
          label: '「 この授業（じゅぎょう）の課題（かだい）にとりくんでいて，おもしろいと感じ（かんじ）る」',
          type: 'efficacy',
        },
        {
          label: '「 この授業（じゅぎょう）の課題（かだい）にとりくんでいて満足感（まんぞくかん）がえられると思（おも）う」',
          type: 'efficacy',
        },
      ],
    },
  ]

  static ROLES = {
    司会: {color: '#FF7E79', maxCount: 1},
    質問: {color: '#EFB93B', maxCount: 1},
    発表: {color: '#7FB93B', maxCount: 2},
  }

  static chart = {
    prepare_positionMappingData: ({Game, players, selectedPlayers, nthPrompt}) => {
      const result: any[] = []
      const nthQuestionPrompt = nthPrompt ? Game?.QuestionPrompt[nthPrompt - 1] : []

      const nthAnswerArr = Game.Answer.filter(a => a.questionPromptId === nthQuestionPrompt.id)
      //  nthQuestionPrompt?.Answer
      nthAnswerArr?.forEach(answer => {
        const con1_Student = selectedPlayers.find(p => p.id === answer.studentId)

        const cno2_Answer = answer.curiocity1 !== null
        const {curiocity, efficacy} = Grouping.getCuriocityAndEfficacy(answer)
        const {studentId} = answer
        const Student = players.find(s => s.id === studentId)

        const color = getUniqueColorById(studentId, 10)
        // const colorOpacity50

        if (con1_Student && cno2_Answer) {
          const value = {
            ...answer,
            y: curiocity,
            x: efficacy,
            studentId,
            color,
            Student,
            groupIdx: con1_Student.groupIdx,
          }
          result.push(value)
        }
      })
      return result
    },

    prepare_time_curiocity_efficacy_data: AnswerArr => {
      const intervalMinute = 5

      const averagedDataByInterval = {}

      /**時間順に並べ変え */
      const sortedAnswer = AnswerArr.map((answer, i) => {
        const {curiocity, efficacy} = Grouping.getCuriocityAndEfficacy(answer)
        const time = new Date(answer.createdAt)

        return {time, curiocity, efficacy}
      })

      /**時刻表きの変更 */

      const data = arr__sortByKey(sortedAnswer, 'time')
      const firstEffectiveData = data.find(d => d.curiocity !== 0 && d.efficacy !== 0)
      const lastEffectiveData = [...data].reverse().find(d => d.curiocity !== 0 && d.efficacy !== 0)

      const effectiveData = data.filter(d => {
        return d.time >= firstEffectiveData.time && d.time <= lastEffectiveData?.time
      })

      const create5MinutesIntervals = () => {
        const result: Date[] = []

        let current = firstEffectiveData?.time
        while (current <= lastEffectiveData?.time) {
          result.push(current)
          current = Days.minute.add(current, intervalMinute)
        }

        return result
      }
      const intervals = create5MinutesIntervals()

      let current = new Date(firstEffectiveData?.time)
      intervals.forEach((interval, i) => {
        obj__initializeProperty(averagedDataByInterval, String(interval), {
          average: {efficacy: 0, curiocity: 0, count: 0, efficacyAverage: 0, curiocityAverage: 0},
          list: [],
        })
      })
      effectiveData.forEach((d, i) => {
        const time = d.time

        const nextInterval = Days.minute.add(current, intervalMinute)

        if (time <= nextInterval) {
          obj__initializeProperty(averagedDataByInterval, String(nextInterval), {
            average: {efficacy: 0, curiocity: 0, count: 0, efficacyAverage: 0, curiocityAverage: 0},
            list: [],
          })
          averagedDataByInterval[String(nextInterval)].list.push(d)
        } else {
          current = nextInterval
        }
      })

      const result = ObjectMap(averagedDataByInterval, (key, value) => {
        const {list} = value
        const average = list.reduce(
          (acc, cur) => {
            return {
              efficacy: acc.efficacy + (cur.efficacy ?? 0),
              curiocity: acc.curiocity + (cur.curiocity ?? 0),
              count: acc.count + 1,
            }
          },
          {efficacy: 0, curiocity: 0, count: 0, efficacyAverage: 0, curiocityAverage: 0}
        )

        const efficacyAverage = NumHandler.round(average.efficacy / (average.count || 1))
        const curiocityAverage = NumHandler.round(average.curiocity / (average.count || 1))

        return {
          time: formatDate(key, 'MM-DD HH:mm'),
          efficacy: isNaN(efficacyAverage) ? 0 : efficacyAverage,
          curiocity: isNaN(curiocityAverage) ? 0 : curiocityAverage,
          count: average.count,
        }
      })

      return Object.values(result)
    },
  }

  static sortPlayersByCuriocity = answer => {
    answer = [...answer].map(ans => {
      return {...ans, ...Grouping.getCuriocityAndEfficacy(ans)}
    })

    return [...answer]?.sort((x, y) => {
      return (x.curiocity - y.curiocity) * -1
    })
  }
}

export class GameClass {
  game: anyObject
  status: string
  // summaryModeIsActive: any

  constructor(game) {
    this.game = game
    // this.summaryModeIsActive = this.game?.SummaryPrompt?.active
  }
  mustSummarize = () => {
    const hasActivePrompt = this.game.QuestionPrompt.find(data => data.asSummary === true)
    // const hasActivePrompt = this.game.QuestionPrompt[this.game.QuestionPrompt.length - 1]?.asSummary
    return hasActivePrompt
  }

  handleGameStatus = () => {
    const GameStatus = {
      onProcess: {label: '進行中', active: true},
      onQuestionStart: {label: 'アンケート実施', active: true},
      onQuestionEnd: {label: 'アンケート終了', active: true},
      onSummary: {label: 'まとめ', active: true},
      onFinish: {label: 'まとめ終了&表彰', active: true},
    }

    return {GameStatus}
  }

  getStudent() {
    return this?.game?.GameStudent?.map(mid => {
      const Answer = this?.game?.Answer?.find(data => data.studentId === mid.Student.id)

      return {...mid.Student}
    }).flat()
  }

  getCurrentActivePrompt() {
    return this.game?.QuestionPrompt?.find(data => data.id === this.game.activeQuestionPromptId)
  }
  getActiveGroup() {
    const allGroupsAvailable = [...this.game?.Group]

    const activeGroup = allGroupsAvailable.find(data => data.id === this.game.activeGroupId)

    return activeGroup
  }

  isThisStudentAttending(studentId) {
    return !this.game?.absentStudentIds?.includes(studentId)
  }

  getGroupsWithRoles = SquadsArray => {
    const roleMaster = this.game?.LearningRoleMasterOnGame as Prisma.LearningRoleMasterOnGameUncheckedCreateInput[]

    //最後の回答を元に、グループ明細を表示

    const lastPrompt = this.game?.QuestionPrompt?.[this.game?.QuestionPrompt?.length - 1]
    const lastAnswers = this.game.Answer.filter(a => a?.questionPromptId === lastPrompt?.id)

    const convertedGroups = SquadsArray?.map(squad => {
      const students =
        squad?.Student ??
        squad?.map(answer => {
          return answer.Student
        })

      return students
        .map(s => {
          const studentRolesInSquad = squad.StudentRole
          const StudentRole = studentRolesInSquad?.find(role => role.Student.id === s.id)?.LearningRoleMasterOnGame?.name

          const answer = lastAnswers?.find(ans => {
            return ans.studentId === s?.id
          })

          const {curiocity, efficacy} = Grouping.getCuriocityAndEfficacy(answer)

          const {lessonSatisfaction} = answer ?? {}

          return {...answer, curiocity, efficacy, Student: s, lessonSatisfaction, StudentRole}
        })
        ?.sort((x, y) => {
          return (x.curiocity - y.curiocity) * -1
        })
    })

    const groupWithRoles = convertedGroups?.map(singleGroup => {
      const squad = singleGroup?.Student ?? singleGroup

      const roles = Object.fromEntries(
        roleMaster.map((d: Prisma.LearningRoleMasterOnGameUncheckedCreateInput) => {
          const {name, color} = d
          return [name, 0]
        })
      )

      const roledGroup = [...Grouping.sortPlayersByCuriocity(squad)].map(group => {
        const {Student, curiocity, efficacy, lessonSatisfaction, StudentRole} = group

        const absent = this.game?.absentStudentIds?.find(id => id === Student?.id)

        let roleInGroup = StudentRole

        //規定値がない場合は計算する
        if (roleInGroup === undefined) {
          for (let i = 0; i < roleMaster.length; i++) {
            const role = roleMaster[i]
            const {name, maxCount} = role
            const doDistribution = roles[name] < (maxCount ?? 0) || !maxCount
            if (doDistribution) {
              roleInGroup = name
              roles[name] += 1
              break
            }
          }
          if (roleInGroup === undefined) {
            roleInGroup = roleMaster?.[roleMaster.length - 1]?.name
          }
        }

        return {
          Student: {...Student, roleInGroup},
          curiocity,
          efficacy,
          absent,
          lessonSatisfaction,
        }
      })

      return roledGroup
    })

    return {convertedGroups, groupWithRoles}
  }
}

export class StudentClass {
  student: anyObject
  constructor(student) {
    this.student = student
  }

  getUnfitFellowMidTableWith(anotherStudentId) {
    const currentUnfitFellowTable = this.student?.UnfitFellow?.find(table => {
      const twoStudent = table.Student.map(ts => ts.id)
      return twoStudent.includes(this.student.id) && twoStudent.includes(anotherStudentId)
    })

    return currentUnfitFellowTable
  }
}

export class ClassRoom {
  Classroom: any
  className: string
  constructor(Classroom) {
    this.Classroom = Classroom
    this.className = this.Classroom?.grade + '-' + this.Classroom?.class
  }
}

export class GroupClass {
  Squads: any
  constructor(Group) {
    this.Squads = Group
  }

  static getSquadId = squad => {
    const squadId = squad
      .map(answer => {
        return `${answer.Student?.id}`
      })
      .join('.')

    return squadId
  }

  getGame_Group_id = Game => {
    const groupId = this.Squads.map(squad => {
      const squadId = GroupClass.getSquadId(squad)
      return squadId
    }).join('_')

    const game_group_id = `${Game.id}___${groupId}`
    return game_group_id
  }
}

export class RoomClass {
  static getPlayes = ({room}) => room?.RoomStudent?.map(rs => rs.Student)
  static getAnswers = ({room, studentId, dateFrom, dateTo, subjectNameMasterId}) => {
    const result: anyObject[] = []
    room?.Game?.forEach(game => {
      return game.Answer.filter(answer => {
        const con1 = studentId ? answer?.studentId === studentId : true
        const con2 = dateFrom ? answer?.createdAt >= new Date(dateFrom) : true
        const con3 = dateTo ? answer?.createdAt <= new Date(dateTo) : true
        const con4 = subjectNameMasterId ? game?.subjectNameMasterId === subjectNameMasterId : true
        const con5 = Grouping.isActiveAnswer(answer)

        return con1 && con2 && con3 && con4 && con5
      }).forEach(answer => {
        const {curiocity, efficacy} = Grouping.getCuriocityAndEfficacy(answer)
        const {studentId} = answer
        const answerObject = {...answer, curiocity, efficacy, studentId, game}
        result.push(answerObject)
        return answerObject
      })
    })
    return result
  }
}

// export const makeTestSeed = asSummary => {
//   const result = {
//     curiocity1: Math.floor(Math.random() * 5) + 1,
//     curiocity2: Math.floor(Math.random() * 5) + 1,
//     curiocity3: Math.floor(Math.random() * 5) + 1,
//     curiocity4: Math.floor(Math.random() * 5) + 1,
//     curiocity5: Math.floor(Math.random() * 5) + 1,
//     efficacy1: Math.floor(Math.random() * 5) + 1,
//     efficacy2: Math.floor(Math.random() * 5) + 1,
//     efficacy3: Math.floor(Math.random() * 5) + 1,
//     efficacy4: Math.floor(Math.random() * 5) + 1,
//     efficacy5: Math.floor(Math.random() * 5) + 1,
//     impression: faker.commerce.productName(),
//     lessonSatisfaction: asSummary ? Math.floor(Math.random() * 5) + 1 : null,
//     lessonImpression: asSummary ? faker.commerce.productName() : null,
//     asSummary,
//     createdAt: faker.date.between(new Date(), addHours(new Date(), 2)),
//   }

//   return result
// }
