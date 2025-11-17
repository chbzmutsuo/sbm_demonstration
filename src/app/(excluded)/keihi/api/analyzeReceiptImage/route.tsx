import {analyzeReceiptImage} from '@app/(excluded)/keihi/actions/expense/analyzeReceipt'
import {createBulkExpensesBasicReturn} from '@app/(excluded)/keihi/api/analyzeReceiptImage/fetchAnalyzeReceiptImage'
import {FileHandler} from '@cm/class/FileHandler'
import prisma from 'src/lib/prisma'
import {S3FormData} from '@cm/class/FileHandler'
import {NextRequest, NextResponse} from 'next/server'

export const POST = async (req: NextRequest) => {
  const body = await req.json()

  const imageDataList = body.imageDataList as string[]
  const fileNameList = (body.fileNameList as string[] | undefined) || []

  try {
    if (imageDataList.length === 0) {
      return NextResponse.json({success: false, error: '画像が選択されていません'}, {status: 400})
    }

    // 各画像を並列で解析
    const analysisResults = await Promise.all(
      imageDataList.map(async (imageData, index) => {
        const result = await analyzeReceiptImage(imageData)
        if (result.success && result.data) {
          return {
            ...result.data,
            imageIndex: index,
            imageData, // 画像データも保持
          }
        }
        return null
      })
    )

    const validResults = analysisResults.filter(result => result !== null)

    if (validResults.length === 0) {
      return NextResponse.json({success: false, error: 'すべての画像の解析に失敗しました'}, {status: 400})
    }

    // 基本情報のみでレコードを作成し、画像も添付ファイルとして保存
    const createdRecords = await Promise.all(
      validResults.map(async receiptData => {
        const errors: string[] = []
        let recordCreated = false
        let imageUploaded = false
        let expense: any = null

        try {
          // 経費レコードを作成
          expense = await prisma.keihiExpense.create({
            data: {
              date: new Date(receiptData.date),
              amount: receiptData.amount,
              mfSubject: receiptData.mfSubject,
              counterparty: receiptData.counterparty,
              participants: receiptData.suggestedCounterparties[0] || '',
              keywords: receiptData.generatedKeywords,
              conversationSummary: receiptData.conversationSummary,
              conversationPurpose: receiptData.suggestedPurposes,

              // インサイトは後で生成するため空文字で初期化

              autoTags: [],
              // MoneyForward用データ
              mfTaxCategory: '課仕 10%', // デフォルト値
            },
          })
          recordCreated = true
        } catch (recordError) {
          const errorMessage = recordError instanceof Error ? recordError.message : 'レコード作成に失敗しました'
          errors.push(`レコード作成エラー: ${errorMessage}`)
          console.error('レコード作成エラー:', recordError)
        }

        // 画像を添付ファイルとして保存（レコード作成が成功した場合のみ）
        if (recordCreated && expense) {
          try {
            // Base64データをBufferに変換してFileオブジェクトを作成
            const imageBuffer = Buffer.from(receiptData.imageData, 'base64')
            const timestamp = Date.now()
            const randomString = Math.random().toString(36).substring(2, 8)
            const generatedName = `receipt_${expense.id}_${timestamp}_${randomString}.jpg`

            // 元ファイル名（あれば使用）
            const originalName = fileNameList[receiptData.imageIndex] || generatedName

            // BufferからBlobを作成し、Fileオブジェクトにラップ
            const blob = new Blob([imageBuffer], {type: 'image/jpeg'})
            const file = new File([blob], originalName, {type: 'image/jpeg'})

            // S3アップロード用のフォームデータ
            const s3FormData: S3FormData = {
              bucketKey: 'keihi', // フォルダ名
            }

            // S3にアップロード
            const uploadResult = await FileHandler.sendFileToS3({
              file,
              formDataObj: s3FormData,
              validateFile: false, // Base64から作成したファイルなので検証をスキップ
            })

            if (uploadResult.success && uploadResult.result?.url) {
              // 添付ファイルレコードを作成
              const attachment = await prisma.keihiAttachment.create({
                data: {
                  filename: generatedName,
                  originalName,
                  mimeType: 'image/jpeg',
                  size: imageBuffer.length,
                  url: uploadResult.result.url,
                  keihiExpenseId: expense.id,
                },
              })

              imageUploaded = true
              console.log(`画像を添付ファイルとして保存しました: ${attachment.id}`)
            } else {
              const errorMessage = uploadResult.error || 'S3アップロードに失敗しました'
              errors.push(`画像アップロードエラー: ${errorMessage}`)
              console.error('画像のS3アップロードに失敗:', uploadResult.error)
            }
          } catch (imageError) {
            const errorMessage = imageError instanceof Error ? imageError.message : '画像保存に失敗しました'
            errors.push(`画像保存エラー: ${errorMessage}`)
            console.error('画像保存エラー:', imageError)
          }
        } else if (!recordCreated) {
          errors.push('レコード作成に失敗したため、画像アップロードをスキップしました')
        }

        return {
          id: expense?.id || `failed_${receiptData.imageIndex}`,
          date: receiptData.date,
          amount: receiptData.amount,
          mfSubject: receiptData.mfSubject,
          participants: receiptData.suggestedCounterparties[0] || '',
          keywords: receiptData.generatedKeywords,
          imageIndex: receiptData.imageIndex,
          recordCreated,
          imageUploaded,
          errors,
        }
      })
    )

    // 処理結果のサマリーを作成
    const summary = {
      totalImages: imageDataList.length,
      recordsCreated: createdRecords.filter(r => r.recordCreated).length,
      imagesUploaded: createdRecords.filter(r => r.imageUploaded).length,
      failedRecords: createdRecords.filter(r => !r.recordCreated).length,
      failedImages: createdRecords.filter(r => r.recordCreated && !r.imageUploaded).length,
    }

    const result: createBulkExpensesBasicReturn = {
      success: true,
      data: createdRecords,
      summary,
    }
    return NextResponse.json(result, {status: 200})
  } catch (error) {
    console.error('一括登録エラー:', error)
    const result: createBulkExpensesBasicReturn = {
      success: false,
      error: error instanceof Error ? error.message : '一括登録に失敗しました',
    }
    return NextResponse.json(result, {status: 500})
  }
}
