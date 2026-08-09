/**
 * Datalund site analytics — EU/EEA (Norway) consent-gated Google Analytics 4.
 *
 * - Removes third-party counters other than GA4
 * - No GA until the visitor opts in
 * - Preference stored in localStorage (strictly necessary for consent)
 * - Honours Global Privacy Control / DNT as a decline
 * - Ads storage stays denied; analytics_storage only after Accept
 * - Tracks page views + download clicks as GA4 events
 *
 * Setup:
 * 1. Create a GA4 property for https://datalund.no in Google Analytics
 * 2. Copy the Measurement ID (G-XXXXXXXXXX)
 * 3. Paste it into GA_MEASUREMENT_ID below and deploy
 */
;(() => {
  const CONSENT_KEY = 'datalund-analytics-consent'
  /** @type {string} e.g. 'G-XXXXXXXXXX' */
  const GA_MEASUREMENT_ID = ''

  /** @type {'granted' | 'denied' | null} */
  let consent = readConsent()
  let scriptLoaded = false

  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments)
    }

  function gaConfigured() {
    return /^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID)
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

  function loadGoogleAnalytics() {
    if (scriptLoaded || !gaConfigured()) return
    scriptLoaded = true

    // Consent already granted before load; keep ads off.
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    })
    window.gtag('js', new Date())
    window.gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script)
  }

  function disableAnalytics() {
    if (scriptLoaded && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
    }
    window.gtag = function () {
      /* no-op after decline */
    }
    scriptLoaded = false
  }

  function trackDownload(file) {
    if (consent !== 'granted' || !gaConfigured()) return
    window.gtag('event', 'download', {
      file_name: file,
      link_text: file,
      outbound: false,
    })
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
      loadGoogleAnalytics()
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
            We use Google Analytics to count page visits and downloads if you accept.
            No ads personalisation. You can change this anytime.
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

    if (!gaConfigured()) {
      console.info(
        '[Datalund] Analytics idle until GA_MEASUREMENT_ID (G-XXXXXXXXXX) is set in /js/consent-analytics.js',
      )
      return
    }

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

  window.datalundAnalytics = {
    getConsent: () => consent,
    accept: () => applyConsent('granted'),
    decline: () => applyConsent('denied'),
    trackDownload,
    isConfigured: gaConfigured,
  }
})()
