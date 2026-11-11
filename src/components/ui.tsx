import { useEffect, useRef, useState, type ReactNode } from 'react'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'
import type { Status } from '../roadmap'

export const EASE = [0.16, 1, 0.3, 1] as const

export function Logo({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={`whitespace-nowrap text-[16px] font-extrabold tracking-[0.02em] ${className}`}>
      <span className={dark ? 'text-white' : 'text-ink'}>SMILE SALES </span>
      <span className="text-pink">AGENCY</span>
    </span>
  )
}

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1040px] px-5 sm:px-8 ${className}`}>{children}</div>
}

/** Появление блока при прокрутке */
export function Reveal({
  children,
  delay = 0,
  className = '',
  x = 0,
  y = 40,
}: {
  children: ReactNode
  delay?: number
  className?: string
  x?: number
  y?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Заголовок, который выезжает снизу по словам */
export function SplitTitle({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  const words = text.split(' ')
  // whileInView висит на обёртке: сами слова спрятаны маской и «невидимы» для наблюдателя
  return (
    <motion.span
      className={className}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true }}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: '110%' }, show: { y: 0 } }}
            transition={{ duration: 0.8, ease: EASE, delay: delay + i * 0.07 }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

/** Число, которое досчитывает до значения, когда появляется на экране */
export function Counter({ value, duration = 1.2, delay = 0 }: { value: number; duration?: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? value : 0)
  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setN(value)
      return
    }
    const c = animate(0, value, { duration, delay, ease: EASE, onUpdate: (v) => setN(Math.round(v)) })
    return () => c.stop()
  }, [inView, value, duration, delay, reduce])
  return <span ref={ref}>{n}</span>
}

/** Точка статуса */
export function Dot({ status, className = '', onDark = false }: { status: Status; className?: string; onDark?: boolean }) {
  const color =
    status === 'done' ? (onDark ? 'bg-white' : 'bg-navy') : status === 'current' ? 'bg-pink' : onDark ? 'bg-greyt' : 'bg-greyt'
  return (
    <span
      aria-hidden
      className={`${className.includes('absolute') ? '' : 'relative'} inline-flex h-3 w-3 shrink-0 items-center justify-center ${className}`}
    >
      {status === 'current' && <span className="absolute h-3 w-3 rounded-full bg-pink motion-safe:animate-ring" />}
      <span className={`relative h-3 w-3 rounded-full ${color}`} />
    </span>
  )
}

export function SectionHead({
  latin,
  title,
  children,
  dark = false,
  accent = 'text-pink',
}: {
  latin: string
  title: string
  children?: ReactNode
  dark?: boolean
  accent?: string
}) {
  return (
    <div>
      <Reveal y={16}>
        <p className={`font-latin text-[12px] tracking-[0.28em] ${accent}`}>{latin}</p>
      </Reveal>
      <h2 className={`mt-3 text-[34px] font-extrabold leading-[1.05] sm:text-[52px] ${dark ? 'text-white' : 'text-navy'}`}>
        <SplitTitle text={title} />
      </h2>
      {children}
    </div>
  )
}

export function PlusIcon({ open, className = '' }: { open: boolean; className?: string }) {
  return (
    <motion.span
      aria-hidden
      animate={{ rotate: open ? 135 : 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className={`relative inline-block h-4 w-4 shrink-0 ${className}`}
    >
      <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-current" />
      <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-current" />
    </motion.span>
  )
}

export function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden width="18" height="12" viewBox="0 0 18 12" fill="none" className={`shrink-0 ${className}`}>
      <path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

/** Галочка, которая рисуется при появлении */
export function DrawCheck({ ok, delay = 0, className = '' }: { ok: boolean; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  if (!ok) return <span aria-hidden className={`inline-block h-9 w-9 shrink-0 rounded-full border-2 border-greyt ${className}`} />
  return (
    <motion.span
      aria-hidden
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink ${className}`}
      initial={reduce ? false : { scale: 0 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 420, damping: 18, delay }}
    >
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
        <motion.path
          d="M1.5 6.5l4 4L14.5 1.5"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: delay + 0.2 }}
        />
      </svg>
    </motion.span>
  )
}
