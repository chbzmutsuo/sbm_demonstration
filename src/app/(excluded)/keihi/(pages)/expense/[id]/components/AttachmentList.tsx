'use client'

import {AttachmentRecord} from '../../../../types'
import {formatFileSize} from '../../../../utils'
import {Eye, Download} from 'lucide-react'

interface AttachmentListProps {
  attachments: AttachmentRecord[]
  onPreviewImage: (imageUrl: string, fileName: string) => void
}

export const AttachmentList = ({attachments, onPreviewImage}: AttachmentListProps) => {
  if (attachments.length === 0) return null

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">添付ファイル</h2>
      <div className="space-y-2">
        {attachments.map(attachment => {
          const isImage = attachment.mimeType.startsWith('image/')

          return (
            <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {/* ファイルアイコン */}
                <div className="flex-shrink-0">
                  {isImage ? (
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* ファイル情報 */}
                <div>
                  <p className="font-medium text-gray-900">{attachment.originalName}</p>
                  <p className="text-sm text-gray-600">
                    {attachment.mimeType} • {formatFileSize(attachment.size)}
                  </p>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex items-center gap-2">
                {isImage && (
                  <button
                    type="button"
                    onClick={() => onPreviewImage(attachment.url, attachment.originalName)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                    title="プレビュー"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                  title="ダウンロード"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
