/* ══════════════════════════════════════════════════════════════════
   brand-recap.js — theme-toggle + tab-loader (inlined base scripts)
   Generated 2026-04-20. {NAME} = brand-recap.
   ══════════════════════════════════════════════════════════════════ */

/* ── theme-toggle.js ── */
;(() => {
  var THEME_KEY = 'diag-brand-recap-roxabi-theme'
  var saved = localStorage.getItem(THEME_KEY) || 'dark'
  document.documentElement.setAttribute('data-theme', saved)
  var themeBtn = document.getElementById('theme-toggle')
  if (themeBtn) {
    themeBtn.textContent = saved === 'dark' ? '◑ light' : '◑ dark'
    themeBtn.setAttribute('aria-pressed', saved === 'light' ? 'true' : 'false')
    themeBtn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme')
      var next = cur === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem(THEME_KEY, next)
      this.textContent = next === 'dark' ? '◑ light' : '◑ dark'
      this.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false')
    })
  }
})()

/* ── tab-loader.js ── */
;(() => {
  function loadPanel(id) {
    var panel = document.querySelector(`[data-panel="${id}"]`)
    if (!panel || panel._loaded) return
    fetch(`tabs/brand-recap/tab-${id}.html`)
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((html) => {
        panel.innerHTML = html
        panel._loaded = true
        if (typeof window.__postLoad === 'function') window.__postLoad(id, panel)
      })
      .catch((e) => {
        var err = document.createElement('p')
        err.style.cssText = 'padding:2rem;color:var(--text-muted)'
        err.textContent = `Failed to load (${e})`
        panel.innerHTML = ''
        panel.appendChild(err)
      })
  }

  function activate(id) {
    document.querySelectorAll('[data-tab]').forEach((t) => {
      var isSelected = t.dataset.tab === id
      t.classList.toggle('active', isSelected)
      t.setAttribute('aria-selected', isSelected ? 'true' : 'false')
      t.setAttribute('tabindex', isSelected ? '0' : '-1')
    })
    document.querySelectorAll('[data-panel]').forEach((p) => {
      p.classList.toggle('active', p.dataset.panel === id)
    })
    loadPanel(id)
  }

  document.querySelectorAll('[data-tab]').forEach((t) => {
    t.addEventListener('click', () => {
      activate(t.dataset.tab)
    })
  })

  var first = document.querySelector('[data-tab]')
  if (first) activate(first.dataset.tab)
})()
