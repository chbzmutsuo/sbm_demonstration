'use client'

import React from 'react'
import {SeedDataButton} from '../../(components)/Settings/SeedDataButton'

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">設定</h1>

        <div className="space-y-8">
          {/* テストデータ生成セクション */}
          <section className="border-b border-slate-200 pb-6">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">テストデータ</h2>
            <div className="space-y-4">
              <p className="text-slate-600">トレーニングアプリのテスト用データを生成します。以下のデータが作成されます：</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>種目マスタ（胸、背中、肩、腕、足、有酸素の各カテゴリ）</li>
                <li>過去3ヶ月分のトレーニング記録（ランダムな日付と強度・回数）</li>
              </ul>

              <div className="mt-6">
                <SeedDataButton />
              </div>
            </div>
          </section>

          {/* その他の設定セクション（将来的な拡張用） */}
          <section>
            <h2 className="text-xl font-semibold text-slate-700 mb-4">アプリ設定</h2>
            <p className="text-slate-500 italic">現在設定可能な項目はありません。今後のアップデートをお待ちください。</p>
          </section>
        </div>
      </div>
    </div>
  )
}
