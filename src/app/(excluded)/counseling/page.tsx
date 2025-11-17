import {redirect} from 'next/navigation'

export default function CounselingPage() {
  // デフォルトでマスタ設定ページにリダイレクト
  redirect('/counseling/settings')
}


