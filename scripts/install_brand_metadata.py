from pathlib import Path

index = Path("index.html")
text = index.read_text()
old = '''  <meta name="description" content="The family Parcheesi championship: standings, streaks, stats, and the great 2026 race.">
  <title>Family Parcheesi · 2026 Championship</title>
  <link rel="icon" href="./assets/favicon.svg" type="image/svg+xml">
'''
new = '''  <meta name="description" content="The family Parcheesi championship: standings, streaks, stats, and the great 2026 race.">
  <meta name="application-name" content="Family Parcheesi">
  <meta name="apple-mobile-web-app-title" content="Parcheesi">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="msapplication-TileColor" content="#f2e8cc">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Family Parcheesi">
  <meta property="og:locale" content="en_US">
  <meta property="og:url" content="https://llm-i-am.github.io/fam-parcheesi/">
  <meta property="og:title" content="Family Parcheesi · 2026 Championship">
  <meta property="og:description" content="Five players. One tiny crown. An entire year of bragging rights.">
  <meta property="og:image" content="https://llm-i-am.github.io/fam-parcheesi/assets/og-share.png">
  <meta property="og:image:secure_url" content="https://llm-i-am.github.io/fam-parcheesi/assets/og-share.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Family Parcheesi 2026 Championship with five colorful game pawns in a vintage family-computer window.">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Family Parcheesi · 2026 Championship">
  <meta name="twitter:description" content="Five players. One tiny crown. An entire year of bragging rights.">
  <meta name="twitter:image" content="https://llm-i-am.github.io/fam-parcheesi/assets/og-share.png">
  <meta name="twitter:image:alt" content="Family Parcheesi 2026 Championship with five colorful game pawns.">

  <title>Family Parcheesi · 2026 Championship</title>
  <link rel="canonical" href="https://llm-i-am.github.io/fam-parcheesi/">
  <link rel="icon" href="./assets/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="./assets/favicon-48x48.png" sizes="48x48" type="image/png">
  <link rel="icon" href="./assets/favicon-32x32.png" sizes="32x32" type="image/png">
  <link rel="icon" href="./assets/favicon-16x16.png" sizes="16x16" type="image/png">
  <link rel="shortcut icon" href="./favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="./assets/apple-touch-icon.png">
  <link rel="mask-icon" href="./assets/safari-pinned-tab.svg" color="#e54f33">
  <link rel="manifest" href="./site.webmanifest">
'''
if old not in text:
    raise SystemExit("Expected index.html metadata block not found")
index.write_text(text.replace(old, new, 1))

readme = Path("README.md")
r = readme.read_text()
r = r.replace(
    "**Website implementation is complete and pushed to `main`. GitHub Pages still needs to be enabled.**",
    "**Website is live on GitHub Pages and the full browser/social identity asset set is installed.**",
)
r = r.replace(
    "- `assets/favicon.svg` — pawn-style site icon.\n",
    "- `assets/favicon.svg` + PNG/ICO variants — Safari/browser tab and bookmark identity.\n"
    "- `assets/apple-touch-icon.png` — iPhone/iPad Home Screen and bookmark icon.\n"
    "- `assets/icon-192.png` / `assets/icon-512.png` + `site.webmanifest` — installable web-app identity.\n"
    "- `assets/og-share.png` — 1200×630 Open Graph / iMessage / social share artwork.\n"
    "- `assets/safari-pinned-tab.svg` — monochrome Safari pinned-tab mark.\n",
)
readme.write_text(r)

status = Path("STATUS.md")
s = status.read_text()
s = s.replace(
    "**Remaining deployment step:** Ben must enable GitHub Pages for `main` / `/(root)` in repository Settings → Pages.\n\nExpected public URL after Pages is enabled:\n\n`https://llm-i-am.github.io/fam-parcheesi/`",
    "**Live:** https://llm-i-am.github.io/fam-parcheesi/\n\nBrowser/share identity is installed: multi-size favicons, Apple Touch icon, pinned-tab icon, web manifest, and 1200×630 Open Graph artwork for iMessage/social previews.",
)
s = s.replace(
    "- `assets/favicon.svg`\n",
    "- `assets/favicon.svg` + raster favicon set\n"
    "- `assets/apple-touch-icon.png`\n"
    "- `assets/icon-192.png` / `assets/icon-512.png`\n"
    "- `assets/og-share.png`\n"
    "- `assets/safari-pinned-tab.svg`\n"
    "- `favicon.ico`\n"
    "- `site.webmanifest`\n",
)
status.write_text(s)
