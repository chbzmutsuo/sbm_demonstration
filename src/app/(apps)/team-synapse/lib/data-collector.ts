import type {CollectedMessage, AnalysisFormData} from '../types'
import {fetchGmailMessages, fetchDriveDocuments, fetchChatMessages} from './google-apis'

// データ収集と整形（Step 0）
export const collectData = async (
  accessToken: string,
  formData: AnalysisFormData
): Promise<CollectedMessage[]> => {
  const allMessages: CollectedMessage[] = []

  // 1. Gmailからメッセージを取得
  console.log('Gmail取得開始...')
  const gmailMessages = await fetchGmailMessages(accessToken, formData)
  allMessages.push(...gmailMessages)
  console.log(`Gmail: ${gmailMessages.length}件取得`)

  // 2. Gmail添付のDriveファイルIDを抽出（簡易実装）
  // 実際にはGmailメッセージからDriveリンクを解析する必要がある
  // ここではスキップし、必要に応じて拡張可能にする

  // 3. Google Chatからメッセージを取得
  if (formData.chatRoomId) {
    console.log('Chat取得開始...')
    const chatMessages = await fetchChatMessages(accessToken, formData)
    allMessages.push(...chatMessages)
    console.log(`Chat: ${chatMessages.length}件取得`)
  }

  // 日付順にソート
  allMessages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  console.log(`合計: ${allMessages.length}件のメッセージを収集`)
  return allMessages
}

