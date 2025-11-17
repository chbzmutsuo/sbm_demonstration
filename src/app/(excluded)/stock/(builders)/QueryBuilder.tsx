import {getIncludeType, includeProps, roopMakeRelationalInclude} from '@cm/class/builders/QueryBuilderVariables'

export class QueryBuilder {
  static getInclude = (includeProps: includeProps) => {
    const include: getIncludeType = {
      stock: {
        include: {
          StockHistory: {
            where: {Close: {gt: 0}},
            take: 150,
            orderBy: [{Date: 'desc'}],
          },
        },
      },
      stockHistory: {include: {Stock: {}}},
    }

    Object.keys(include).forEach(key => {
      roopMakeRelationalInclude({
        parentName: key,
        parentObj: include[key],
      })
    })

    return include
  }
}
