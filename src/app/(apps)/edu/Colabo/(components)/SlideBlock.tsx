'use client'

import {useState, useEffect, useRef} from 'react'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'

export const SlideBlock = ({
  block,
  isPreview = false,
  onContentChange,
  onEditingChange,
}: {
  block: any
  isPreview?: boolean
  onContentChange?: (content: string) => void
  onEditingChange?: (isEditing: boolean) => void
}) => {
  const {
    blockType,
    content,
    imageUrl,
    linkUrl,
    alignment = 'left',
    verticalAlign = 'top',
    textColor,
    backgroundColor,
    fontWeight,
    textDecoration,
    fontSize,
    isCorrectAnswer,
  } = block

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(content || '')
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditValue(content || '')
  }, [content])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select()
      }
    }
  }, [isEditing])

  const handleSave = () => {
    if (onContentChange) {
      onContentChange(editValue)
    }
    setIsEditing(false)
    if (onEditingChange) {
      onEditingChange(false)
    }
  }

  const handleCancel = () => {
    setEditValue(content || '')
    setIsEditing(false)
    if (onEditingChange) {
      onEditingChange(false)
    }
  }

  const handleStartEditing = () => {
    if (!isPreview) {
      setIsEditing(true)
      if (onEditingChange) {
        onEditingChange(true)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escapeキーで編集をキャンセル
    if (e.key === 'Escape') {
      handleCancel()
    }
    // Enterキーは改行として扱う（デフォルト動作を許可）
    // Shift+Enterも改行として扱う
  }

  const getAlignmentClass = () => {
    switch (alignment) {
      case 'center':
        return 'justify-center'
      case 'right':
        return 'justify-end'
      default:
        return 'justify-start'
    }
  }

  const getVerticalAlignClass = () => {
    switch (verticalAlign) {
      case 'middle':
        return 'flex items-center'
      case 'bottom':
        return 'flex items-end'
      default:
        return 'flex items-start'
    }
  }

  const getTextStyle = () => ({
    color: textColor || 'inherit',
    backgroundColor: backgroundColor || 'transparent',
    fontWeight: fontWeight || 'normal',
    textDecoration: textDecoration || 'none',
    fontSize: fontSize ? `${fontSize}px` : undefined,
  })

  const containerClass = `${getAlignmentClass()} ${getVerticalAlignClass()}  p-2`

  if (blockType === 'text') {
    return (
      <div className={containerClass} style={getTextStyle()}>
        {isPreview ? (
          <MarkDownDisplay>{content}</MarkDownDisplay>
        ) : isEditing ? (
          <div className="w-full">
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={e => {
                console.log(e, 'blue') //logs
                handleSave()
              }}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[60px] border-2 border-blue-500 rounded p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              style={getTextStyle()}
              rows={4}
            />
          </div>
        ) : (
          <div className="w-full relative">
            <div
              className="border rounded p-2  bg-gray-50 cursor-text hover:border-blue-400 transition-colors"
              onClick={handleStartEditing}
            >
              {content ? (
                <MarkDownDisplay>{content}</MarkDownDisplay>
              ) : (
                <span className="text-gray-400">テキストを入力してください</span>
              )}
            </div>
            <div className="text-[10px] text-gray-500 absolute -bottom-3 right-0">テキストブロック</div>
          </div>
        )}
      </div>
    )
  }

  if (blockType === 'image') {
    return (
      <div className={containerClass}>
        {imageUrl ? (
          <img src={imageUrl} alt={content || 'スライド画像'} className="max-w-full h-auto rounded" style={getTextStyle()} />
        ) : (
          !isPreview && (
            <div className="w-full relative">
              <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center text-gray-400">
                画像URLを設定してください
              </div>
              <div className="text-[10px] text-gray-500 absolute -bottom-3 right-0">画像ブロック</div>
            </div>
          )
        )}
      </div>
    )
  }

  if (blockType === 'link') {
    const {color, backgroundColor, fontWeight, textDecoration} = getTextStyle()
    const noColorStyle = color === '#000000' && backgroundColor === '#ffffff'
    return (
      <div className={containerClass}>
        {isEditing && !isPreview ? (
          <div className="w-full">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={handleSave}
              // onKeyDown={handleKeyDown}
              className="w-full border-2 border-blue-500 rounded p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={getTextStyle()}
              placeholder="リンクテキスト"
            />
          </div>
        ) : linkUrl ? (
          <T_LINK
            href={linkUrl}
            target="_blank"
            style={{
              color: noColorStyle ? 'blue' : color,
              backgroundColor: noColorStyle ? 'transparent' : backgroundColor,
              fontWeight: fontWeight ?? 'normal',
              textDecoration: textDecoration ?? 'none',
              borderBottom: '1px solid blue',
            }}
            onClick={e => {
              if (!isPreview) {
                e.preventDefault()
                handleStartEditing()
              }
            }}
            className={!isPreview ? 'cursor-text' : ''}
          >
            {content || linkUrl}
          </T_LINK>
        ) : (
          !isPreview && (
            <div className="w-full relative">
              <div
                className="border rounded p-2 bg-gray-50 text-gray-400 cursor-text hover:border-blue-400 transition-colors"
                onClick={handleStartEditing}
              >
                <T_LINK href={linkUrl}>リンクURLを設定してください</T_LINK>
              </div>
              <div className="text-[10px] text-gray-500 absolute -bottom-3 right-0">リンクブロック</div>
            </div>
          )
        )}
      </div>
    )
  }

  if (blockType === 'quiz_question') {
    return (
      <div className={containerClass}>
        <div className="w-full">
          {!isPreview && <div className="text-sm text-gray-600 mb-1">クイズ問題</div>}
          <div className={isPreview ? 'text-xl font-bold' : 'border rounded p-3 bg-blue-50'} style={getTextStyle()}>
            {content ? (
              <MarkDownDisplay>{content}</MarkDownDisplay>
            ) : (
              !isPreview && <span className="text-gray-400">問題文を入力してください</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (blockType === 'choice_option') {
    return (
      <div className={containerClass}>
        <div className="w-full">
          {!isPreview && (
            <div className="text-sm text-gray-600 mb-1">
              選択肢 {isCorrectAnswer && <span className="text-green-600">(正解)</span>}
            </div>
          )}
          <div
            className={`
              ${isPreview ? 'border-2 rounded-lg p-3 cursor-pointer hover:bg-gray-50' : 'border rounded p-2 bg-gray-50'}
              ${isCorrectAnswer && isPreview ? 'border-green-400' : 'border-gray-300'}
            `}
            style={getTextStyle()}
          >
            {content ? (
              <MarkDownDisplay>{content}</MarkDownDisplay>
            ) : (
              !isPreview && <span className="text-gray-400">選択肢を入力してください</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      <div className="text-gray-400">未知のブロックタイプ: {blockType}</div>
    </div>
  )
}
