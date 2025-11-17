import DataModelPage from '../page'

export default async function Page(props) {
  const query = await props.searchParams
  const params = await props.params
  return DataModelPage({params, searchParams: query})
}
