import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import type {AnalysisFormData, AnalysisResult} from '@app/(apps)/teamSynapse/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      userEmail,
      formData,
      analysisResult,
    }: {
      userId?: number
      userEmail?: string
      formData: AnalysisFormData
      analysisResult: AnalysisResult
    } = body

    if (!formData || !analysisResult) {
      return NextResponse.json({success: false, error: 'formDataとanalysisResultが必要です'}, {status: 400})
    }

    // 日付の変換
    const gmailDateFrom = formData.gmail.dateFrom ? new Date(formData.gmail.dateFrom) : null
    const gmailDateTo = formData.gmail.dateTo ? new Date(formData.gmail.dateTo) : null
    const chatDateFrom = formData.chat.dateFrom ? new Date(formData.chat.dateFrom) : null
    const chatDateTo = formData.chat.dateTo ? new Date(formData.chat.dateTo) : null

    // データベースに保存
    const saved = await prisma.teamSynapseAnalysis.create({
      data: {
        userId: userId || null,
        userEmail: userEmail || null,
        enabledServices: formData.enabledServices,
        gmailTargetEmails: formData.gmail.targetEmails,
        gmailDateFrom,
        gmailDateTo,
        chatRoomId: formData.chat.roomId || null,
        chatDateFrom,
        chatDateTo,
        driveFolderUrl: formData.drive.folderUrl || null,
        analysisResult: analysisResult as any, // JSON型として保存
      },
    })

    return NextResponse.json({
      success: true,
      id: saved.id,
      message: '分析結果を保存しました',
    })
  } catch (error) {
    console.error('分析結果の保存エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '分析結果の保存に失敗しました',
      },
      {status: 500}
    )
  }
}

// GET: 保存された分析結果の一覧取得
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = userId ? {userId: parseInt(userId)} : {}

    const [analyses, total] = await Promise.all([
      prisma.teamSynapseAnalysis.findMany({
        where,
        orderBy: {createdAt: 'desc'},
        take: limit,
        skip: offset,
        select: {
          id: true,
          userId: true,
          userEmail: true,
          enabledServices: true,
          gmailTargetEmails: true,
          gmailDateFrom: true,
          gmailDateTo: true,
          chatRoomId: true,
          chatDateFrom: true,
          chatDateTo: true,
          driveFolderUrl: true,
          analysisResult: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.teamSynapseAnalysis.count({where}),
    ])

    return NextResponse.json({
      success: true,
      data: analyses,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('分析結果の取得エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '分析結果の取得に失敗しました',
      },
      {status: 500}
    )
  }
}











