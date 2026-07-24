import { StoryV2 } from '../_components/story-v2'

export default function Page() {
  return (
    <div className="xp">
      <div style={{ padding: '40px 40px 0', fontSize: 13, color: '#71717a' }}>
        how-i-built-it · variant 2 — chalk talk (scroll)
      </div>
      <StoryV2 />
      <div style={{ height: '30vh' }} />
    </div>
  )
}
