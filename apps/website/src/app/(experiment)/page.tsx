import { ExperimentView } from './experiment-view'
import { getRepoStarCount } from './_reveal/stars'
import { getDownloadStats } from './_data/npm-downloads'

export const revalidate = 3600

export default async function IndexPage() {
  const [starCount, downloads] = await Promise.all([
    getRepoStarCount(),
    getDownloadStats(),
  ])

  return <ExperimentView starCount={starCount} downloads={downloads} />
}
