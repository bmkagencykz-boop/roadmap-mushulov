import { roadmap, type Stage, type Status } from './roadmap'

/** Ключ дня: 'YYYY-MM-DD' */
export type DayKey = string

const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
export const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
const WEEKDAYS_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']

const pad2 = (n: number) => String(n).padStart(2, '0')
const keyOf = (d: Date): DayKey => `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
export const toDate = (k: DayKey) => new Date(`${k}T00:00:00Z`)
const addDays = (k: DayKey, n: number) => {
  const d = toDate(k)
  d.setUTCDate(d.getUTCDate() + n)
  return keyOf(d)
}

/** '12.11' → '2026-11-12' */
export function parseDM(s: string | undefined): DayKey | null {
  const m = s?.trim().match(/^(\d{1,2})\.(\d{1,2})$/)
  if (!m) return null
  return `${roadmap.year}-${pad2(Number(m[2]))}-${pad2(Number(m[1]))}`
}

/** Все дни этапа (от date до dateEnd включительно) */
export function stageDays(s: Stage): DayKey[] {
  const a = parseDM(s.date)
  if (!a) return []
  const b = parseDM(s.dateEnd) ?? a
  const out: DayKey[] = []
  for (let k = a; k <= b && out.length < 60; k = addDays(k, 1)) out.push(k)
  return out
}

export const dayNum = (k: DayKey) => toDate(k).getUTCDate()
export const monthShort = (k: DayKey) => MONTHS_SHORT[toDate(k).getUTCMonth()]
export const monthTitle = (k: DayKey) => `${MONTHS_NOM[toDate(k).getUTCMonth()]} ${toDate(k).getUTCFullYear()}`
export const weekdayShort = (k: DayKey) => WEEKDAYS_SHORT[toDate(k).getUTCDay()]
export const longDay = (k: DayKey) =>
  `${WEEKDAYS_FULL[toDate(k).getUTCDay()]}, ${dayNum(k)} ${MONTHS_GEN[toDate(k).getUTCMonth()]}`

/** '12.11' или '14–16.11' */
export function stageDateLabel(s: Stage): string {
  const days = stageDays(s)
  if (!days.length) return 'дата уточняется'
  const a = days[0]
  const b = days[days.length - 1]
  if (a === b) return `${dayNum(a)} ${monthShort(a)}`
  if (toDate(a).getUTCMonth() === toDate(b).getUTCMonth()) return `${dayNum(a)}–${dayNum(b)} ${monthShort(b)}`
  return `${dayNum(a)} ${monthShort(a)} – ${dayNum(b)} ${monthShort(b)}`
}

/** Сегодня по времени Алматы */
export function todayKey(): DayKey {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(),
  )
}

/** Непрерывный ряд дней аудита: от первой даты до последней */
export function auditRange(stages: Stage[]): DayKey[] {
  const all = stages.flatMap(stageDays).sort()
  if (!all.length) return []
  const out: DayKey[] = []
  for (let k = all[0]; k <= all[all.length - 1] && out.length < 120; k = addDays(k, 1)) out.push(k)
  return out
}

/** Недели (пн–вс), которые покрывают дни аудита */
export function calendarWeeks(range: DayKey[]): DayKey[][] {
  if (!range.length) return []
  const first = range[0]
  const last = range[range.length - 1]
  const mondayOffset = (toDate(first).getUTCDay() + 6) % 7
  let k = addDays(first, -mondayOffset)
  const weeks: DayKey[][] = []
  while (k <= last) {
    const w: DayKey[] = []
    for (let i = 0; i < 7; i++) w.push(addDays(k, i))
    weeks.push(w)
    k = addDays(k, 7)
  }
  return weeks
}

export function stagesOn(stages: Stage[], k: DayKey) {
  return stages.filter((s) => stageDays(s).includes(k))
}

export function dayStatus(list: Stage[]): Status | null {
  if (!list.length) return null
  if (list.some((s) => s.status === 'current')) return 'current'
  if (list.every((s) => s.status === 'done')) return 'done'
  return 'next'
}

/** Даты блока «Параллельно» из этапов from..to */
export function parallelLabel(): string {
  const { from, to } = roadmap.parallel
  const days = roadmap.stages.filter((s) => s.id >= from && s.id <= to).flatMap(stageDays).sort()
  if (!days.length) return ''
  const a = days[0]
  const b = days[days.length - 1]
  return a === b ? `${dayNum(a)} ${monthShort(a)}` : `${dayNum(a)}–${dayNum(b)} ${monthShort(b)}`
}
