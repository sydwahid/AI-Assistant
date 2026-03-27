import React, { useEffect, useRef } from 'react'
import { useAppContext } from '../context/AppContext'

const SPIKE_COUNT = 200
const BASE_LEN    = 14   // px at rest
const MAX_ATTRACT = 32   // extra px when cursor is right on top of spike
const SIGMA       = 14   // angular degrees — tighter = more localised pull
const LERP        = 0.14 // 0..1: smaller = smoother/slower spring

export default function JarvisOrb({ isMenuOpen }) {
  const { theme } = useAppContext()
  const dark = theme === 'dark'
  const svgRef       = useRef(null)
  const linesRef     = useRef([])
  const extensionsRef = useRef(new Float32Array(SPIKE_COUNT))   // current lengths
  const targetRef    = useRef(new Float32Array(SPIKE_COUNT))    // desired lengths
  const mouseAngleRef = useRef(null)
  const proximityRef = useRef(0)
  const rafRef       = useRef(null)
  const orbWrapRef   = useRef(null)

  // Pre-compute base angles
  const baseAngles = Array.from({ length: SPIKE_COUNT }, (_, i) => (i * 360) / SPIKE_COUNT)

  // rAF loop — lerp current toward target, then update DOM directly
  useEffect(() => {
    const tick = () => {
      const lines = linesRef.current
      const ext   = extensionsRef.current
      const tgt   = targetRef.current
      let dirty   = false

      for (let i = 0; i < SPIKE_COUNT; i++) {
        const prev = ext[i]
        ext[i] += (tgt[i] - prev) * LERP
        if (Math.abs(ext[i] - prev) > 0.05) dirty = true

        if (dirty || lines[i]) {
          const rad   = (baseAngles[i] * Math.PI) / 180
          const inner = 52
          const outer = inner + BASE_LEN + ext[i]
          const x2    = Math.cos(rad) * outer
          const y2    = Math.sin(rad) * outer
          const line  = lines[i]
          if (line) {
            line.setAttribute('x2', x2)
            line.setAttribute('y2', y2)
            // thickness + opacity based on extension
            const t = ext[i] / MAX_ATTRACT
            line.setAttribute('stroke-width', (0.6 + t * 1.2).toFixed(2))
            line.setAttribute('stroke-opacity', (0.4 + t * 0.6).toFixed(2))
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Mouse tracking — only updates target array, no React state
  const handleMouseMove = (e) => {
    const rect = orbWrapRef.current.getBoundingClientRect()
    const cx   = rect.left + rect.width / 2
    const cy   = rect.top  + rect.height / 2
    const dx   = e.clientX - cx
    const dy   = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    mouseAngleRef.current  = Math.atan2(dy, dx) * (180 / Math.PI)
    proximityRef.current   = Math.max(0, 1 - dist / 220)

    const cursorAngle = mouseAngleRef.current
    const prox        = proximityRef.current
    const tgt         = targetRef.current

    for (let i = 0; i < SPIKE_COUNT; i++) {
      const diff       = ((cursorAngle - baseAngles[i] + 540) % 360) - 180
      tgt[i] = Math.exp(-diff * diff / (2 * SIGMA * SIGMA)) * MAX_ATTRACT * (0.5 + prox * 0.5)
    }
  }

  const handleMouseLeave = () => {
    const tgt = targetRef.current
    for (let i = 0; i < SPIKE_COUNT; i++) tgt[i] = 0
  }

  // Build base SVG lines once as static elements, collect refs
  const spikeLines = baseAngles.map((angle, i) => {
    const rad   = (angle * Math.PI) / 180
    const inner = 52
    const x1    = Math.cos(rad) * inner
    const y1    = Math.sin(rad) * inner
    const x2    = Math.cos(rad) * (inner + BASE_LEN)
    const y2    = Math.sin(rad) * (inner + BASE_LEN)
    return (
      <line
        key={i}
        ref={el => { linesRef.current[i] = el }}
        x1={x1} y1={y1}
        x2={x2} y2={y2}
        stroke="url(#spikeGrad)"
        strokeWidth="0.6"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
    )
  })

  return (
    <div className={`h-full flex flex-col items-center justify-center gap-6 select-none pointer-events-none ${isMenuOpen ? 'max-md:hidden' : ''}`}>
      <div
        ref={orbWrapRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex items-center justify-center pointer-events-auto"
      >
        {/* Ambient glow */}
        <div className={`absolute w-52 h-52 rounded-full blur-3xl animate-pulse ${dark ? 'bg-blue-500/10' : 'bg-sky-400/20'}`} />

        {/* Heartbeat rings */}
        <span className={`absolute w-36 h-36 rounded-full border animate-ping ${dark ? 'border-cyan-400/20' : 'border-sky-400/35'}`} style={{ animationDuration: '2.2s' }} />
        <span className={`absolute w-48 h-48 rounded-full border animate-ping ${dark ? 'border-blue-400/10' : 'border-cyan-400/20'}`} style={{ animationDuration: '3.1s' }} />

        {/* Spiky SVG ring */}
        <svg
          ref={svgRef}
          width="240" height="240"
          viewBox="-120 -120 240 240"
          className="absolute"
          style={{ animation: 'spin-slow 18s linear infinite' }}
        >
          <defs>
            {/* Spikes — uniform single color */}
            <linearGradient id="spikeGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor={dark ? '#a5b4fc' : '#38bdf8'} stopOpacity="0.5" />
              <stop offset="100%" stopColor={dark ? '#a5b4fc' : '#7dd3fc'} stopOpacity="0.9" />
            </linearGradient>
            {/* Dashed orbit ring */}
            <linearGradient id="ringGrad" x1="0" y1="-1" x2="0" y2="1">
              <stop offset="0%"   stopColor={dark ? '#38bdf8' : '#0ea5e9'} />
              <stop offset="100%" stopColor={dark ? '#818cf8' : '#22d3ee'} />
            </linearGradient>
          </defs>

          {/* Orbit ring */}
          <circle r="52" fill="none" stroke="url(#ringGrad)" strokeWidth="0.8" strokeDasharray="3 6" opacity="0.35" />

          {spikeLines}
        </svg>

        {/* Core orb */}
        <div
          className="orb-wave relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: dark
              ? 'radial-gradient(circle at 35% 30%, #312e81 0%, #1e1b4b 50%, #0f0a1e 100%)'
              : 'radial-gradient(circle at 35% 30%, #38bdf8 0%, #0ea5e9 45%, #0284c7 100%)',
            boxShadow: dark
              ? '0 0 24px 6px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
              : '0 0 24px 8px rgba(14,165,233,0.45), inset 0 1px 0 rgba(255,255,255,0.35)',
          }}
        >
          {/* Subtle inner rings */}
          <div className={`absolute w-12 h-12 rounded-full border ${dark ? 'border-indigo-400/20' : 'border-sky-200/50'}`} />
          <div className={`absolute w-7 h-7 rounded-full border ${dark ? 'border-indigo-300/15' : 'border-white/40'}`} />
          {/* Center glowing dot */}
          <div className={`relative w-2 h-2 rounded-full ${dark ? 'bg-indigo-300 shadow-[0_0_8px_4px_rgba(165,180,252,0.6)]' : 'bg-white shadow-[0_0_8px_4px_rgba(186,230,253,0.8)]'}`} />
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <p className={`text-4xl sm:text-5xl font-light ${dark ? 'text-gray-300' : 'text-slate-500'}`}>
          Ask me anything.
        </p>
        <p className={`mt-2 text-sm tracking-widest uppercase ${dark ? 'text-cyan-400/60' : 'text-sky-500/70'}`}>
          I'm listening...
        </p>
      </div>
    </div>
  )
}
