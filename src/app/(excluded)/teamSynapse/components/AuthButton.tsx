import React from 'react'

type AuthButtonProps = {
  onSignIn: () => void
}

const AuthButton: React.FC<AuthButtonProps> = ({onSignIn}) => {
  return (
    <button
      onClick={onSignIn}
      className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
    >
      Googleアカウントで認証
    </button>
  )
}

export default AuthButton

