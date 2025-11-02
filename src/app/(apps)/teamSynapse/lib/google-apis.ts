import type {CollectedMessage, AnalysisFormData} from '../types'

// Gmail APIからメッセージを取得
export const fetchGmailMessages = async (
  accessToken: string,
  formData: AnalysisFormData
): Promise<CollectedMessage[]> => {
  const messages: CollectedMessage[] = []

  try {
    // メール検索クエリの構築
    const emailQueries = formData.targetEmails
      .map(email => `(from:${email} OR to:${email} OR cc:${email})`)
      .join(' OR ')
    const query = `${emailQueries} after:${formData.dateFrom.replace(/-/g, '/')} before:${formData.dateTo.replace(/-/g, '/')}`

    // メッセージIDリストの取得
    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=500`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!listResponse.ok) {
      throw new Error(`Gmail API Error: ${listResponse.statusText}`)
    }

    const listData = await listResponse.json()
    const messageIds = listData.messages || []

    // 各メッセージの詳細を取得
    for (const {id} of messageIds) {
      const messageResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!messageResponse.ok) continue

      const messageData = await messageResponse.json()
      const headers = messageData.payload?.headers || []
      const getHeader = (name: string) =>
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

      // 本文の取得
      let body = ''
      if (messageData.payload?.body?.data) {
        body = atob(messageData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
      } else if (messageData.payload?.parts) {
        const textPart = messageData.payload.parts.find(
          (part: any) => part.mimeType === 'text/plain'
        )
        if (textPart?.body?.data) {
          body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'))
        }
      }

      // HTMLタグの除去（簡易的な処理）
      body = body.replace(/<[^>]*>/g, '').trim()

      messages.push({
        source: 'gmail',
        id: messageData.id,
        date: new Date(parseInt(messageData.internalDate)).toISOString(),
        from: getHeader('from'),
        to: getHeader('to'),
        body,
      })
    }
  } catch (error) {
    console.error('Gmail取得エラー:', error)
    throw error
  }

  return messages
}

// Google Drive APIからドキュメントのテキストを取得
export const fetchDriveDocuments = async (
  accessToken: string,
  fileIds: string[]
): Promise<CollectedMessage[]> => {
  const documents: CollectedMessage[] = []

  for (const fileId of fileIds) {
    try {
      // ファイルのメタデータを取得
      const metadataResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,modifiedTime`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!metadataResponse.ok) continue
      const metadata = await metadataResponse.json()

      // Google DocsまたはSlidesのみ処理
      if (
        !metadata.mimeType.includes('document') &&
        !metadata.mimeType.includes('presentation')
      ) {
        continue
      }

      // テキストとしてエクスポート
      const exportResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!exportResponse.ok) continue
      const text = await exportResponse.text()

      documents.push({
        source: 'drive_docs',
        id: metadata.id,
        date: metadata.modifiedTime,
        title: metadata.name,
        body: text,
      })
    } catch (error) {
      console.error(`Drive document ${fileId} 取得エラー:`, error)
    }
  }

  return documents
}

// Google Chat APIからメッセージを取得
export const fetchChatMessages = async (
  accessToken: string,
  formData: AnalysisFormData
): Promise<CollectedMessage[]> => {
  if (!formData.chatRoomId) return []

  const messages: CollectedMessage[] = []

  try {
    // Chat APIでメッセージを取得
    const startTime = new Date(formData.dateFrom).toISOString()
    const endTime = new Date(formData.dateTo).toISOString()
    const filter = `createTime >= "${startTime}" AND createTime <= "${endTime}"`

    const response = await fetch(
      `https://chat.googleapis.com/v1/${formData.chatRoomId}/messages?filter=${encodeURIComponent(filter)}&pageSize=1000`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      console.error('Chat API Error:', response.statusText)
      return messages
    }

    const data = await response.json()
    const chatMessages = data.messages || []

    for (const message of chatMessages) {
      // 対象メールアドレスに関連するメッセージのみフィルタ
      const senderEmail = message.sender?.email || ''
      const isRelevant = formData.targetEmails.some(email =>
        senderEmail.toLowerCase().includes(email.toLowerCase())
      )

      if (isRelevant) {
        messages.push({
          source: 'chat',
          id: message.name,
          date: message.createTime,
          from: senderEmail,
          body: message.text || '',
        })
      }
    }
  } catch (error) {
    console.error('Chat取得エラー:', error)
  }

  return messages
}

