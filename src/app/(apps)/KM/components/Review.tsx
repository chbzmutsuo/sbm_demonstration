'use client'

import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {UserCircleIcon} from 'lucide-react'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'

import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {cl} from '@cm/lib/methods/common'
import {CSSProperties, useEffect} from 'react'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

export const Review = () => {
  const {data: fetchedReviews} = useDoStandardPrisma(`kaizenReview`, `findMany`, {
    orderBy: [{createdAt: 'desc'}],
  })

  useEffect(() => {
    if (fetchedReviews && fetchedReviews.length === 0) {
      const transactionQueryList: transactionQuery<'kaizenReview', 'create'>[] = reviews.map(review => {
        return {
          method: 'create',
          model: 'kaizenReview',
          queryObject: {
            data: review,
          },
        }
      })
      doTransaction({transactionQueryList})
    }
  }, [fetchedReviews])

  if (!fetchedReviews) return <PlaceHolder />
  return (
    <>
      <div className={`min-h-[100vh] w-[100vw] overflow-auto `}>
        <div>
          {fetchedReviews
            .sort((a, b) => {
              return Math.random() - 0.5
            })
            .map((review, i) => {
              const {username, platform, review: content} = review
              const randomX = Math.max(Math.floor(Math.random() * (window.innerWidth - 300)), 0)
              const randomY = Math.max(Math.floor(Math.random() * window.innerHeight - 300), 100)

              const style: CSSProperties = {
                position: 'absolute',
                left: `${randomX}px`,
                top: `${randomY}px`,
                animationDelay: `${i * 3}s`,
              }

              const colorClasses = i % 2 === 0 ? `bg-blue-50 border-blue-main` : `bg-yellow-50 border-yellow-main`

              return (
                <div
                  key={i}
                  className={cl(
                    `animate-[hoverUp-and-vanish_10S_ease-in-out] opacity-0`,
                    colorClasses,
                    `  w-[300px] rounded-lg border-2  p-2 shadow-md `
                  )}
                  style={style}
                >
                  <C_Stack className={`justify-between`}>
                    <R_Stack>
                      <UserCircleIcon className={`w-[30px]`} />
                      <span className={`   text-lg font-bold text-gray-500`}>{username}</span> <span>様</span>
                    </R_Stack>
                    <small>{platform}</small>
                  </C_Stack>
                  <div>{content}</div>
                </div>
              )
            })}
        </div>
      </div>
    </>
  )
}
const reviews = [
  {
    platform: 'ココナラ',
    username: '匿名男性',
    review:
      'freee（会計）とインストール型のcloud販売管理ソフトとのAPI連携をお願いしました。\nインストール型のソフトから、売上を吐き出してfreeeに取り込むという、初めての試みでしたので、丁寧で、さわやかに対応して頂き、非常に安心できました。\n会計と販売管理（売上）の連携をする際のトリガーになる概念が定まらす、こちらからお願いする要項がまとまらなかったのですが、試行錯誤を一緒にして頂き、頭が下がりる思いです。\nインストール型のソフトがテキストでしか取り込めず、freeeに取り込むひな形に置き換える作業も同時にお願いをしております。\n今作業は仕上げの状態に入っており、完成品を心待ちにしております。',
  },
  {platform: 'ココナラ', username: '匿名男性', review: 'あ'},
  {
    platform: 'ココナラ',
    username: 'ばにゃにゃ',
    review:
      'この度はありがとうございました。\n\n文章では絶対伝わらないであろうニュアンスも、ビデオ通話で事前にご相談できるので、とても安心してお願いできました。\n相談しやすいお人柄で、解説も的確でわかりやすく、まさにムダがありませんでした。笑\n\nまた、こちらでは思いつかなかった問題の解決策も提案してくださり、感動致しました。\n\nお仕事やルーティンワークで少しでもムダを省きたいと思っている方は、悩む前に今すぐ相談される事をオススメします！ ',
  },
  {
    platform: 'ココナラ',
    username: '井口 武俊',
    review:
      '今回も丁寧なシステムのご説明ありがとうございました。\n今後の本格運用に向けて，より実践的な段階まできていることを実感しております。\n埼玉県の某市から本システムの説明をした際に，学習での取り組みに導入してみたいと問い合わせがありました。\n活用しやすいよう，再度検討を重ねていければと思います。\nどうぞ，引き続きよろしくお願いいたします。 ',
  },
  {
    platform: 'ココナラ',
    username: 'makana0401',
    review:
      'お客様目線でとても丁寧に対応してくださいました。その場ですぐに実践していただき、今回は実用的には難しい形にはなりましたが、短時間で実行可能か判断していただけただけでも大変有り難かったです。お客さまへの誠心誠意が伝わってきたので、ぜひ別案件でお願いする際は再度お声かけをぜひしたいと思いました。\n今後ともよろしくお願いいたします。 ',
  },
  {
    platform: 'ココナラ',
    username: 'hirokikoumura',
    review:
      '事前にお伝えしていた動作が的確にプログラムに反映されていました。\nまた、動作確認しながらその場で追加や変更のお願いをしましたが、変更内容を快諾してくださり、すぐに実行していただきました。\n\n万が一動作不良があった場合もアフターサポートに応じていただけるとのお言葉をいただき、安心感をもってクロージングすることができました。 ',
  },
  {
    platform: 'ココナラ',
    username: '匿名女性',
    review:
      'コチラからのざっくりとしたイメージ共有を的確にカタチに落とし込んでいただけて、とてもスムーズに進めることができました。\n納品物もクオリティ高く、予定の納期で作っていただけて満足です。\n今後セルフで使っていけるように納品時に丁寧にレクチャーまでいただき感謝しております。\nまた宜しくお願いします。 \n',
  },
  {
    platform: 'ココナラ',
    username: '福永 健二\n\n',
    review:
      '大変丁寧で対応も早く、こちらの難しい要望をできるだけ叶えてくれようとする姿勢、そしてそれを叶えてくれるスキルもあり大変安心して取引が出来ました。\n\n現在別案件も進行中ですが大変満足しております。\n\nスプレッドシートのスキルも申し分なく安心して取引できる方です。\n\nありがとうございました。 ',
  },
  {
    platform: 'ココナラ',
    username: 'nishaan1985',
    review:
      'こちらの要望を汲んでくださるだけでなくプラスアルファの改善提案もいただき、とても気持ちの良い取引ができました！\n改善マニア様自身も成長意欲が強い方で、経営者や個人事業主の方からすると、とても頼れるパートナーになりうる方だと思います。おすすめです！\n今後ともどうぞよろしくお願い致します！ ',
  },
  {
    platform: 'ココナラ',
    username: '匿名女性',
    review:
      'この度は自動化ツールの作成ありがとうございました！\n細かい部分まで調整して頂き、本当に助かりました。\nお陰で今後の活動がスムーズになりそうです。\n今回頼んだ件以外にも、もう少し便利にしたい部分などもありますので改めてご相談させてください。\n\nどうぞよろしくお願い致します！ ',
  },
  {
    platform: 'ココナラ',
    username: 'シン・不動産投資',
    review:
      'とても丁寧かつ詳細な対応でした。\nご自身の経歴や経験をもとに、私のやりたいことを明確に理解し、アドバイス頂けたました。\n今回は相談だけでしたが、実際に作業頂く際にも安心してコミュニケーションできると感じました。\n次回は作業をお願いしたく思っております。 ',
  },
  {
    platform: 'ココナラ',
    username: 'GATY',
    review:
      '最初から最後までスピーディーかつ、的確にご連絡いただき\n終始、安心してお任せすることができました。\nおかげさまで、仕事の効率が10倍ほどアップしそうです。\n引き続き別の案件でもお世話になりますので\n今後ともどうぞよろしくお願いいたします。 ',
  },
  {
    platform: 'ココナラ',
    username: '匿名男性',
    review:
      '素晴らしい、安定感のある、安心できる応対でした。\nまた今後もお仕事を依頼させていただきたいと思っています。\nこちらの都合に合わせて、柔軟に応じてくださりありがとうございました。\n\n価格対効果がすばらしく良いです。おすすめできます。 ',
  },
  {
    platform: 'ココナラ',
    username: '京大卒家庭教師　うだゆか',
    review:
      'とても迅速に、使いやすいシステムを作っていただきました！\n本当にありがとうございます。\nまた注文前のやり取りや納品時のご説明も、とても丁寧でわかりやすかったです。\n\n何か自動化したい作業がある方に、とてもオススメです！ ',
  },
  {
    platform: 'ココナラ',
    username: '匿名男性',
    review:
      '最初の相談時からとても丁寧に話を聞いて下さり、\n初歩的な質問にもとても親切にご対応いただきました。\n又、最後まで希望に沿うよう細かな所も改善していただく等とても満足のいく取引でした。\nありがとうございました。 ',
  },
  {
    platform: 'ココナラ',
    username: 'くるみぽや',
    review:
      '予想をはるかに超えて満足です。こちら側の意図を汲み取り、わかりやすく説明しながら問題をクリアにしてくれました。能力だけでなく、お人柄も抜群の方です。GASで困ったら絶対また改善マニアさんに相談します。 ',
  },
  {
    platform: 'ココナラ',
    username: 'honoka__m',
    review:
      '非常に良い取引ができました。\n納期スピードや細かな提案もして迅速にご対応していただけました。\n\nサポートも素晴らしくわからない点なども詳しくご相談できました。\n今後ともよろしくお願いいたします。 ',
  },
  {
    platform: 'ココナラ',
    username: '',
    review:
      '初めてのAPIによる連携だったので、実現できるか不安でしたが、納品されこんなに簡単にインポートの自動化が、できました。動画による取り扱い説明も頂き、満足しております。\nまた宜しくお願いします。 ',
  },
  {
    platform: 'ココナラ',
    username: 'AsaSeik',
    review:
      '商品の説明がわかりやすく、プロならではの視点で\nアドバイスをくださいます。\n\nお任せすることで、無駄な作業時間を大幅に削減削減できる事は間違いないです。\n\n本当に、ありがとうございました。 ',
  },
  {
    platform: 'ココナラ',
    username: 'いったくん',
    review:
      'この度はありがとうございました。\n丁寧な対応で多くの提案を頂きまして、こちらの希望している以上のものが納品され大満足で感謝しております。\n今後も引き続きよろしくお願いいたします。',
  },
  {
    platform: 'ココナラ',
    username: ' M Satsuki',
    review:
      'どうもありがとうございました！\n非常に丁寧なやりとりで、ビデオチャットもわかりやすく説明いただき、安心できる取引でした！！＾＾\nまた違うお仕事をすぐにお願いしたいと思いました！',
  },
  {
    platform: 'ココナラ',
    username: '本間トモハル',
    review:
      '出来上がったものを担当者へ見せたところ大変感激しておりました！\nスピーディーに対応して頂きとても助かりました！ありがとうございました♪ ',
  },
]
