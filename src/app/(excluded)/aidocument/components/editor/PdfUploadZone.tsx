'use client'

import {useState, useRef} from 'react'
import {UploadCloud, Loader2} from 'lucide-react'
import {Button} from '@cm/components/styles/common-components/Button'

interface PdfUploadZoneProps {
  onPdfUpload: (file: File) => void
  loading: boolean
}

export default function PdfUploadZone({onPdfUpload, loading}: PdfUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onPdfUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onPdfUpload(e.target.files[0])
    }
  }

  return (
    <div
      className={`flex flex-col items-center justify-center w-full aspect-[210/297] max-w-4xl mx-auto rounded-lg border-2 border-dashed transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-400 bg-gray-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input type="file" ref={inputRef} accept="application/pdf" className="hidden" onChange={handleChange} />
      {loading ? (
        <>
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="mt-2 text-sm text-gray-600">アップロード中...</p>
        </>
      ) : (
        <>
          <UploadCloud className="w-10 h-10 text-gray-500" />
          <p className="mt-2 text-sm text-gray-600">【下地】PDFファイルをドラッグ＆ドロップ</p>
          <p className="text-xs text-gray-500 mb-2">または</p>
          <Button onClick={() => inputRef.current?.click()}>ファイルを選択</Button>
        </>
      )}
    </div>
  )
}
