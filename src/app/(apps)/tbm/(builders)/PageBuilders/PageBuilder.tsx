'use client'

import {tbmOperationGroup} from '@app/(apps)/tbm/(builders)/PageBuilders/tbmOperationGroup/tbmOperationGroup'
import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobal'
import {Fields} from '@cm/class/Fields/Fields'
import GlobalIdSelector from '@cm/components/GlobalIdSelector/GlobalIdSelector'
import TbmVehicleDetail from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/TbmVehicleDetail'
import TbmRouteGroupDetail from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/TbmRouteGroupDetail'
import TbmUserDetail from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/TbmUserDetail'
import {DataModelBuilder, roleMaster} from '@cm/class/builders/PageBuilderVariables'

export class PageBuilder {
  // static tbmBase = tbmBase
  static tbmVehicle = {
    form: TbmVehicleDetail,
  }
  static tbmRouteGroup = {
    form: TbmRouteGroupDetail,
  }
  static roleMaster: DataModelBuilder = roleMaster

  static user = {
    form: TbmUserDetail,
  }
  static tbmOperationGroup = tbmOperationGroup

  static getGlobalIdSelector = (props: {useGlobalProps: useGlobalPropType}) => {
    const {useGlobalProps} = props
    const {admin, getTbmScopes} = useGlobalProps.accessScopes()
    const {userId, eigyoshoKirikae, tbmBaseId} = getTbmScopes()

    const columns = admin
      ? new Fields([
          {id: 'g_tbmBaseId', label: '営', forSelect: {}},
          {id: 'g_userId', label: 'ド', forSelect: {}},
        ]).transposeColumns()
      : new Fields([{id: 'g_tbmBaseId', label: '営', forSelect: {}}]).transposeColumns()

    if (admin || eigyoshoKirikae) {
      return () => <GlobalIdSelector {...{useGlobalProps, columns}} />
    }
  }
}
