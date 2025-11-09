import {PrismaModelNames} from '@cm/types/prisma-types'

import {colType} from '@cm/types/col-types'
import {UseRecordsReturn} from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'

import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobalOrigin'
import {atom, useAtom} from 'jotai'
import {atomFamily} from 'jotai/utils'
import {useMemo} from 'react'

export const useJotai = useAtom

export type atomKey =
  | `globalHooks`
  | `isOptionsVisible`
  | `activeNavWrapper`
  | `leadtimeTableUser`
  | `torokuMikomiApplicationForm`
  | `tableSortModalOpen`
  | `lastLoggedTime`
  | `dataUpdated`
  | `colConfigModal`
  | `showpopover`
  | `globalCurrentTabIdx`
  | `globalLoader`
  | `torokuDateApplicationForm`
  | `torokuMikomiApplicationForm`
  | `globalModalOpen`
  | `selectedUcarNotes`
  | `showGarageRegister`
  | `ucrDetailUpdater`
  | `sateiConnectionGMF`
  | `checkPointModalGMF`
  | `crScheduleSwitcherModal`
  | `waitingCarVisualizerOpen`
  | `stuffSwitcherGMF`
  //
  | `displayedContents`
  | `saleEditorGMF`
  | `workLogHistoryGMF`
  | `shiftEditPropsGMF`
  | `GenbaDayCardEditorModalGMF`
  | `GenbaDayBasicEditorGMF`
  | `odometerInputGMF`

export type atomTypes = {
  globalHooks: useGlobalPropType
  activeNavWrapper: number[]
  isOptionsVisible: boolean
  leadtimeTableUser: {
    record: {
      count: number
      storeCode: any
      storeName: any
      userName?: any
      userCode?: any
      DD_FR___DD_HONBSYOK: number
      DD_FR___lastApprovedDesiredTorokuDate: number
      DD_FR___DD_TOUROKU: number
      DD_FR___DD_CENTTYAB: number
      DD_FR___DD_HAISKIBO: number
      DD_FR___DD_CENTSYUB: number
      DD_FR___DD_NOSYA: number
    }
    SqlGetter: (props: {additionalWherePhrase?: string}) => {leadTimeDetailSql: string; leadTimeAggSql: string}
  }

  tableSortModalOpen: boolean
  lastLoggedTime: Date | null
  dataUpdated: number
  colConfigModal: null | {col: colType; dataModelName: string}
  showpopover: string | null
  globalCurrentTabIdx: any
  globalLoader: boolean
  globalAccordionOpen: boolean
  globalModalOpen: boolean
  torokuDateApplicationForm: {newCar: any}
  torokuMikomiApplicationForm: {newCar: any}
  selectedUcarNotes: {UcarData: any; mutateRecords: UseRecordsReturn[`mutateRecords`]}
  showGarageRegister: {ucar: any; UcarGarageLocationMaster: any}
  ucrDetailUpdater: {ucarId: any}
  sateiConnectionGMF: {newCar: any; sateiNoList: any}
  crScheduleSwitcherModal: {theCar: any; lastHistory: any}
  waitingCarVisualizerOpen: boolean
  checkPointModalGMF: {cp: any; newCar: any; UseRecordsReturn: UseRecordsReturn}
  stuffSwitcherGMF: {newCar: any}

  //
  displayedContents: string[]
  saleEditorGMF: {saleRecordId: number}
  workLogHistoryGMF: {workLogId: number}
  shiftEditPropsGMF: {
    selectedData
    RelationalModel: PrismaModelNames
    GenbaDay
    baseModelName
  }
  GenbaDayCardEditorModalGMF: {taskMidTable; genbaId; genbaDayId}
  GenbaDayBasicEditorGMF: {GenbaDay}

  odometerInputGMF: {
    OdometerInput: {
      date: Date
      odometerStart: number
      odometerEnd: number
      TbmVehicle
    }
  }
}
type myAtomFamilyParams = {atomKey: atomKey; defaultState: any}

const myAtomFamily = atomFamily(
  (param: myAtomFamilyParams) => {
    return atom(param.defaultState)
  },
  (a, b) => a.atomKey === b.atomKey
)

export const useJotaiByKey = <S,>(atomKey: any, defaultState: any) => {
  const param = useMemo<myAtomFamilyParams>(
    () => ({
      atomKey,
      defaultState,
    }),
    [atomKey, defaultState]
  )

  const jotai = useAtom<S>(myAtomFamily(param))
  const [state, setState] = jotai

  return useMemo(() => {
    type State = S
    type SetState = (update: State | ((prev: State) => State)) => void
    return [state, setState] as [S, SetState]
  }, [state, setState])
}

export const jotai_showAwards = atom<boolean>(false)
export const jotai_masterKeyDisplayedContentsSelector = atom<boolean>(false)
export const jotai_moveStudent = atom<null | {id: number}>(null)
export const jotaiStudentGroups = atom<any[] | null>(null)

export const jotai_pdfPages = atom<Blob[]>([])
export const jotai_pdfImages = atom<string[]>([])
