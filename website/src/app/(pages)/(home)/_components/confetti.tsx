import VFX from 'react-canvas-confetti/dist/presets/explosion'

export function Confetti() {
  return (
    <VFX
      autorun={{ speed: 1 }}
      globalOptions={{ disableForReducedMotion: true }}
    />
  )
}
