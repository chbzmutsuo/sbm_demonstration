import { PrismaModelNames } from '@cm/types/prisma-types'

type targetModelType = {
  [key: string]: {
    modelNames: { name: PrismaModelNames; id_pw?: { id?: string; pw?: string } }[]
  }
}
export class SessionFaker {
  static targetModels: targetModelType = {
    default: {
      modelNames: [
        //
        { name: 'user', id_pw: { id: 'code', pw: 'password' } },
        { name: 'user' },

      ],
    },
  }

  static getTargetModels = () => {
    const ROOTPATH = process.env.NEXT_PUBLIC_ROOTPATH ?? ''
    const targetModels = this.targetModels?.[ROOTPATH] || this.targetModels?.['default']

    return targetModels?.modelNames
  }
}

// nnu2361
