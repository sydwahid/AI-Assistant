import React, { Suspense, lazy, useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'

const SPLINE_SCENE_URL = 'https://prod.spline.design/dcj12DiNnTOgafH6/scene.splinecode'
const Spline = lazy(() => import('@splinetool/react-spline'))

const SplineHero = () => {
  const { theme } = useAppContext()
  const dark = theme === 'dark'
  const [isLoaded, setIsLoaded] = useState(false)
  const [shouldRenderSpline, setShouldRenderSpline] = useState(false)

  useEffect(() => {
    let timeoutId
    let idleId

    const enableSpline = () => {
      setShouldRenderSpline(true)
    }

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enableSpline, { timeout: 1200 })
    } else {
      timeoutId = window.setTimeout(enableSpline, 250)
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
      if (idleId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      }
    }
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className={`pointer-events-none absolute inset-0 ${dark
            ? 'bg-[radial-gradient(circle_at_top,rgba(52,211,255,0.16),transparent_34%),radial-gradient(circle_at_bottom,rgba(96,165,250,0.2),transparent_45%)]'
            : 'bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_36%),radial-gradient(circle_at_bottom,rgba(37,99,235,0.12),transparent_48%)]'
          }`}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/15 to-transparent dark:from-slate-950/35" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-950/70 via-slate-950/12 to-transparent dark:from-slate-950/82" />

      {(!shouldRenderSpline || !isLoaded) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-24 w-24 rounded-full border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_60px_rgba(56,189,248,0.18)] animate-pulse" />
            <p className={`text-xs uppercase tracking-[0.38em] ${dark ? 'text-cyan-100/70' : 'text-sky-900/55'}`}>
              Booting robotic interface
            </p>
          </div>
        </div>
      )}

      <div className="spline-shell absolute inset-0">
        {shouldRenderSpline && (
          <Suspense fallback={null}>
            <Spline scene={SPLINE_SCENE_URL} onLoad={() => setIsLoaded(true)} />
          </Suspense>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-4 sm:p-6">
        <div className="robot-badge">
          Live Spline Avatar
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6 lg:p-8">
        <div className="max-w-xl">
          <p className={`text-[11px] uppercase tracking-[0.42em] ${dark ? 'text-cyan-200/70' : 'text-sky-900/55'}`}>
            Neural interface online
          </p>
          <h2 className={`mt-3 text-3xl font-light sm:text-4xl lg:text-6xl ${dark ? 'text-white' : 'text-slate-900/90'}`}>
            Robotic presence (half-screen).
          </h2>
          <p className={`mt-3 max-w-md text-sm sm:text-base ${dark ? 'text-slate-200/72' : 'text-slate-800/65'}`}>
            The robot occupies half the view while the chat sits beside it for balanced interaction.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SplineHero
