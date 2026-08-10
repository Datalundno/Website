import './style.css'

function initReveal() {
  const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]')
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    nodes.forEach((el) => el.classList.add('is-visible'))
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
  )

  nodes.forEach((el) => io.observe(el))
}

function initHeader() {
  const header = document.querySelector<HTMLElement>('.site-header')
  if (!header) return

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24)
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}

function initCarousel() {
  const root = document.querySelector<HTMLElement>('[data-carousel]')
  if (!root) return

  const tabs = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-carousel-tab]'),
  )
  const panels = Array.from(
    root.querySelectorAll<HTMLElement>('[data-carousel-panel]'),
  )
  const prev = root.querySelector<HTMLButtonElement>('[data-carousel-prev]')
  const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]')
  if (!tabs.length || tabs.length !== panels.length) return

  let index = Math.max(
    0,
    tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true'),
  )

  const syncVideos = (active: number) => {
    panels.forEach((panel, i) => {
      const video = panel.querySelector('video')
      if (!video) return
      if (i === active) {
        // Skip the blank title card at the start of the Gantt reel.
        if (video.currentTime < 2.2) video.currentTime = 2.2
        void video.play().catch(() => {})
      } else {
        video.pause()
      }
    })
  }

  // After a loop restart, jump past the blank intro again.
  panels.forEach((panel) => {
    const video = panel.querySelector('video')
    if (!video) return
    let pastIntro = false
    video.addEventListener('timeupdate', () => {
      if (video.currentTime > 3) pastIntro = true
      if (pastIntro && video.currentTime < 0.4) {
        pastIntro = false
        video.currentTime = 2.2
      }
    })
  })

  const show = (nextIndex: number) => {
    index = (nextIndex + panels.length) % panels.length

    tabs.forEach((tab, i) => {
      const on = i === index
      tab.classList.toggle('is-active', on)
      tab.setAttribute('aria-selected', on ? 'true' : 'false')
      tab.tabIndex = on ? 0 : -1
    })

    panels.forEach((panel, i) => {
      const on = i === index
      panel.classList.toggle('is-active', on)
      panel.hidden = !on
    })

    syncVideos(index)
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => show(i))
  })

  prev?.addEventListener('click', () => show(index - 1))
  next?.addEventListener('click', () => show(index + 1))

  root.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement | null
    if (!target?.closest('[role="tablist"]')) return

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      show(index + 1)
      tabs[index]?.focus()
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      show(index - 1)
      tabs[index]?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      show(0)
      tabs[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      show(panels.length - 1)
      tabs[panels.length - 1]?.focus()
    }
  })

  show(index)
}

initReveal()
initHeader()
initCarousel()
