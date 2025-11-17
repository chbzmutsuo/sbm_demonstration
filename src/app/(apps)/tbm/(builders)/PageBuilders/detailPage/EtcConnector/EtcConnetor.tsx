import EtcConnectForm from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/EtcConnector/EtcConnectForm'
import EtcConnectHistoryTable from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/EtcConnector/EtcConnectHistoryTable'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, FitMargin} from '@cm/components/styles/common-components/common-components'
import useModal from '@cm/components/utils/modal/useModal'
import React from 'react'

export default function EtcConnetor({useGlobalProps, tbmVehicleId}) {
  const EtcConnectFormMD = useModal()

  return (
    <>
      <FitMargin>
        <C_Stack className={` items-center`}>
          <Button color="blue" onClick={EtcConnectFormMD.handleOpen}>
            連携設定
          </Button>

          <EtcConnectFormMD.Modal>
            <EtcConnectForm {...{EtcConnectFormMD, tbmVehicleId}} />
          </EtcConnectFormMD.Modal>

          <EtcConnectHistoryTable {...{tbmVehicleId}} />
        </C_Stack>
      </FitMargin>
    </>
  )
}
