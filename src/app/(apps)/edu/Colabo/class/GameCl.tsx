import prisma from 'src/lib/prisma'

export type gameDataType = NonNullable<Awaited<ReturnType<typeof GameCl.getCurrentSlideAnswers>>>
export class GameCl {
  static getCurrentSlideAnswers = async (gameId: number) => {
    const game = await prisma.game.findUnique({
      where: {id: gameId},
      include: {
        School: true,
        Teacher: true,
        SubjectNameMaster: true,
        GameStudent: {
          include: {
            Student: {
              select: {
                id: true,
                name: true,
                kana: true,
                attendanceNumber: true,
                gender: true,
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        Slide: {
          where: {active: true},
          include: {
            SlideAnswer: {include: {Student: true}},
          },
          orderBy: {sortOrder: 'asc'},
        },
        Group: {
          where: {active: true},
          include: {
            Squad: {
              include: {
                Student: true,
              },
            },
          },
        },
      },
    })

    return game
  }
}
