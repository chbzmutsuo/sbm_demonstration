import {createUnkoMeisaiRow} from '@app/(apps)/tbm/(class)/TbmReportCl/cols/createUnkoMeisaiRow'
const copyFunction = <T, R>(callBack: (props: T) => Promise<R>): ((props: T) => Promise<R>) => {
  return async (props: T) => {
    return await callBack(props)
  }
}

export class TbmReportCl {
  constructor(private readonly tbmBaseId: string) {}

  static allowNonApprovedSchedule = false
  static reportCols = {
    createUnkoMeisaiRow,
  }

  static getKukankYori = (start: number, end: number) => {
    return start > 0 && end > 0 ? end - start : null
  }
}
