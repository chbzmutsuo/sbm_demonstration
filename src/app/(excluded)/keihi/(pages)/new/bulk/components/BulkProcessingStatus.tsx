interface BulkProcessingStatusProps {
  status: string
}

export const BulkProcessingStatus = ({status}: BulkProcessingStatusProps) => {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <p className="text-blue-800 font-medium">{status}</p>
      </div>
    </div>
  )
}
