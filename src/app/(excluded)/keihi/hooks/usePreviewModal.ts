import {useState, useCallback} from 'react'
import {PreviewModalState} from '../types'

export const usePreviewModal = () => {
  const [modalState, setModalState] = useState<PreviewModalState>({
    isOpen: false,
    imageUrl: '',
    fileName: '',
  })

  const openModal = useCallback((imageUrl: string, fileName: string) => {
    setModalState({
      isOpen: true,
      imageUrl,
      fileName,
    })
  }, [])

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      imageUrl: '',
      fileName: '',
    })
  }, [])

  return {
    modalState,
    openModal,
    closeModal,
  }
}
