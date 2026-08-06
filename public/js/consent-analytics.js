/**
 * Datalund site analytics — EU/EEA (Norway) consent-gated.
 *
 * - No analytics until the visitor opts in
 * - Preference stored in localStorage (strictly necessary for consent)
 * - Honours Global Privacy Control / DNT as a decline
 * - Uses Plausible (cookieless, privacy-friendly) after consent
 * - Tracks page views + download clicks as custom events
 *
 * Setup: create a site for datalund.no at https://plausible.io
 * (or self-host) and add a "Download" goal for custom events.
 */
;(() => {
  const CONSENT_KEY = 'datalund-analytics-consent'
  const DOMAIN = 'datalund.no'
  // tagged-events build lets us send Download props from clicks
  const SCRIPT_SRC = 'https://plausible.io/js/script.tagged-events.js'

  /** @type {'granted' | 'denied' | null} */
  let consent = readConsent()
  let scriptLoaded = false

  window.plausible =
    window.plausible ||
    function () {
      ;(window.plausible.q = window.plausible.q || []).push(arguments)
    }

  function readConsent() {
    try {
      const value = localStorage.getItem(CONSENT_KEY)
      if (value === 'granted' || value === 'denied') return value
    } catch {
      /* private mode / blocked storage */
    }
    return null
  }

  function writeConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value)
    } catch {
      /* ignore */
    }
    consent = value
  }

  function prefersReducedTracking() {
    if (navigator.globalPrivacyControl === true) return true
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return true
    return false
  }

  function loadPlausible() {
    if (scriptLoaded) return
    scriptLoaded = true
    const script = document.createElement('script')
    script.defer = true
    script.dataset.domain = DOMAIN
    script.src = SCRIPT_SRC
    document.head.appendChild(script)
  }

  function disableAnalytics() {
    // Stop further queueing; Plausible has no unload API for the script tag.
    window.plausible = function () {}
    scriptLoaded = false
  }

  function trackDownload(file) {
    if (consent !== 'granted') return
    window.plausible('Download', { props: { file } })
  }

  function bindDownloadClicks(root) {
    const scope = root || document
    scope.querySelectorAll('[data-analytics-download]').forEach((el) => {
      if (el.dataset.analyticsBound === '1') return
      el.dataset.analyticsBound = '1'
      el.addEventListener(
        'click',
        () => {
          const file = el.getAttribute('data-analytics-download') || 'unknown'
          trackDownload(file)
        },
        { passive: true },
      )
    })
  }

  function hideBanner() {
    document.getElementById('datalund-consent')?.remove()
  }

  function applyConsent(value, { persist = true } = {}) {
    if (persist) writeConsent(value)
    else consent = value

    document.documentElement.dataset.analyticsConsent = value
    hideBanner()

    if (value === 'granted') {
      loadPlausible()
      bindDownloadClicks()
    } else {
      disableAnalytics()
    }

    window.dispatchEvent(
      new CustomEvent('datalund:consent', { detail: { consent: value } }),
    )
  }

  function showBanner() {
    if (document.getElementById('datalund-consent')) return

    const banner = document.createElement('div')
    banner.id = 'datalund-consent'
    banner.className = 'consent-banner'
    banner.setAttribute('role', 'dialog')
    banner.setAttribute('aria-modal', 'false')
    banner.setAttribute('aria-labelledby', 'datalund-consent-title')
    banner.setAttribute('aria-describedby', 'datalund-consent-desc')
    banner.innerHTML = `
      <div class="consent-inner">
        <div class="consent-copy">
          <p id="datalund-consent-title" class="consent-title">Analytics</p>
          <p id="datalund-consent-desc" class="consent-text">
            We use privacy-friendly, cookieless analytics to count page visits and
            downloads. No ads, no profiling, no sale of data.
            <a href="/privacy/#analytics">Privacy policy</a>
          </p>
        </div>
        <div class="consent-actions">
          <button type="button" class="consent-btn consent-decline" data-consent="denied">Decline</button>
          <button type="button" class="consent-btn consent-accept" data-consent="granted">Accept</button>
        </div>
      </div>
    `
    document.body.appendChild(banner)

    banner.querySelectorAll('[data-consent]').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyConsent(btn.getAttribute('data-consent'))
      })
    })
  }

  function initPreferencesLinks() {
    document.querySelectorAll('[data-analytics-preferences]').forEach((el) => {
      el.addEventListener('click', (event) => {
        event.preventDefault()
        // Clear stored choice and show the banner again
        try {
          localStorage.removeItem(CONSENT_KEY)
        } catch {
          /* ignore */
        }
        consent = null
        disableAnalytics()
        document.documentElement.dataset.analyticsConsent = ''
        showBanner()
        document.getElementById('datalund-consent')?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        })
      })
    })
  }

  function init() {
    bindDownloadClicks()
    initPreferencesLinks()

    if (consent === 'granted') {
      applyConsent('granted', { persist: false })
      return
    }

    if (consent === 'denied') {
      document.documentElement.dataset.analyticsConsent = 'denied'
      return
    }

    if (prefersReducedTracking()) {
      applyConsent('denied')
      return
    }

    showBanner()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // Public helpers for optional future use
  window.datalundAnalytics = {
    getConsent: () => consent,
    accept: () => applyConsent('granted'),
    decline: () => applyConsent('denied'),
    trackDownload,
  }
})()
