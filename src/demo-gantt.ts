type Task = {
  id: string
  name: string
  group: string
  start: string
  end: string
  progress: number
  color: string
}

const TASKS: Task[] = [
  {
    id: 'discovery',
    name: 'Discovery',
    group: 'Phase 1',
    start: '2026-03-02',
    end: '2026-03-20',
    progress: 1,
    color: '#2DD4BF',
  },
  {
    id: 'design',
    name: 'Design',
    group: 'Phase 1',
    start: '2026-03-16',
    end: '2026-04-10',
    progress: 0.85,
    color: '#0F3D36',
  },
  {
    id: 'build',
    name: 'Build',
    group: 'Phase 2',
    start: '2026-03-30',
    end: '2026-05-01',
    progress: 0.55,
    color: '#FBBF24',
  },
  {
    id: 'pilot',
    name: 'Pilot',
    group: 'Phase 2',
    start: '2026-04-20',
    end: '2026-05-08',
    progress: 0.2,
    color: '#7CFFB2',
  },
  {
    id: 'launch',
    name: 'Launch',
    group: 'Phase 3',
    start: '2026-05-04',
    end: '2026-05-22',
    progress: 0,
    color: '#1A6B5C',
  },
]

const TODAY = '2026-04-15'
const RANGE_START = '2026-03-01'
const RANGE_END = '2026-05-31'

function parseDay(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`)
}

function daysBetween(a: string, b: string): number {
  return Math.round((parseDay(b) - parseDay(a)) / 86_400_000)
}

function formatShort(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

function formatRange(start: string, end: string): string {
  return `${formatShort(start)} – ${formatShort(end)}`
}

function durationDays(start: string, end: string): number {
  return daysBetween(start, end) + 1
}

function pct(value: number): string {
  return `${Math.round(value * 100)}%`
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

function monthTicks(start: string, end: string): { label: string; left: number }[] {
  const total = daysBetween(start, end)
  const ticks: { label: string; left: number }[] = []
  const cursor = new Date(`${start}T00:00:00Z`)
  cursor.setUTCDate(1)
  if (cursor.getTime() < parseDay(start)) {
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }

  while (cursor.getTime() <= parseDay(end)) {
    const iso = cursor.toISOString().slice(0, 10)
    ticks.push({
      label: cursor.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }),
      left: clamp01(daysBetween(start, iso) / total),
    })
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return ticks
}

function weekendBands(start: string, end: string): { left: number; width: number }[] {
  const total = daysBetween(start, end)
  const bands: { left: number; width: number }[] = []
  const cursor = new Date(`${start}T00:00:00Z`)

  while (cursor.getTime() <= parseDay(end)) {
    const day = cursor.getUTCDay()
    if (day === 6 || day === 0) {
      const iso = cursor.toISOString().slice(0, 10)
      bands.push({
        left: clamp01(daysBetween(start, iso) / total),
        width: 1 / total,
      })
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return bands
}

export function mountDemoGantt(root: HTMLElement): void {
  const total = daysBetween(RANGE_START, RANGE_END)
  const selected = new Set<string>()
  let tipTask: Task | null = null

  root.innerHTML = `
    <div class="demo-gantt" role="application" aria-label="Interactive Gantt preview">
      <div class="demo-toolbar">
        <p class="demo-hint">Hover for details · click to select · Ctrl/Cmd multi-select</p>
        <button type="button" class="demo-clear" hidden>Clear selection</button>
      </div>
      <div class="demo-board">
        <div class="demo-labels" aria-hidden="true"></div>
        <div class="demo-chart">
          <div class="demo-months"></div>
          <div class="demo-canvas">
            <div class="demo-weekends" aria-hidden="true"></div>
            <div class="demo-grid" aria-hidden="true"></div>
            <div class="demo-today" aria-hidden="true">
              <span class="demo-today-dot"></span>
              <span class="demo-today-line"></span>
            </div>
            <div class="demo-rows" role="list"></div>
          </div>
        </div>
      </div>
      <div class="demo-tooltip" role="tooltip" hidden></div>
      <p class="demo-footnote">Website preview with sample data — not live Power BI.</p>
    </div>
  `

  const labelsEl = root.querySelector<HTMLElement>('.demo-labels')!
  const monthsEl = root.querySelector<HTMLElement>('.demo-months')!
  const weekendsEl = root.querySelector<HTMLElement>('.demo-weekends')!
  const gridEl = root.querySelector<HTMLElement>('.demo-grid')!
  const todayEl = root.querySelector<HTMLElement>('.demo-today')!
  const rowsEl = root.querySelector<HTMLElement>('.demo-rows')!
  const tipEl = root.querySelector<HTMLElement>('.demo-tooltip')!
  const clearBtn = root.querySelector<HTMLButtonElement>('.demo-clear')!
  const chartEl = root.querySelector<HTMLElement>('.demo-chart')!

  monthsEl.innerHTML = monthTicks(RANGE_START, RANGE_END)
    .map(
      (t) =>
        `<span class="demo-month" style="left:${pct(t.left)}">${t.label}</span>`,
    )
    .join('')

  weekendsEl.innerHTML = weekendBands(RANGE_START, RANGE_END)
    .map(
      (b) =>
        `<span class="demo-weekend" style="left:${pct(b.left)};width:${pct(b.width)}"></span>`,
    )
    .join('')

  gridEl.innerHTML = monthTicks(RANGE_START, RANGE_END)
    .map((t) => `<span class="demo-gridline" style="left:${pct(t.left)}"></span>`)
    .join('')

  const todayLeft = clamp01(daysBetween(RANGE_START, TODAY) / total)
  todayEl.style.left = pct(todayLeft)

  labelsEl.innerHTML = TASKS.map(
    (task) =>
      `<div class="demo-label" data-id="${task.id}">
        <span class="demo-label-name">${task.name}</span>
        <span class="demo-label-group">${task.group}</span>
      </div>`,
  ).join('')

  rowsEl.innerHTML = TASKS.map((task) => {
    const left = clamp01(daysBetween(RANGE_START, task.start) / total)
    const width = clamp01(durationDays(task.start, task.end) / total)
    return `
      <div class="demo-row" role="listitem">
        <button
          type="button"
          class="demo-bar"
          data-id="${task.id}"
          style="left:${pct(left)};width:${pct(width)};--bar:${task.color}"
          aria-pressed="false"
          aria-label="${task.name}, ${formatRange(task.start, task.end)}, ${pct(task.progress)} complete"
        >
          <span class="demo-bar-fill" style="width:${pct(task.progress)}"></span>
          <span class="demo-bar-label">${task.name}</span>
        </button>
      </div>
    `
  }).join('')

  const bars = [...root.querySelectorAll<HTMLButtonElement>('.demo-bar')]
  const labelNodes = [...root.querySelectorAll<HTMLElement>('.demo-label')]

  function syncSelection(): void {
    const any = selected.size > 0
    clearBtn.hidden = !any
    for (const bar of bars) {
      const id = bar.dataset.id!
      const isOn = selected.has(id)
      bar.classList.toggle('is-selected', isOn)
      bar.classList.toggle('is-dimmed', any && !isOn)
      bar.setAttribute('aria-pressed', String(isOn))
    }
    for (const label of labelNodes) {
      const id = label.dataset.id!
      const isOn = selected.has(id)
      label.classList.toggle('is-selected', isOn)
      label.classList.toggle('is-dimmed', any && !isOn)
    }
  }

  function showTip(task: Task, clientX: number, clientY: number): void {
    tipTask = task
    tipEl.hidden = false
    tipEl.innerHTML = `
      <strong>${task.name}</strong>
      <span>${formatRange(task.start, task.end)}</span>
      <span>${durationDays(task.start, task.end)} days · ${pct(task.progress)} done</span>
      <span>${task.group}</span>
    `
    positionTip(clientX, clientY)
  }

  function positionTip(clientX: number, clientY: number): void {
    const pad = 14
    const rect = tipEl.getBoundingClientRect()
    const board = chartEl.getBoundingClientRect()
    let x = clientX - board.left + 16
    let y = clientY - board.top - rect.height - 12
    if (x + rect.width > board.width - pad) x = board.width - rect.width - pad
    if (x < pad) x = pad
    if (y < pad) y = clientY - board.top + 18
    tipEl.style.transform = `translate(${x}px, ${y}px)`
  }

  function hideTip(): void {
    tipTask = null
    tipEl.hidden = true
  }

  for (const bar of bars) {
    const task = TASKS.find((t) => t.id === bar.dataset.id)!

    bar.addEventListener('pointerenter', (e) => {
      showTip(task, e.clientX, e.clientY)
    })
    bar.addEventListener('pointermove', (e) => {
      if (tipTask?.id === task.id) positionTip(e.clientX, e.clientY)
    })
    bar.addEventListener('pointerleave', hideTip)
    bar.addEventListener('focus', () => {
      const r = bar.getBoundingClientRect()
      showTip(task, r.left + r.width / 2, r.top)
    })
    bar.addEventListener('blur', hideTip)

    bar.addEventListener('click', (e) => {
      const multi = e.metaKey || e.ctrlKey
      const id = task.id
      if (multi) {
        if (selected.has(id)) selected.delete(id)
        else selected.add(id)
      } else if (selected.has(id) && selected.size === 1) {
        selected.clear()
      } else {
        selected.clear()
        selected.add(id)
      }
      syncSelection()
    })
  }

  clearBtn.addEventListener('click', () => {
    selected.clear()
    syncSelection()
  })

  syncSelection()
}
