import { useCallback, useState } from 'react'
import { roadmap } from './roadmap'
import { Hero, Marquee } from './components/Hero'
import { Calendar } from './components/Calendar'
import { Timeline, type Filter } from './components/Timeline'
import { Footer, Parallel, Received } from './components/Blocks'
import { Container, Logo, SectionHead } from './components/ui'

export default function App() {
  const [filter, setFilter] = useState<Filter>('all')
  // По умолчанию раскрыт текущий этап
  const [open, setOpen] = useState<Set<number>>(
    () => new Set(roadmap.stages.filter((s) => s.status === 'current').map((s) => s.id)),
  )

  const toggle = useCallback((id: number) => {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const openInRoadmap = useCallback((id: number) => {
    setFilter('all')
    setOpen((prev) => new Set(prev).add(id))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // ждём, пока таймлайн перерисуется с фильтром «Все»
    window.setTimeout(() => {
      document.getElementById(`stage-${id}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }, 80)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <header className="bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
          <Logo />
          <p className="text-[13px] font-semibold text-navy sm:text-right">
            {roadmap.auditTitle}
            <span className="block text-greyt sm:inline"><span className="hidden sm:inline"> · </span>старт {roadmap.start}</span>
          </p>
        </Container>
      </header>

      <main>
        <Hero onOpenStage={openInRoadmap} />
        <Marquee />
        <Calendar onOpenStage={openInRoadmap} />

        <section className="border-t-2 border-greyl py-16 sm:py-24">
          <Container>
            <SectionHead latin="ROADMAP" title="Дорожная карта">
              <p className="mt-4 max-w-[540px] text-[16px] font-medium leading-relaxed text-greyt">
                Нажмите на этап, чтобы увидеть, что делаем, зачем и что получит клиника.
              </p>
            </SectionHead>
            <Timeline filter={filter} onFilter={setFilter} open={open} onToggle={toggle} />
          </Container>
        </section>

        <Received />
        <Parallel />
      </main>

      <Footer />
    </div>
  )
}
