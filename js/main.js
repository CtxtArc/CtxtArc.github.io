// ---- active nav highlighting ----
(function () {
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navpaths a').forEach(function (a) {
    var target = a.getAttribute('href');
    if (target === here || (here === '' && target === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ---- shared release-info.json loader ----
// Fetched once, reused by both the star-count and APK-lookup blocks below,
// so a page load costs 1 request to our own domain instead of N requests
// to api.github.com (which is what was tripping the 60/hr rate limit and
// showing "No build yet" even when a release existed).
function loadReleaseInfo() {
  if (!loadReleaseInfo._promise) {
    loadReleaseInfo._promise = fetch('release-info.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; });
  }
  return loadReleaseInfo._promise;
}

// ---- live-ish star counts ----
// Reads from the static JSON (refreshed hourly by GitHub Actions) instead
// of calling the GitHub API directly from the browser.
(function () {
  var nodes = document.querySelectorAll('[data-repo]');
  if (!nodes.length) return;
  loadReleaseInfo().then(function (info) {
    nodes.forEach(function (node) {
      var repo = node.getAttribute('data-repo');
      var entry = info[repo];
      if (!entry || typeof entry.stargazers_count !== 'number') return;
      node.textContent = '★ ' + entry.stargazers_count;
      node.classList.add('live');
    });
  });
})();

// ---- APK release lookup (download page) ----
// Reads the pre-fetched release-info.json (written by the
// update-release-info.yml workflow) instead of calling
// api.github.com/.../releases/latest from every visitor's browser.
// Falls back to a direct API call only if the static file is missing
// or stale-empty, so things still work before the workflow's first run.
(function () {
  var cards = document.querySelectorAll('[data-appcard]');
  if (!cards.length) return;

  function applyRelease(card, release) {
    var btn = card.querySelector('[data-dl-button]');
    var metaVersion = card.querySelector('[data-dl-version]');
    var metaSize = card.querySelector('[data-dl-size]');
    var metaUpdated = card.querySelector('[data-dl-updated]');
    var repo = card.getAttribute('data-appcard');

    if (release && release.apk_url) {
      if (btn) {
        btn.href = release.apk_url;
        btn.textContent = '⭳ Download APK';
      }
      if (metaVersion) {
        metaVersion.textContent = release.tag_name || release.name || '';
        metaVersion.classList.add('ready');
      }
      if (metaSize && release.apk_size) {
        metaSize.textContent = (release.apk_size / (1024 * 1024)).toFixed(1) + ' MB';
      }
      if (metaUpdated && release.published_at) {
        var d = new Date(release.published_at);
        metaUpdated.textContent = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      }
    } else {
      if (btn) {
        btn.href = 'https://github.com/CtxtArc/' + repo;
        btn.textContent = 'No build yet — view source';
      }
      if (metaVersion) metaVersion.textContent = 'unreleased';
    }
  }

  // Direct-API fallback (old behavior) — only used if release-info.json
  // itself is unreachable/empty, e.g. before the workflow's first run.
  function fetchDirect(card) {
    var repo = card.getAttribute('data-appcard');
    var btn = card.querySelector('[data-dl-button]');
    fetch('https://api.github.com/repos/CtxtArc/' + repo + '/releases/latest')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (release) {
        var apk = release && Array.isArray(release.assets)
          ? release.assets.find(function (a) { return /\.apk$/i.test(a.name); })
          : null;
        applyRelease(card, apk ? {
          apk_url: apk.browser_download_url,
          apk_size: apk.size,
          tag_name: release.tag_name,
          name: release.name,
          published_at: release.published_at
        } : null);
      })
      .catch(function () {
        if (btn) btn.textContent = 'Get latest release ↗';
      });
  }

  loadReleaseInfo().then(function (info) {
    var hadAny = false;
    cards.forEach(function (card) {
      var repo = card.getAttribute('data-appcard');
      var entry = info[repo];
      if (entry) {
        hadAny = true;
        applyRelease(card, entry);
      }
    });
    if (!hadAny) {
      // release-info.json missing/empty (e.g. workflow hasn't run yet) —
      // fall back to calling GitHub directly, same as before.
      cards.forEach(fetchDirect);
    }
  });
})();
