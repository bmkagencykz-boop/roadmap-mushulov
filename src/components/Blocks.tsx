import { motion, useReducedMotion } from 'framer-motion'
import { roadmap } from '../roadmap'
import { statusLabel } from '../progress'
import { parallelLabel } from '../dates'
import { ArrowIcon, Container, Counter, Dot, DrawCheck, EASE, Logo, SectionHead } from './ui'

export function Received() {
  const reduce = useReducedMotion()
  const items = roadmap.received
  const got = items.filter((i) => i.received).length
  return (
    <section className="bg-navy py-16 text-white sm:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead latin="ACCESS" title="Получено от клиники" dark />
          <p className="text-[72px] font-extrabold leading-none sm:text-[110px]">
            <span className="text-pink">
              <Counter value={got} />
            </span>
            <span className="text-greyt">/{items.length}</span>
          </p>
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item, i) => (
            <motion.li
              key={item.title}
              initial={reduce ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={reduce ? undefined : { y: -6 }}
              transition={{ duration: 0.55, ease: EASE, delay: i * 0.08 }}
              className="flex items-center gap-4 rounded-[22px] border-2 border-white/15 p-5 lg:flex-col lg:items-start"
            >
              <DrawCheck ok={item.received} delay={0.2 + i * 0.08} />
              <span>
                <span className="block text-[18px] font-extrabold leading-tight">{item.title}</span>
                <span className="mt-0.5 block text-[13px] font-semibold text-white/60">{item.received ? 'получено' : 'ожидаем'}</span>
              </span>
            </motion.li>
          ))}
        </ul>
        <p className="mt-6 text-[13px] font-medium text-white/50">Логины и пароли на этой странице не публикуются.</p>
      </Container>
    </section>
  )
}

export function Parallel() {
  const reduce = useReducedMotion()
  const p = roadmap.parallel
  const { stages } = roadmap
  const dates = parallelLabel()
  return (
    <section id="parallel" className="scroll-mt-4 py-16 sm:py-24">
      <Container>
        <SectionHead latin="PARALLEL" title="Параллельно" accent="text-red" />
        <motion.div
          className="mt-10 rounded-[28px] border-[3px] border-red p-6 sm:p-10"
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '0px 0px -60px 0px' }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-extrabold uppercase tracking-[0.12em] text-red">
            <Dot status={p.status} />
            {dates && <span>{dates}</span>}
            <span>· этапы {p.from}–{p.to}</span>
            <span className="text-greyt">· {statusLabel[p.status].toLowerCase()}</span>
          </p>
          <h3 className="mt-4 text-[28px] font-extrabold leading-tight text-navy sm:text-[40px]">{p.title}</h3>
          <p className="mt-3 max-w-[620px] text-[16px] leading-relaxed sm:text-[17px]">{p.text}</p>

          {/* где этот блок стоит относительно всех этапов */}
          <div className="mt-10" aria-hidden>
            <div className="relative grid" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
              {stages.map((s) => {
                const inRange = s.id >= p.from && s.id <= p.to
                return (
                  <div key={s.id} className="flex flex-col items-center">
                    <span className="relative mb-3 flex h-[6px] self-stretch">
                      {inRange && (
                        <motion.span
                          className={`h-full flex-1 origin-left bg-red ${s.id === p.from ? 'ml-[50%] rounded-l-full' : ''} ${
                            s.id === p.to ? 'mr-[50%] rounded-r-full' : ''
                          }`}
                          initial={reduce ? false : { scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.25, ease: 'linear', delay: 0.3 + (s.id - p.from) * 0.22 }}
                        />
                      )}
                    </span>
                    <Dot status={s.status} />
                    <span className={`mt-2 text-[11px] font-extrabold sm:text-[13px] ${inRange ? 'text-red' : 'text-greyt'}`}>{s.id}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}

export function Footer() {
  const { contact } = roadmap
  const updated = roadmap.updated.trim() || __BUILD_DATE__
  return (
    <footer className="bg-navy text-white">
      <Container className="py-16 sm:py-20">
        <p className="text-[34px] font-extrabold leading-[1.05] sm:text-[56px]">
          Есть вопросы
          <br />
          по аудиту<span className="text-pink">?</span>
        </p>
        <motion.a
          href={contact.href}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="group mt-8 inline-flex items-center gap-4 rounded-full bg-pink px-7 py-4 text-[17px] font-extrabold text-white sm:text-[19px]"
        >
          {contact.label} {contact.value}
          <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1.5" />
        </motion.a>
        <div className="mt-14 flex flex-wrap items-end justify-between gap-4 border-t-2 border-white/15 pt-6">
          <Logo dark />
          <p className="text-[13px] font-semibold text-white/55">Обновлено {updated}</p>
        </div>
      </Container>
    </footer>
  )
}
