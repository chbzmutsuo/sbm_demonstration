import type {CollectedMessage, AnalysisFormData} from '../types'
import {fetchGmailMessages, fetchChatMessages} from './google-apis'

// データ収集と整形（Step 0）
export const collectData = async (
  accessToken: string,
  formData: AnalysisFormData
): Promise<CollectedMessage[]> => {
  const allMessages: CollectedMessage[] = []

  // 有効なサービスからのみデータを取得
  if (formData.enabledServices.includes('gmail')) {
    console.log('Gmail取得開始...')
    const gmailMessages = await fetchGmailMessages(
      accessToken,
      formData.gmail.targetEmails,
      formData.gmail.dateFrom,
      formData.gmail.dateTo
    )
    allMessages.push(...gmailMessages)
    console.log(`Gmail: ${gmailMessages.length}件取得`)
  }

  if (formData.enabledServices.includes('chat') && formData.chat.roomId) {
    console.log('Chat取得開始...')
    const chatMessages = await fetchChatMessages(
      accessToken,
      formData.chat.roomId,
      formData.chat.dateFrom,
      formData.chat.dateTo,
      formData.gmail.targetEmails // Gmailで指定したアドレスをフィルタに使用
    )
    allMessages.push(...chatMessages)
    console.log(`Chat: ${chatMessages.length}件取得`)
  }

  // Driveは現時点ではUIのみ実装
  // if (formData.enabledServices.includes('drive') && formData.drive.folderUrl) {
  //   // TODO: Drive実装
  // }

  // 日付順にソート
  allMessages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  console.log(`合計: ${allMessages.length}件のメッセージを収集`)
  return allMessages
}

