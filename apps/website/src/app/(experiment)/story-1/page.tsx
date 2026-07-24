import { StoryV1 } from '../_components/story-v1'

export default function Page() {
  return (
    <div className="xp">
      <div style={{ padding: '40px 40px 0', fontSize: 13, color: '#71717a' }}>
        how-i-built-it · variant 1 — margin lecture (scroll)
      </div>
      <StoryV1 />
      <div style={{ height: '30vh' }} />
    </div>
  )
}
