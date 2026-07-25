import { ExperimentView } from '../experiment-view'
import { getRepoStarCount } from '../_reveal/stars'

export const revalidate = 3600

export default async function VariantPage() {
  const starCount = await getRepoStarCount()

  return <ExperimentView starCount={starCount} variant={3} />
}
