import './style.css'
import { mountDemoGantt } from './demo-gantt'

const demoRoot = document.querySelector<HTMLElement>('#gantt-demo')
if (demoRoot) mountDemoGantt(demoRoot)

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
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )

  nodes.forEach((el) => io.observe(el))
}

initReveal()
