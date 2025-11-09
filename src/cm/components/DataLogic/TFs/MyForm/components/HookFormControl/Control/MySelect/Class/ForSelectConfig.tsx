import {defaultSelect, masterDataSelect} from 'src/cm/class/Fields/Fields'
import {PrismaModelNames} from '@cm/types/prisma-types'
import {colType} from '@cm/types/col-types'
import {anyObject} from '@cm/types/utility-types'
import {funcOrVar} from 'src/cm/lib/methods/common'
import {defaultOrderByArray} from '@cm/class/PQuery'
import {forSelectConfig} from '@cm/types/select-types'

export class ForSelectConfig {
  protected col: colType
  protected config: forSelectConfig
  protected latestFormData: anyObject | undefined

  constructor(col: colType, options?: {latestFormData: anyObject}) {
    this.col = col
    this.config = col?.forSelect?.config ?? {}
    this.latestFormData = options?.latestFormData
  }

  private getSelect = ({as = `boolean`}) => {
    const select = {
      ...(this.col?.id.includes('Master') ? {...masterDataSelect} : {...defaultSelect}),
      ...this.config?.select,
    }
    Object.keys(select).forEach(key => {
      if (select[key] === false) {
        delete select[key]
      } else {
        if (as === `boolean`) {
          select[key] = true
        }
      }
    })

    return select
  }

  getWhere = () => {
    const where = funcOrVar(this.config?.where, {col: this.col, latestFormData: this.latestFormData})

    return where
  }

  getConfig = () => {
    const where = this.getWhere()
    const include = this.config?.include
    const modelName = this.config.modelName as PrismaModelNames
    const result: forSelectConfig & {
      selectWithColType
    } = {
      selectWithColType: this.getSelect({as: `colType`}),
      select: this.getSelect({as: `boolean`}),
      where,
      include,
      orderBy: this.config?.orderBy ? this.config?.orderBy : [...defaultOrderByArray],
      nameChanger: this.config?.nameChanger,
      modelName: modelName,
    }

    return result
  }
}
