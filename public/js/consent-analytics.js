/**
 * Datalund site analytics — EU/EEA (Norway) consent-gated.
 *
 * - No analytics until the visitor opts in
 * - Preference stored in localStorage (strictly necessary for consent)
 * - Honours Global Privacy Control / DNT as a decline
 * - Uses Matomo Cloud (EU, enterprise-grade) after consent
 * - Cookieless tracker mode + page views + download events
 *
 * Setup:
 * 1. Create a free trial / plan at https://matomo.cloud
 * 2. Add website datalund.no and copy the Matomo URL + Site ID
 * 3. Paste them into MATOMO below (URL must end with /)
 */
;(() => {
  const CONSENT_KEY = 'datalund-analytics-consent'

  /**
   * Matomo Cloud settings — replace after account setup.
   * Example url: 'https://datalund.matomo.cloud/'
   */
  const MATOMO = {
    url: '', // e.g. 'https://YOUR_INSTANCE.matomo.cloud/'
    siteId: '', // e.g. '1'
  }

  /** @type {'granted' | 'denied' | null} */
  let consent = readConsent()
  let scriptLoaded = false

  window._paq = window._paq || []

  function matomoConfigured() {
    return Boolean(MATOMO.url && MATOMO.siteId && !MATOMO.url.includes('YOUR_INSTANCE'))
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

  function loadMatomo() {
    if (scriptLoaded) return
    if (!matomoConfigured()) {
      console.info(
        '[Datalund] Matomo is not configured yet. Set MATOMO.url and MATOMO.siteId in /js/consent-analytics.js',
      )
      return
    }

    scriptLoaded = true
    const trackerBase = MATOMO.url.endsWith('/') ? MATOMO.url : `${MATOMO.url}/`

    // Privacy-preserving defaults (still only loaded after opt-in)
    window._paq.push(['disableCookies'])
    window._paq.push(['enableHeartBeatTimer', 30])
    window._paq.push(['trackPageView'])
    window._paq.push(['enableLinkTracking'])
    window._paq.push(['setTrackerUrl', `${trackerBase}matomo.php`])
    window._paq.push(['setSiteId', String(MATOMO.siteId)])

    const script = document.createElement('script')
    script.async = true
    script.src = `${trackerBase}matomo.js`
    document.head.appendChild(script)
  }

  function disableAnalytics() {
    if (scriptLoaded && window._paq) {
      window._paq.push(['forgetConsentGiven'])
      window._paq.push(['deleteCookies'])
    }
    // Ignore further pushes if the script already loaded this session
    window._paq = {
      push() {
        /* no-op after decline */
      },
    }
    scriptLoaded = false
  }

  function trackDownload(file) {
    if (consent !== 'granted' || !matomoConfigured()) return
    window._paq.push(['trackEvent', 'Download', 'click', file])
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
      loadMatomo()
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
            We use privacy-friendly analytics (Matomo, cookieless) to count page visits and
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

    if (!matomoConfigured()) {
      console.info(
        '[Datalund] Analytics idle until Matomo url + siteId are set in /js/consent-analytics.js',
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
    isConfigured: matomoConfigured,
  }
})()
