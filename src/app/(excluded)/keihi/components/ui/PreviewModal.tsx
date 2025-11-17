'use client'

import {X} from 'lucide-react'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  fileName: string
}

export const PreviewModal = ({isOpen, onClose, imageUrl, fileName}: PreviewModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{fileName}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 max-h-[calc(90vh-80px)] overflow-auto">
          <img src={imageUrl} alt={fileName} className="max-w-full max-h-full object-contain mx-auto" />
        </div>
      </div>
    </div>
  )
}
