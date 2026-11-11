import type { Stage, Status } from './roadmap'
import { auditRange, todayKey } from './dates'

export const statusLabel: Record<Status, string> = {
  done: 'Выполнено',
  current: 'Сейчас',
  next: 'Впереди',
}

/** Всё, что показывается на главном экране, считается из статусов этапов. */
export function getProgress(stages: Stage[]) {
  const total = stages.length
  const done = stages.filter((s) => s.status === 'done').length
  const current = stages.filter((s) => s.status === 'current')
  const finished = total > 0 && done === total
  // Если ни один этап не отмечен «Сейчас», фокус на первом невыполненном.
  const focus = current.length > 0 ? current : stages.filter((s) => s.status !== 'done').slice(0, 1)
  const percent = total ? Math.round((done / total) * 100) : 0
  return { total, done, current, focus, finished, percent }
}

/** «День 2 из 7» по календарю аудита и сегодняшней дате */
export function getDayProgress(stages: Stage[]) {
  const range = auditRange(stages)
  const today = todayKey()
  if (!range.length) return null
  const total = range.length
  let day: number
  if (today < range[0]) day = 0
  else if (today > range[range.length - 1]) day = total
  else day = range.indexOf(today) + 1
  return { day, total, before: today < range[0], after: today > range[range.length - 1] }
}

/** «4», «5 и 6», «5, 6 и 7» */
export function joinNumbers(ids: number[]) {
  if (ids.length <= 1) return String(ids[0] ?? '')
  return `${ids.slice(0, -1).join(', ')} и ${ids[ids.length - 1]}`
}

export const pad = (n: number) => String(n).padStart(2, '0')
