// import {Prisma, TbmBase_MonthConfig} from '@prisma/client'
// type data = Prisma.TbmRefuelHistoryGroupByOutputType
// export default class FuelHistoryCl {
//   data: data

//   constructor(TbmRefuelHistory) {
//     this.data = TbmRefuelHistory
//   }

//   getNenpiData(TbmBase_MonthConfig: TbmBase_MonthConfig) {
//     const totalSokoKyori = this.data._max.odometer ?? 0
//     const totalKyuyu = this.data._sum?.amount ?? 0
//     const avgNempi = totalSokoKyori / totalKyuyu
//     const fuelCost = avgNempi * (TbmBase_MonthConfig?.keiyuPerLiter ?? 0)

//     return {
//       totalSokoKyori,
//       totalKyuyu,
//       avgNempi,
//       fuelCost,
//     }
//   }
// }
