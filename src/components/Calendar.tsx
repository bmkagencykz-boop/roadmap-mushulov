import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { roadmap } from '../roadmap'
import {
  auditRange,
  calendarWeeks,
  dayNum,
  dayStatus,
  longDay,
  monthTitle,
  stagesOn,
  todayKey,
  type DayKey,
} from '../dates'
import { pad, statusLabel } from '../progress'
import { ArrowIcon, Container, Dot, EASE, SectionHead } from './ui'

const WEEK = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

export function Calendar({ onOpenStage }: { onOpenStage: (id: number) => void }) {
  const reduce = useReducedMotion()
  const { stages } = roadmap
  const range = auditRange(stages)
  const weeks = calendarWeeks(range)
  const today = todayKey()
  const defaultDay = range.includes(today)
    ? today
    : (range.find((k) => dayStatus(stagesOn(stages, k)) === 'current') ?? range[0])
  const [selected, setSelected] = useState<DayKey | undefined>(defaultDay)

  if (!range.length) return null
  const list = selected ? stagesOn(stages, selected) : []

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHead latin="CALENDAR" title="Календарь аудита">
          <p className="mt-4 text-[16px] font-medium text-greyt">
            {monthTitle(range[0])} · {range.length} {range.length === 1 ? 'день' : range.length < 5 ? 'дня' : 'дней'} · нажмите на день
          </p>
        </SectionHead>

        <div className="mt-10 md:grid md:grid-cols-[1.15fr_1fr] md:gap-12">
          <div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
              {WEEK.map((w) => (
                <span
                  key={w}
                  className={`pb-1 text-center text-[12px] font-bold uppercase tracking-wider ${w === 'сб' || w === 'вс' ? 'text-pink' : 'text-greyt'}`}
                >
                  {w}
                </span>
              ))}
              {weeks.flat().map((k, i) => {
                const on = stagesOn(stages, k)
                const st = dayStatus(on)
                const inAudit = range.includes(k)
                const isToday = k === today
                const isSel = k === selected
                const base =
                  st === 'done'
                    ? 'bg-navy text-white'
                    : st === 'current'
                      ? 'bg-pink text-white'
                      : st === 'next'
                        ? 'bg-greyl text-navy'
                        : inAudit
                          ? 'bg-white text-navy border-2 border-greyl'
                          : 'text-greyt'
                return (
                  <motion.button
                    key={k}
                    type="button"
                    disabled={!on.length}
                    onClick={() => setSelected(k)}
                    aria-pressed={isSel}
                    aria-label={`${longDay(k)}${isToday ? ', сегодня' : ''}: ${on.length} этап(ов)`}
                    initial={reduce ? false : { opacity: 0, scale: 0.3 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    whileHover={on.length ? { scale: 1.08 } : undefined}
                    whileTap={on.length ? { scale: 0.94 } : undefined}
                    transition={{ type: 'spring', stiffness: 300, damping: 18, delay: reduce ? 0 : i * 0.035 }}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-xl sm:rounded-2xl ${base} ${
                      on.length ? 'cursor-pointer' : 'cursor-default'
                    } ${isToday ? 'ring-[3px] ring-red ring-offset-2 ring-offset-white' : ''}`}
                  >
                    {st === 'current' && (
                      <span className="absolute inset-0 rounded-xl bg-pink motion-safe:animate-halo sm:rounded-2xl" />
                    )}
                    <span className="relative text-[18px] font-extrabold leading-none sm:text-[28px]">{dayNum(k)}</span>
                    {on.length > 0 && (
                      <span className="relative mt-1.5 flex gap-[3px] sm:mt-2 sm:gap-1">
                        {on.slice(0, 4).map((s) => (
                          <span
                            key={s.id}
                            className={`h-[5px] w-[5px] rounded-full sm:h-1.5 sm:w-1.5 ${st === 'next' ? 'bg-navy' : 'bg-white'}`}
                          />
                        ))}
                      </span>
                    )}
                    {isSel && (
                      <motion.span
                        layoutId="cal-sel"
                        className="absolute -bottom-[9px] h-[4px] w-1/2 rounded-full bg-ink sm:-bottom-[11px]"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-navy">
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded bg-navy" /> Выполнено
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded bg-pink" /> Сейчас
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded bg-greyl" /> Впереди
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded ring-[3px] ring-red" /> Сегодня
              </span>
            </div>
          </div>

          <div className="mt-10 md:mt-0">
            <AnimatePresence mode="wait" initial={false}>
              {selected && (
                <motion.div
                  key={selected}
                  initial={reduce ? false : { opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: -30 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="rounded-[24px] border-2 border-navy p-5 sm:p-7"
                >
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-[22px] font-extrabold leading-tight text-navy first-letter:uppercase sm:text-[26px]">
                      {longDay(selected)}
                    </span>
                    {selected === today && (
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-red">
                        <span className="h-2 w-2 rounded-full bg-red motion-safe:animate-blink" />
                        сегодня
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[14px] font-medium text-greyt">
                    {list.length} {list.length === 1 ? 'этап' : list.length < 5 ? 'этапа' : 'этапов'}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {list.map((s, i) => (
                      <motion.li
                        key={s.id}
                        initial={reduce ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: EASE, delay: 0.08 + i * 0.07 }}
                      >
                        <button
                          type="button"
                          onClick={() => onOpenStage(s.id)}
                          className={`group flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-colors duration-200 ${
                            s.status === 'current' ? 'bg-pink text-white' : 'bg-greyl/60 text-navy hover:bg-greyl'
                          }`}
                        >
                          <span className="text-[22px] font-extrabold leading-none">{pad(s.id)}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-bold leading-snug">{s.title}</span>
                            <span
                              className={`mt-1 flex items-center gap-1.5 text-[12px] font-semibold ${
                                s.status === 'current' ? 'text-white/85' : 'text-greyt'
                              }`}
                            >
                              {s.status !== 'current' && <Dot status={s.status} className="scale-75" />}
                              {statusLabel[s.status]}
                            </span>
                          </span>
                          <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  )
}
