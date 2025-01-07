import VFX from 'react-canvas-confetti/dist/presets/explosion'

export function Confetti({
  pageCoords = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
}: {
  pageCoords?: {
    x: number
    y: number
  }
}) {
  return (
    <VFX
      autorun={{ speed: 1 }}
      globalOptions={{ disableForReducedMotion: true }}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        inset: 0,
        zIndex: 1000,
        left: pageCoords.x,
        top: pageCoords.y,
        transform: 'translate(-50%, -50%)',
      }}
    />
  )
}
