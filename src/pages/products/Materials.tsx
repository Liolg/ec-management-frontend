import { materialsApi } from '../../api/products'
import ResourcePage from './ResourcePage'

export default function Materials() {
  return (
    <ResourcePage
      title="Materials"
      singular="Material"
      queryKey="materials"
      unitField="unit"
      unitLabel="Unit"
      emptyMessage="No materials yet. Create one to build a cost sheet."
      api={materialsApi}
    />
  )
}
