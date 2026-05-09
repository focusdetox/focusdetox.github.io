(function () {
  var STORAGE_KEY = 'focusdetox_a11y_settings';
  var OPTIONS = [
    { id: 'larger-text',     label: 'Larger Text',       icon: 'A+' },
    { id: 'larger-spacing',  label: 'Increased Spacing', icon: '↔' },
    { id: 'high-contrast',   label: 'High Contrast',     icon: '◐' },
    { id: 'underline-links', label: 'Underline Links',   icon: 'U' },
    { id: 'highlight-links', label: 'Highlight Links',   icon: '★' },
    { id: 'reduce-motion',   label: 'Reduce Motion',     icon: '⏸' },
    { id: 'pause-animations',label: 'Pause Animations',  icon: '■' },
    { id: 'grayscale',       label: 'Grayscale',         icon: '◑' },
    { id: 'bigger-cursor',   label: 'Bigger Cursor',     icon: '➤' }
  ];

  function loadSettings() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      if (typeof parsed !== 'object' || parsed === null) return {};
      return parsed;
    } catch (e) { return {}; }
  }

  function saveSettings(settings) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (e) {}
  }

  function applySettings(settings) {
    OPTIONS.forEach(function (opt) {
      document.documentElement.classList.toggle('a11y-' + opt.id, !!settings[opt.id]);
    });
  }

  // Apply persisted settings as early as possible to avoid FOUC.
  var settings = loadSettings();
  // First-time default: respect user's OS preference for reduced motion.
  if (Object.keys(settings).length === 0 &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    settings['reduce-motion'] = true;
  }
  applySettings(settings);

  function getFocusable(root) {
    return Array.prototype.slice.call(root.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
  }

  function build() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'a11y-btn';
    btn.id = 'a11y-toggle';
    btn.setAttribute('aria-label', 'Open accessibility menu');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'a11y-panel');
    btn.setAttribute('lang', 'en');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' +
      '<path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm9 6h-6v14h-2v-6h-2v6H9V8H3V6h18v2z"/>' +
      '</svg>';

    var panel = document.createElement('div');
    panel.className = 'a11y-panel';
    panel.id = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Accessibility options');
    panel.setAttribute('lang', 'en');
    panel.hidden = true;

    var html = '<button type="button" class="a11y-panel-close" aria-label="Close accessibility menu">' +
                 '<span aria-hidden="true">&times;</span>' +
               '</button>';
    html += '<h3 id="a11y-panel-title">Accessibility</h3>';
    html += '<div class="a11y-options" role="group" aria-labelledby="a11y-panel-title">';
    OPTIONS.forEach(function (opt) {
      var pressed = !!settings[opt.id];
      html += '<button type="button" class="a11y-option' + (pressed ? ' active' : '') + '"' +
              ' data-id="' + opt.id + '"' +
              ' role="switch"' +
              ' aria-checked="' + pressed + '">' +
              '<span class="a11y-option-icon" aria-hidden="true">' + opt.icon + '</span>' +
              '<span class="a11y-option-label">' + opt.label + '</span>' +
              '<span class="a11y-option-state" aria-hidden="true">' + (pressed ? 'On' : 'Off') + '</span>' +
              '</button>';
    });
    html += '</div>';
    html += '<button type="button" class="a11y-reset">Reset all settings</button>';
    panel.innerHTML = html;

    // Append to <html> instead of <body> so CSS filters applied to body
    // (e.g. grayscale) don't break fixed positioning of the widget.
    document.documentElement.appendChild(btn);
    document.documentElement.appendChild(panel);

    var lastFocus = null;
    var firstOption = panel.querySelector('.a11y-option');

    function setOpen(open) {
      if (open === panel.classList.contains('open')) return;
      panel.classList.toggle('open', open);
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        lastFocus = document.activeElement;
        if (firstOption) firstOption.focus();
      } else if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus();
      }
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!panel.classList.contains('open'));
    });

    panel.querySelector('.a11y-panel-close').addEventListener('click', function () {
      setOpen(false);
    });

    panel.addEventListener('click', function (e) { e.stopPropagation(); });

    document.addEventListener('click', function () {
      if (panel.classList.contains('open')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (!panel.classList.contains('open')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === 'Tab') {
        var focusables = getFocusable(panel);
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    panel.querySelectorAll('.a11y-option').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-id');
        settings[id] = !settings[id];
        saveSettings(settings);
        applySettings(settings);
        var on = !!settings[id];
        el.classList.toggle('active', on);
        el.setAttribute('aria-checked', on ? 'true' : 'false');
        el.querySelector('.a11y-option-state').textContent = on ? 'On' : 'Off';
      });
    });

    panel.querySelector('.a11y-reset').addEventListener('click', function () {
      settings = {};
      saveSettings(settings);
      applySettings(settings);
      panel.querySelectorAll('.a11y-option').forEach(function (el) {
        el.classList.remove('active');
        el.setAttribute('aria-checked', 'false');
        el.querySelector('.a11y-option-state').textContent = 'Off';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
