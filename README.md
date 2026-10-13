# GROVES: Signal Night

Public FEAST project website for KYD / Keenan Jones.

## Deployment

Static files live in `dist/`. No install or build step is required. Publish `dist` with Netlify or another static host. For GitHub Pages, configure a Pages deployment workflow to upload `dist`; Pages hosting is not enabled by this repository upload. The current public deployment is https://groves-signal-night.kydmgmt.chatgpt.site/ and the tablet display is `/tablet.html`.

If changing host, update `PROJECT_URL` in `dist/app.js`, the displayed address in `dist/tablet.html`, and regenerate `dist/qr.svg` for the actual new HTTPS address. The QR is generated locally, not through a third-party tracking service.

## Donation destination

The Cash App button opens `https://cash.app/$kyd888`, based on the artist's previously supplied Cashtag. The site does not process payments, collect card details, confirm transfers, or count donations. Edit the URL in `dist/index.html` and `CASHTAG` in `dist/app.js` together if the artist changes accounts.

## Interactions

- Native expandable descriptions of the audience experience.
- Plain-language project notes and funding details.
- Personal memory cards with browser-local drafts, plain-text download, optional native share, and clear controls.
- A separate high-contrast tablet QR page with optional fullscreen and screen wake lock.
- Public YouTube work-sample link and downloadable project PDF.

Memory cards are not submitted to the artist. No backend, analytics, public memory wall, log-in, mailing-list collection, or voting mechanism is present. The interface explains this before visitors write. 

## Content

Based on the artist's FEAST pitch and seven-slide deck developed October 13, 2026. Proposed event features, funding, future venues, and dates must not be presented as confirmed. The project site is independent of Paseo Arts Association.
