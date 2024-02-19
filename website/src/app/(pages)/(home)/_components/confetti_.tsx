import React, { useCallback, useRef } from 'react'
import ReactCanvasConfetti from 'react-canvas-confetti'

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

const canvasStyles: React.CSSProperties = {
  zIndex: 9999,
  position: 'fixed',
  pointerEvents: 'none',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
}

function getAnimationSettings(originXA: number, originXB: number) {
  return {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0,
    particleCount: 150,
    origin: {
      x: randomInRange(originXA, originXB),
      y: Math.random() - 0.2,
    },
  }
}

export default function Confetti() {
  const done = useRef(false)

  const getInstance = useCallback((fire: any) => {
    if (fire && !done.current) {
      fire(getAnimationSettings(0.1, 0.3))
      fire(getAnimationSettings(0.7, 0.9))

      done.current = true
    }
  }, [])

  return <ReactCanvasConfetti refConfetti={getInstance} style={canvasStyles} />
}