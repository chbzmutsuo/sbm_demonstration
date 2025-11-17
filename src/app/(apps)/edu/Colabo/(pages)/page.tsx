import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'
import Redirector from '@cm/components/utils/Redirector'
import ColaboMainPage from '../ColaboMainPage'

const Page = async props => {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  if (!session?.id) {
    return <Redirector redirectPath={`/login`} />
  }

  // Get teacher's games for colabo
  const myGames = await prisma.game.findMany({
    where: {teacherId: session.id},
    orderBy: [{date: 'desc'}],
    include: {
      School: true,
      Teacher: true,
      SubjectNameMaster: true,
      GameStudent: {
        include: {
          Student: true,
        },
      },
      Slide: {
        where: {active: true},
      },
    },
  })

  // 必要なマスタデータを取得
  const schools = await prisma.school.findMany({
    where: {active: true},
    orderBy: {sortOrder: 'asc'},
  })

  const teachers = await prisma.teacher.findMany({
    where: {active: true},
    orderBy: {sortOrder: 'asc'},
  })

  const subjects = await prisma.subjectNameMaster.findMany({
    where: {active: true},
    orderBy: {sortOrder: 'asc'},
  })

  const classrooms = await prisma.classroom.findMany({
    where: {active: true},
    include: {
      Student: {
        where: {active: true},
        orderBy: {attendanceNumber: 'asc'},
      },
    },
    orderBy: [{grade: 'asc'}, {class: 'asc'}],
  })

  return (
    <ColaboMainPage
      myGames={JSON.parse(JSON.stringify(myGames))}
      schools={JSON.parse(JSON.stringify(schools))}
      teachers={JSON.parse(JSON.stringify(teachers))}
      subjects={JSON.parse(JSON.stringify(subjects))}
      classrooms={JSON.parse(JSON.stringify(classrooms))}
      session={session}
    />
  )
}

export default Page
