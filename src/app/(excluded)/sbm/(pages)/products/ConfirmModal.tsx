// 確認モーダル
export const DeleteConfirmModal = ({
  title,
  message,
  onConfirm,
  onClose,
}: {
  title: string
  message: string
  onConfirm: () => void
  onClose: () => void
}) => (
  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 mb-6">{message}</p>
    <div className="flex justify-end space-x-3">
      <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
        キャンセル
      </button>
      <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
        削除
      </button>
    </div>
  </div>
)
