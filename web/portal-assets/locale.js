'use strict';

// Apply the site's default once per browser. Sub2API can still save a later
// language selection for visitors who use the console's language switcher.
try {
  if (localStorage.getItem('modelport_locale_initialized') !== 'zh') {
    localStorage.setItem('sub2api_locale', 'zh');
    localStorage.setItem('modelport_locale_initialized', 'zh');
  }
} catch {
  // The backend can still use its own locale detection when storage is blocked.
}

// The upstream authentication layout has an English copyright suffix
// outside its translation catalog. Respect later explicit language changes.
document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('#app');
  if (!app) return;

  function translateAuthCopyright() {
    const copyright = app.querySelector(':lang(zh).mt-8.text-center.text-xs');
    if (copyright && copyright.textContent.includes('All rights reserved.')) {
      copyright.textContent = copyright.textContent.replace('. All rights reserved.', '。保留所有权利。');
    }
  }

  translateAuthCopyright();
  new MutationObserver(translateAuthCopyright).observe(app, { childList: true, subtree: true });
});
