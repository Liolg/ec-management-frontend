import { laborsApi } from '../../api/products'
import ResourcePage from './ResourcePage'

export default function Labors() {
  return (
    <ResourcePage
      title="Labors"
      singular="Labor"
      queryKey="labors"
      unitField="time_unit"
      unitLabel="Time unit"
      emptyMessage="No labor rates yet. Create one to build a cost sheet."
      api={laborsApi}
    />
  )
}
