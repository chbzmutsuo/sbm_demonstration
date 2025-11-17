'use server'

import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import prisma from 'src/lib/prisma'
import {requestResultType} from '@cm/types/types'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

export const createStudentDataFromCsv = async (props: {csvArr: any[]; schoolId: number}) => {
  type studentData = {
    id: number
    name: string
    kana?: string
    gender?: string
    attendanceNumber: number
    schoolId: number
  }
  const {csvArr, schoolId} = props
  let errorMessage = ``
  csvArr.splice(0, 1)
  const schoolObjects = {}
  const csvObejctArr = csvArr.map(row => {
    const [id, grade, classroom, attendanceNumber, gender, name, kana] = row

    if (!grade || !classroom || !attendanceNumber || !name) {
      errorMessage += '学年、組、番号のいずれかが欠損しているデータがあります。'
    }
    const student = {
      id: 0, //idは自動採番
      name: String(name),
      kana: String(kana),
      gender: String(gender),
      attendanceNumber: Number(attendanceNumber),
    }
    const uniqueKeyForClassroom = `${schoolId}_${grade}_${classroom}`
    obj__initializeProperty(schoolObjects, uniqueKeyForClassroom, {
      grade: String(grade),
      classroom: String(classroom),
      students: [],
    })
    schoolObjects[uniqueKeyForClassroom].students.push(student)
    return {id, grade, classroom, attendanceNumber, gender, name, kana}
  })
  if (errorMessage) {
    return {success: false, message: errorMessage, result: null}
  }
  const transactionQueries: transactionQuery<'student', 'upsert'>[] = []
  // schoolObjects（学級別に児童・生徒配列を格納したもの）をループして
  // 所属クラスのprismaデータを取得し、
  // transaction用の配列にpushする
  await Promise.all(
    Object.keys(schoolObjects).map(async (key: string) => {
      const {grade, classroom, students} = schoolObjects[key]
      const unique_schoolId_grade_class = {
        schoolId,
        grade,
        class: classroom,
      }

      /**学校の指定 | create */
      let prismaClassRoom = await prisma.classroom.findUnique({
        where: {
          unique_schoolId_grade_class,
        },
      })

      if (!prismaClassRoom?.id) {
        prismaClassRoom = await prisma.classroom.create({
          data: {
            schoolId,
            grade,
            class: classroom,
          },
        })
      }
      students.forEach((student: studentData) => {
        const {id, gender, name, kana, attendanceNumber} = student
        const queryFromClient: transactionQuery<'student', 'upsert'> = {
          model: 'student',
          method: 'upsert',
          queryObject: {
            where: {
              unique_schoolId_classroomId_attendanceNumber: {
                schoolId,
                classroomId: prismaClassRoom?.id,
                attendanceNumber,
              },
            },
            create: {
              name,
              kana,
              gender,
              attendanceNumber,
              classroomId: prismaClassRoom?.id,
              schoolId,
            },
            update: {
              name,
              kana,
              gender,
              attendanceNumber,
              classroomId: prismaClassRoom?.id,
              schoolId,
            },
            include: {Classroom: {}},
          },
        }
        transactionQueries.push(queryFromClient)
      })
    })
  )
  const result = await doTransaction({transactionQueryList: transactionQueries})

  return {success: true, message: '児童・生徒データを作成しました。', result} as requestResultType
}
