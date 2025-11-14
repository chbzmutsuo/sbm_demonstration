import React from 'react'

export const TableSkelton = ({colCount = 3}) => {
  // スケルトンセルコンポーネント

  // ローディング中のスケルトン表示

  return (
    <div className="hidden md:block w-full overflow-hidden max-w-[70vw] mx-auto ">
      <div className="bg-white p-4">
        <div className="animate-pulse flex space-x-4 mb-4">
          <div className="h-6 bg-gray-200 rounded-sm w-[80%] mx-auto"></div>
        </div>

        <div className="border-t border-gray-200">
          <div className="bg-gray-50 px-4 py-3 flex">
            {[...Array(colCount)].map((_, i) => (
              <div key={`header-${i}`} className="flex-1 px-2">
                <div className="h-4 bg-gray-300 rounded-sm w-3/4"></div>
              </div>
            ))}
          </div>

          {new Array(20).fill(0).map((_, row) => (
            <div key={`row-${row}`} className="border-t border-gray-200 px-4 py-4 flex">
              {[...Array(colCount)].map((_, col) => (
                <div key={`cell-${row}-${col}`} className="flex-1 px-2">
                  <SkeletonCell />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const SkeletonCell = () => <div className="h-4 bg-gray-200 rounded-sm animate-pulse w-full"></div>

// export const SkeltonTr = ({children}) => {
//   return <tr className="border-t border-gray-200 px-4 py-4 flex">{children}</tr>
// }
