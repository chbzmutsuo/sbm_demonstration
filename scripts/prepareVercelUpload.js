/* eslint-disable no-undef */

const freePlanApps = []

const readline = require('readline')
const fs = require('fs')
const path = require('path')
const input = process.stdin
const output = process.stdout
const rl = readline.createInterface({input, output})

rl.question('appNameを入力してください: ', answer => {
  if (answer) {
    rl.close()
    asyncFunction(answer)
  } else {
    console.log('処理をキャンセルしました')
    rl.close()
  }
})

const asyncFunction = async appName => {
  if (!appName) {
    console.error('エラー: appName is required')
    return
  }
  await removeVercelFile()

  let targetAppNames = [appName]
  if (appName === `KM`) {
    targetAppNames = [`KM`, `kickswrap`, 'stock', 'keihi', 'aidocument', `edu`]
  }

  console.log({targetAppNames})

  await switchVercelIgnore({targetAppNames})

  const isFreePlan = targetAppNames.some(appName => freePlanApps.includes(appName))
  console.log({isProplan: !isFreePlan})
  await setVercelJson({isFreePlan})
}

const removeVercelFile = async () => {
  const dot_vercel_path = path.join('.vercel')
  const fileExists = await fs.existsSync(dot_vercel_path)
  if (fileExists) {
    await fs.rm(dot_vercel_path, {recursive: true}, () => {
      console.log('removed .vercel')
    })
  } else {
    console.log('.vercel does not exist')
  }
}

const switchVercelIgnore = async ({targetAppNames}) => {
  const filePath = path.join('.vercelIgnore')
  const file = await fs.readFileSync(filePath, 'utf8')
  const lineArr = file.split('\n')
  const startLineIndx = lineArr.findIndex(line => line === `#ignoreを選択`)
  const restLinesCount = lineArr.length - startLineIndx
  const apps = lineArr.slice(startLineIndx + 1, startLineIndx + 1 + restLinesCount).filter(line => line)

  const putComments = apps
    .map(app => {
      app = app.replace(/#/g, '')
      const isHit = targetAppNames.includes(app.replace(`src/app/**/`, ``))
      if (isHit) {
        return `#${app}`
      } else {
        return app
      }
    })
    .sort((a, b) => (a.includes(`#`) ? 1 : -1))

  lineArr.splice(startLineIndx + 1, restLinesCount, ...putComments)

  await fs.writeFileSync(filePath, lineArr.join('\n'))
}

const setVercelJson = async ({isFreePlan}) => {
  const dot_vercel_path = path.join('vercel.json')
  const fileExists = await fs.existsSync(dot_vercel_path)
  const content = ProPlanVercelJson
  if (isFreePlan) {
    delete content[`functions`]
  }

  if (fileExists) {
    await fs.writeFileSync(dot_vercel_path, JSON.stringify(content))
  }
}
const ProPlanVercelJson = {
  framework: 'nextjs',
  installCommand: 'npm install',
  devCommand: 'next dev',
  buildCommand: 'npx prisma generate && next build --no-lint',
  cleanUrls: true,
  regions: ['sin1'],
  trailingSlash: false,
  crons: [
    {
      path: '/sohken/api/cron/refreshGoogleCalendar',
      schedule: '0 */3 * * *',
    },

    {
      path: '/stock/api/cron/4_dailyBatchAll',
      schedule: '0 22 * * *',
    },
  ],
  build: {
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
    },
  },
}
