import { ExperimentView } from './experiment-view'

async function getRepoStarCount() {
  try {
    const res = await fetch(
      'https://api.github.com/repos/guilhermerodz/input-otp',
    )
    const data = await res.json()
    const starCount = data.stargazers_count
    if (typeof starCount !== 'number') {
      return null
    }
    if (starCount > 999) {
      return (starCount / 1000).toFixed(1) + 'k'
    }
    return String(starCount)
  } catch {
    return null
  }
}

export const revalidate = 3600

export default async function IndexPage() {
  const starCount = await getRepoStarCount()

  return <ExperimentView starCount={starCount} />
}
