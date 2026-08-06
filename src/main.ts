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

initReveal()
initHeader()
