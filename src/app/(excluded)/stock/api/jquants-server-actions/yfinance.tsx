// export const getYahooFinanceStockInfo = async ({code}) => {
//   if (!code) {
//     return {success: false, message: 'codeが必要です'}
//   }

//   try {
//     const symbol = code.endsWith('.T') ? code : `${code}`
//     const res = await yahooFinance.quote(symbol)

//     const result = {...res}
//     return {success: true, result}
//   } catch (e: any) {
//     try {
//       // Yahooファイナンスの日本株は「7203.T」など末尾に「.T」が必要
//       const symbol = code.endsWith('.T') ? code : `${code}.T`
//       const res = await yahooFinance.quote(symbol)
//       const result = {
//         ...res,
//         code,
//       }
//     } catch (e: any) {
//       return {success: false, message: e.message || '取得に失敗しました'}
//     }
//   }
// }
