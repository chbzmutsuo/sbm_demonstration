import {getStores} from './_actions/store-actions'
import {getRooms} from './_actions/room-actions'
import {getCounselingUsers} from './_actions/user-actions'
// import SettingClient from './SettingsClient'

export default async function SettingsPage() {
  // サーバーコンポーネントでデータを取得
  const stores = await getStores()
  const rooms = await getRooms()
  const users = await getCounselingUsers()

  // クライアントコンポーネントにPropsで渡す
  // return <SettingClient stores={stores} rooms={rooms} users={users} />
}
