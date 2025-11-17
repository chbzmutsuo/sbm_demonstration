'use server'

import prisma from 'src/lib/prisma'

// 休日を全て取得
export const getAllHolidays = async () => {
  try {
    const holidays = await prisma.companyHoliday.findMany({
      orderBy: {holidayAt: 'asc'},
    })
    return {success: true, data: holidays}
  } catch (error) {
    console.error('休日の取得に失敗しました:', error)
    return {success: false, error: '休日の取得に失敗しました', data: []}
  }
}

// 休日を作成
export const createHoliday = async (data: {holidayAt: Date; holidayType: string; note: string | null}) => {
  try {
    const holiday = await prisma.companyHoliday.create({
      data,
    })
    return {success: true, data: holiday}
  } catch (error) {
    console.error('休日の作成に失敗しました:', error)
    return {success: false, error: '休日の作成に失敗しました'}
  }
}

// 休日を更新
export const updateHoliday = async (id: number, data: {holidayAt: Date; holidayType: string; note: string | null}) => {
  try {
    const holiday = await prisma.companyHoliday.update({
      where: {id},
      data,
    })
    return {success: true, data: holiday}
  } catch (error) {
    console.error('休日の更新に失敗しました:', error)
    return {success: false, error: '休日の更新に失敗しました'}
  }
}

// 休日を削除
export const deleteHoliday = async (id: number) => {
  try {
    await prisma.companyHoliday.delete({
      where: {id},
    })
    return {success: true}
  } catch (error) {
    console.error('休日の削除に失敗しました:', error)
    return {success: false, error: '休日の削除に失敗しました'}
  }
}
