import { useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { roadmap, type Stage, type Status } from '../roadmap'
import { dayNum, dayStatus, monthShort, parallelLabel, stageDateLabel, stageDays, todayKey, weekdayShort, type DayKey } from '../dates'
import { pad, statusLabel } from '../progress'
import { EASE, PlusIcon } from './ui'

export type Filter = 'all' | Status

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'done', label: 'Выполнено' },
  { id: 'current', label: 'Сейчас' },
  { id: 'next', label: 'Впереди' },
]

type Group = { key: DayKey | 'tbd'; stages: Stage[] }

function groupByDay(list: Stage[]): Group[] {
  const map = new Map<string, Stage[]>()
  for (const s of list) {
    const k = stageDays(s)[0] ?? 'tbd'
    map.set(k, [...(map.get(k) ?? []), s])
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a === 'tbd' ? 1 : b === 'tbd' ? -1 : a.localeCompare(b)))
    .map(([key, stages]) => ({ key, stages }))
}

interface Props {
  filter: Filter
  onFilter: (f: Filter) => void
  open: Set<number>
  onToggle: (id: number) => void
}

export function Timeline({ filter, onFilter, open, onToggle }: Props) {
  const reduce = useReducedMotion()
  const { stages } = roadmap
  const list = filter === 'all' ? stages : stages.filter((s) => s.status === filter)
  const groups = groupByDay(list)
  const count = (f: Filter) => (f === 'all' ? stages.length : stages.filter((s) => s.status === f).length)
  const today = todayKey()

  // линия, которая заполняется по мере прокрутки
  const railRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: railRef, offset: ['start 70%', 'end 60%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  const parallelStart = stages.find((s) => s.id === roadmap.parallel.from)
  const parallelDay = parallelStart ? stageDays(parallelStart)[0] : undefined

  return (
    <div>
      <div role="group" aria-label="Фильтр этапов" className="mt-8 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = f.id === filter
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => onFilter(f.id)}
              className={`relative rounded-full border-2 px-4 py-2 text-[14px] font-bold transition-colors duration-200 ${
                active ? 'border-pink text-white' : 'border-greyl text-navy hover:border-navy'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute -inset-[2px] rounded-full bg-pink"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative">
                {f.label} <span className={active ? 'text-white/75' : 'text-greyt'}>{count(f.id)}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div ref={railRef} className="relative mt-12">
        <span aria-hidden className="absolute bottom-0 left-[27px] top-0 w-[3px] rounded-full bg-greyl sm:left-[47px]" />
        <motion.span
          aria-hidden
          style={reduce ? { scaleY: 1 } : { scaleY: fill }}
          className="absolute bottom-0 left-[27px] top-0 w-[3px] origin-top rounded-full bg-pink sm:left-[47px]"
        />

        {groups.length === 0 && <p className="pl-20 text-[16px] font-medium text-greyt sm:pl-32">Этапов с таким статусом нет.</p>}

        {groups.map((g) => {
          const st = dayStatus(g.stages) ?? 'next'
          const isToday = g.key === today
          return (
            <div key={`${filter}-${g.key}`} className="relative grid grid-cols-[56px_1fr] gap-x-4 pb-12 last:pb-0 sm:grid-cols-[96px_1fr] sm:gap-x-8">
              <motion.div
                className="sticky top-4 z-10 self-start bg-white py-2 text-center"
                initial={reduce ? false : { opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '0px 0px -60px 0px' }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              >
                {g.key === 'tbd' ? (
                  <span className="block text-[12px] font-bold leading-tight text-greyt">дата уточняется</span>
                ) : (
                  <>
                    <span
                      className={`block text-[40px] font-extrabold leading-none sm:text-[64px] ${
                        st === 'done' ? 'text-navy' : st === 'current' ? 'text-pink' : 'text-greyt'
                      }`}
                    >
                      {dayNum(g.key)}
                    </span>
                    <span className="mt-1 block text-[12px] font-bold uppercase tracking-wider text-navy sm:text-[13px]">
                      {monthShort(g.key)}, {weekdayShort(g.key)}
                    </span>
                    {isToday && (
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-red">
                        <span className="h-1.5 w-1.5 rounded-full bg-red motion-safe:animate-blink" />
                        сегодня
                      </span>
                    )}
                  </>
                )}
              </motion.div>

              <div className="min-w-0 space-y-3 pt-1">
                {filter === 'all' && g.key === parallelDay && <ParallelMarker />}
                {g.stages.map((s, i) => (
                  <StageCard key={s.id} stage={s} index={i} open={open.has(s.id)} onToggle={onToggle} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const fields: { key: 'what' | 'why' | 'result'; label: string }[] = [
  { key: 'what', label: 'Что делаем' },
  { key: 'why', label: 'Зачем' },
  { key: 'result', label: 'Что получит клиника' },
]

function StageCard({ stage, index, open, onToggle }: { stage: Stage; index: number; open: boolean; onToggle: (id: number) => void }) {
  const reduce = useReducedMotion()
  const cur = stage.status === 'current'
  const multiDay = stageDays(stage).length > 1
  const shell =
    stage.status === 'done'
      ? 'border-navy bg-white text-navy'
      : cur
        ? 'border-pink bg-pink text-white'
        : 'border-dashed border-greyt bg-white text-navy'
  const items = fields.filter((f) => stage[f.key].trim() !== '')

  return (
    <motion.div
      id={`stage-${stage.id}`}
      className={`scroll-mt-24 rounded-[22px] border-2 ${shell}`}
      initial={reduce ? false : { opacity: 0, x: 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.09 }}
    >
      <motion.button
        type="button"
        onClick={() => onToggle(stage.id)}
        aria-expanded={open}
        aria-controls={`details-${stage.id}`}
        whileHover={reduce ? undefined : { x: 6 }}
        whileTap={{ scale: 0.985 }}
        className="flex w-full items-start gap-3 p-4 text-left sm:gap-5 sm:p-6"
      >
        <span className={`hidden text-[36px] font-extrabold leading-none sm:block ${cur ? 'text-white' : stage.status === 'done' ? 'text-navy' : 'text-greyt'}`}>
          {pad(stage.id)}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`flex flex-wrap items-center gap-x-2 text-[11px] font-extrabold uppercase tracking-[0.12em] ${cur ? 'text-white' : stage.status === 'done' ? 'text-navy' : 'text-greyt'}`}>
            <span className="text-[22px] leading-none tracking-normal sm:hidden">{pad(stage.id)}</span>
            {cur && <span className="h-2 w-2 rounded-full bg-white motion-safe:animate-blink" />}
            {stage.status === 'done' && <CheckMini />}
            {cur ? 'в работе' : statusLabel[stage.status]}
            {multiDay && <span className={cur ? 'text-white/80' : 'text-greyt'}>· {stageDateLabel(stage)}</span>}
          </span>
          <span className="mt-1.5 block text-[17px] font-extrabold leading-snug sm:text-[20px]">{stage.title}</span>
          {stage.subtitle && (
            <span className={`mt-1 block text-[13px] font-medium leading-snug sm:text-[14px] ${cur ? 'text-white/85' : 'text-greyt'}`}>
              {stage.subtitle}
            </span>
          )}
        </span>
        <PlusIcon open={open} className={`mt-1 ${cur ? 'text-white' : 'text-pink'}`} />
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`details-${stage.id}`}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <dl className={`mx-4 grid gap-5 border-t-2 pb-5 pt-5 sm:mx-6 sm:grid-cols-3 sm:gap-8 sm:pb-6 ${cur ? 'border-white/30' : 'border-greyl'}`}>
              {items.map((f, i) => (
                <motion.div
                  key={f.key}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.1 + i * 0.08 }}
                >
                  <dt className={`text-[11px] font-extrabold uppercase tracking-[0.12em] ${cur ? 'text-white/75' : 'text-pink'}`}>{f.label}</dt>
                  <dd className={`mt-2 text-[15px] leading-relaxed ${cur ? 'text-white' : 'text-ink'}`}>{stage[f.key]}</dd>
                </motion.div>
              ))}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CheckMini() {
  return (
    <span aria-hidden className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-navy">
      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
        <path d="M1 3.5l2.2 2.2L8 1" stroke="#FFFFFF" strokeWidth="1.6" />
      </svg>
    </span>
  )
}

function ParallelMarker() {
  const p = roadmap.parallel
  return (
    <a
      href="#parallel"
      className="group flex items-center gap-3 rounded-[22px] border-2 border-red px-4 py-3 text-[13px] font-bold text-red transition-colors duration-200 hover:bg-red hover:text-white sm:px-6"
    >
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-current motion-safe:animate-blink" />
      <span>
        Параллельно {parallelLabel()}: {p.title.toLowerCase()} (этапы {p.from}–{p.to})
      </span>
    </a>
  )
}
