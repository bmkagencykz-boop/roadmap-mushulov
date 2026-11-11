import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { roadmap } from '../roadmap'
import { getDayProgress, getProgress, joinNumbers, pad } from '../progress'
import { longDay, stageDateLabel, todayKey } from '../dates'
import { ArrowIcon, Container, Counter, EASE } from './ui'

export function Hero({ onOpenStage }: { onOpenStage: (id: number) => void }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bigY = useTransform(scrollYProgress, [0, 1], [0, 160])

  const { stages } = roadmap
  const { total, done, focus, finished, percent, current } = getProgress(stages)
  const days = getDayProgress(stages)
  const ids = focus.map((s) => s.id)
  const main = ids[0] ?? total

  return (
    <section ref={ref} className="relative overflow-hidden bg-navy text-white">
      {/* огромная контурная цифра на фоне */}
      <motion.span
        aria-hidden
        style={reduce ? undefined : { y: bigY }}
        className="pointer-events-none absolute -right-6 -top-10 select-none text-[300px] font-extrabold leading-none text-transparent sm:-top-24 sm:text-[520px]"
      >
        <span style={{ WebkitTextStroke: '2px rgba(255,255,255,0.08)' }}>{finished ? total : main}</span>
      </motion.span>

      <Container className="relative grid gap-12 pb-16 pt-12 sm:pb-24 sm:pt-20 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-14">
        <div>
          <motion.p
            className="font-latin text-[12px] tracking-[0.3em] text-pink"
            initial={reduce ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            AUDIT ROADMAP
          </motion.p>

          <h1 className="mt-5">
            <motion.span
              className="block text-[26px] font-extrabold leading-none sm:text-[34px]"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            >
              {finished ? 'Аудит завершён' : ids.length > 1 ? 'Сейчас этапы' : 'Сейчас этап'}
            </motion.span>
            <span className="mt-1 flex items-end gap-3">
              <motion.span
                className="text-[128px] font-extrabold leading-[0.85] text-pink sm:text-[180px]"
                initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.2 }}
              >
                {finished ? total : ids.length > 1 ? joinNumbers(ids) : <Counter value={main} duration={0.9} delay={0.2} />}
              </motion.span>
              <motion.span
                className="pb-3 text-[44px] font-extrabold leading-none text-greyt sm:pb-5 sm:text-[60px]"
                initial={reduce ? false : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
              >
                /{total}
              </motion.span>
            </span>
          </h1>

          {days && (
            <motion.p
              className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-semibold"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red motion-safe:animate-blink" />
                {days.before ? 'Аудит скоро начнётся' : days.after ? 'Все дни аудита позади' : `День ${days.day} из ${days.total}`}
              </span>
              <span className="text-greyt">Сегодня {longDay(todayKey())}</span>
            </motion.p>
          )}

          <div
            className="mt-8 flex gap-1.5"
            role="progressbar"
            aria-label="Выполнено этапов"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
          >
            {stages.map((s, i) => (
              <span key={s.id} className="relative h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                {s.status !== 'next' && (
                  <motion.span
                    className={`absolute inset-0 origin-left rounded-full ${s.status === 'done' ? 'bg-white' : 'bg-pink'}`}
                    initial={reduce ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.35, delay: 0.5 + i * 0.12, ease: 'easeOut' }}
                  />
                )}
                {s.status === 'current' && (
                  <span className="absolute inset-0 rounded-full bg-white/60 motion-safe:animate-blink" />
                )}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-end justify-between">
            <p className="text-[15px] font-semibold text-greyt">
              Выполнено <span className="text-white">{done}</span> из {total}
            </p>
            <p className="text-[40px] font-extrabold leading-none">
              <Counter value={percent} delay={0.5} />
              <span className="text-pink">%</span>
            </p>
          </div>
        </div>

        {focus.length > 0 && (
          <motion.div
            className="relative overflow-hidden rounded-[28px] bg-pink p-6 text-white sm:p-8"
            initial={reduce ? false : { opacity: 0, y: 60, rotate: -4, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 110, damping: 15, delay: 0.35 }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-3 text-[13px] font-extrabold uppercase tracking-[0.14em]">
                <span className="relative inline-flex h-3 w-3">
                  <span className="absolute inset-0 rounded-full bg-white motion-safe:animate-ring" />
                  <span className="relative h-3 w-3 rounded-full bg-white" />
                </span>
                {current.length ? 'Сейчас делаем' : 'Следующий этап'}
              </p>
            </div>
            {focus.map((s, i) => (
              <motion.div
                key={s.id}
                className="mt-6"
                initial={reduce ? false : { opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.6 + i * 0.1 }}
              >
                <p className="flex items-baseline gap-3">
                  <span className="text-[56px] font-extrabold leading-none text-white/35">{pad(s.id)}</span>
                  <span className="text-[14px] font-semibold">{stageDateLabel(s)}</span>
                </p>
                <h2 className="mt-3 text-[24px] font-extrabold leading-tight sm:text-[28px]">{s.title}</h2>
                {s.subtitle && <p className="mt-1.5 text-[14px] font-medium text-white/80">{s.subtitle}</p>}
                <p className="mt-4 text-[15px] leading-relaxed text-white/95">{s.what}</p>
              </motion.div>
            ))}
            <motion.button
              type="button"
              onClick={() => onOpenStage(focus[0].id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.96 }}
              className="group mt-7 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-[15px] font-extrabold text-navy"
            >
              Подробнее
              <ArrowIcon className="text-pink transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        )}
      </Container>
    </section>
  )
}

/** Бегущая строка. Только латиница капсом, поэтому Days One */
export function Marquee() {
  const { stages } = roadmap
  const { focus, total } = getProgress(stages)
  const stage = focus[0]?.id ?? total
  const items = ['AUDIT IN PROGRESS', `STAGE ${stage} / ${total}`, 'SMILE SALES AGENCY', 'SALES AUDIT']
  const row = (
    <span className="flex shrink-0 items-center">
      {items.map((t) => (
        <span key={t} className="flex items-center">
          <span className="px-6 font-latin text-[15px] tracking-[0.2em] text-white sm:text-[18px]">{t}</span>
          <span className="h-2.5 w-2.5 rounded-full bg-white" />
        </span>
      ))}
    </span>
  )
  return (
    <div aria-hidden className="overflow-hidden bg-red py-4">
      <div className="flex w-max motion-safe:animate-marquee">
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  )
}
