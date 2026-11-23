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
