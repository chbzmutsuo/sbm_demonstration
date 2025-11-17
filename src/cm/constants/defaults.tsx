import {GetDevice, getWindow} from 'src/cm/hooks/useWindowSize'
import {CSSProperties} from 'react'
import {MyTableType} from '@cm/types/types'
import {MyFormType} from '@cm/types/form-types'
export const getTableStickyStyles = (props: any) => {
  const commons = {
    background: '#f4f4f4',
    position: 'sticky',
  }
  return {
    kado: {
      top: 0,
      left: 0,
      ...commons,
      ...props?.style,
    },
    header: {
      top: 0,
      ...commons,
      ...props?.style,
    },
    footer: {
      bottom: 0,
      ...commons,
      ...props?.style,
    },
    left: {
      left: 0,

      ...commons,
      ...props?.style,
    },
  }
}

type DeviceStyles = {
  Modal: CSSProperties
  Form: CSSProperties
  Table: CSSProperties
}

type StylesByDevice = {
  SP: DeviceStyles
  TB: DeviceStyles
  PC: DeviceStyles
}
export const stylesByDevice: StylesByDevice = {
  SP: {
    Modal: {},
    Form: {maxWidth: '90vw', maxHeight: '70vh'},
    Table: {
      maxWidth: '85vw',
      maxHeight: '70vh',
    },
  },

  TB: {
    Modal: {},
    Form: {maxWidth: '90vw', maxHeight: '75vh'},
    Table: {
      maxWidth: '85vw',
      maxHeight: '70vh',
    },
  },

  PC: {
    Modal: {},
    Form: {maxWidth: '90vw', maxHeight: '70vh'},
    Table: {
      maxWidth: '85vw',
      maxHeight: '70vh',
    },
  },
}

export const getMyTableDefault = (): MyTableType => ({
  tableId: '',
  className: '',
  style: {
    overflow: 'auto',
    minWidth: 240,
    ...(typeof window !== 'undefined' ? stylesByDevice?.[GetDevice(getWindow().width)]?.Table : {}),
  },
  create: {},
  search: {},
  sort: {},
  pagination: {},
  header: false,
  drag: false,
  fixedCols: 0,
})

export const myFormDefault: MyFormType = {
  create: {},
  delete: {},
  style: {
    padding: '5px 5px 0 5px',
    overflow: 'auto', //必須
    minHeight: 100,
    margin: 'auto',

    ...stylesByDevice?.[GetDevice(getWindow().width)]?.Form,
  },
  customActions: undefined,
}

/**モーダルでoverflowはせずに、中のコンポーネントで制御する */

export const limitEditting = (props: {exclusiveTo?: boolean; myTable?: MyTableType; myForm?: MyFormType}) => {
  const {
    exclusiveTo,
    myTable = {update: false, delete: false},
    myForm = {
      update: false,
      delete: false,
    },
  } = props
  if (!exclusiveTo) {
    return {
      myTable,
      myForm,
    }
  }
}

export const controlDefaultStyle: CSSProperties = {
  width: 250,

  maxWidth: '85vw',
  minHeight: 30,
  margin: `auto 0`,
}

// export const controlDefaultClass = 'w-[240px] min-h-[30px] max-w-[85vw] m-auto'
