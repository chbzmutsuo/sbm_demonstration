import {getIncludeType, includeProps, roopMakeRelationalInclude} from '@cm/class/builders/QueryBuilderVariables'

export class QueryBuilder {
  static getInclude = (includeProps: includeProps) => {
    const include: getIncludeType = {
      workoutLog: {
        include: {User: {}},
      },
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
