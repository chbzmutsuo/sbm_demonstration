import {chromium, Page} from 'playwright'
import fs from 'fs'

// 収集データを格納する配列
const allCompanies = []
// 処理済みの企業名を記録し、重複を防ぐ (サイトの仕様による)
const processedNames = new Set()

// サーバー負荷対策: 1.5〜3.5秒のランダムな待機
const randomWait = () => new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1500))

/**
 * 現在のページから企業情報を抽出し、配列に追加する
 */
async function scrapeCurrentPage(page: Page) {
  // 企業リストのアイテム要素セレクタ（例）
  const itemSelector = '.list-item-selector'
  await page.waitForSelector(itemSelector, {timeout: 10000})

  const items = await page.locator(itemSelector).all()

  for (const item of items) {
    try {
      const name = await item.locator('.company-name').innerText()
      // サイトによっては詳細ページに行かないとURLが取れない
      const detailLink = await item.locator('a.detail-link').getAttribute('href')

      // 重複チェック
      if (name && !processedNames.has(name)) {
        processedNames.add(name)
        allCompanies.push({
          companyName: name.trim(),
          // URLはドメイン補完が必要な場合がある
          url: new URL(detailLink, page.url()).href,
        })
      }
    } catch (e) {
      console.warn('一部のアイテム抽出に失敗しました。スキップします。')
    }
  }
}

/**
 * メイン処理
 */
;(async () => {
  const browser = await chromium.launch({headless: false}) // 開発中は false
  const page = await browser.newPage()

  // 1. 検索ページに移動
  await page.goto('https://example-database-site.com/search')

  // 2. 検索条件の入力 (例)
  await page.locator('#industry-select').selectOption({label: '情報通信業'})
  await page.locator('#area-input').fill('東京都')
  await page.locator('#search-button').click()

  // 3. ページネーションループ
  const nextButtonSelector = 'a.pagination-next:not(.disabled)' // 「次へ」ボタンのセレクタ（無効でない状態）

  try {
    while (true) {
      console.log(`処理中: ${page.url()}`)

      // 3-1. 現ページのデータを抽出
      await scrapeCurrentPage(page)

      // 3-2. サーバー負荷対策
      await randomWait()

      // 3-3. 「次へ」ボタンの存在確認
      const nextButton = page.locator(nextButtonSelector)
      if ((await nextButton.count()) === 0) {
        console.log('「次へ」ボタンが見つからないため、処理を終了します。')
        break // ループ終了
      }

      // 3-4. 「次へ」ボタンをクリック
      await nextButton.click()

      // 3-5. ページの遷移を待つ (重要)
      // ネットワークが落ち着くまで待つか、次のページの結果リストが表示されるまで待つ
      await page.waitForLoadState('networkidle', {timeout: 15000})
      // または
      // await page.waitForSelector(itemSelector, { timeout: 15000 });
    }
  } catch (error) {
    console.error('ページネーション処理中にエラーが発生しました。', error)
  } finally {
    // 4. 処理が正常終了してもエラー終了しても、データを保存
    if (allCompanies.length > 0) {
      const csvData = stringify(allCompanies, {header: true})
      fs.writeFileSync('company_list.csv', csvData)
      console.log(`${allCompanies.length} 件のリストを company_list.csv に保存しました。`)
    }

    await browser.close()
  }
})()
