import {useState, useCallback} from 'react'
import {toast} from 'react-toastify'
import {filterImageFiles, filesToBase64} from '../utils'

export const useImageUpload = () => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [capturedImageFiles, setCapturedImageFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const processFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      toast.error('画像ファイルを選択してください')
      return
    }

    setIsProcessing(true)

    try {
      const imageFiles = filterImageFiles(files)

      if (imageFiles.length === 0) {
        toast.error('画像ファイルが含まれていません')
        return
      }

      if (imageFiles.length !== files.length) {
        toast.warning(`${files.length - imageFiles.length}個の非画像ファイルをスキップしました`)
      }

      // Base64変換
      const base64Images = await filesToBase64(imageFiles)

      // 状態を更新
      setCapturedImageFiles(prev => [...prev, ...imageFiles])
      setUploadedImages(prev => [...prev, ...base64Images])

      toast.success(`${imageFiles.length}枚の画像を追加しました`)

      return {
        imageFiles,
        base64Images,
      }
    } catch (error) {
      console.error('画像処理エラー:', error)
      toast.error('画像の処理に失敗しました')
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    setCapturedImageFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearImages = useCallback(() => {
    setUploadedImages([])
    setCapturedImageFiles([])
  }, [])

  return {
    uploadedImages,
    capturedImageFiles,
    isProcessing,
    processFiles,
    removeImage,
    clearImages,
  }
}
