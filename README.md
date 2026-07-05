# たくしー よぼう！ / Haru's Taxi 🚕

A playful pretend taxi-hailing app for a young child (built for **Haru, age 4**), inspired by
GO Taxi / S.RIDE with a Toy-Story-ish look. Hiragana + English throughout. No build step,
no framework, no dependencies — just open `index.html`.

## Run it

```bash
# easiest: just open index.html in a browser
open index.html            # macOS
# or serve it (nicer for editing):
npx serve .                # then visit the printed URL
```

Sounds are synthesized with the Web Audio API and only start after the first tap
(browser autoplay rule) — this is normal, especially on iOS/iPad.

## 🌐 Put it online for iPad / iPhone (free)

The app is a plain static site + PWA, so any free static host works. A **ready-to-drop zip
lives at `Downloads/haru-taxi.zip`** (index.html at its root).

**Option A — Netlify Drop (fastest, ~60 seconds, no account needed):**
1. On a computer, open **https://app.netlify.com/drop**
2. Drag **`haru-taxi.zip`** (from your Downloads) onto the page — it uploads and gives you a
   public `https://<random-name>.netlify.app` URL instantly.
3. (Optional) Sign in with Google to keep the URL permanent and rename it
   (e.g. `haru-taxi.netlify.app`). Without an account the site still works but may expire.
4. Open that URL on the iPad — done.

**Option B — GitHub Pages (permanent, needs a GitHub account):**
1. Create a new **public** repo (e.g. `haru-taxi`) on github.com.
2. Upload the *contents* of this folder (or unzip `haru-taxi.zip`) to the repo — `index.html`
   must be at the repo root.
3. Repo → **Settings → Pages** → Source: `Deploy from a branch` → `main` / `/root` → Save.
4. Your app appears at `https://<username>.github.io/haru-taxi/` in a minute or two.

> Want me to deploy it via CLI for you? Paste a Netlify personal-access token (Netlify →
> User settings → Applications → New access token) and I'll run `netlify deploy` from here.

## 📲 Install on the iPad (looks/opens like a real app)

Once it's at a URL, in **Safari** on the iPad: tap **Share → Add to Home Screen**. It's a PWA
(`manifest.webmanifest` + `sw.js` + `icons/`), so it gets the 🚕 icon, launches **fullscreen**
(no browser bars), and **works offline** after the first load.

## Project layout

```
index.html          # shell: fonts + <div id="view"> + script tags (load order matters)
css/
  styles.css        # all styling (design tokens are CSS vars at the top of :root)
js/
  data.js           # ⭐ EDIT HERE: CONFIG, DESTS (+scene), CARS (+mult/wait/tier), PAYMENTS,
                    #    DRIVERS, PROFILE + localStorage load/save, ranks
  sound.js          # sfx.* — Web Audio sound engine
  art.js            # every picture is inline SVG: carSVG()/carInner(), navMapSVG(),
                    #    sceneSVG() (per-destination), avatarSVG(), hero
  screens.js        # one function per screen, each returns an HTML string
  app.js            # state, render() router, ride meter loop, nav handlers
build.mjs           # optional: inlines everything into dist/index.html (single file)
```

Scripts are plain classic scripts (not ES modules) so they share one global scope and
`file://` opening works without a server. Click handlers are global `function`s so inline
`onclick=""` can find them.

## Flow

`top → home(place) → cars(ride select + slide-to-confirm) → searching → found(driver) →
coming(pickup tracking) → riding(scene + meter + order food) → pay → done(points)`
plus `mypage` (profile, stats, place-stamps, favorite car, rank) and `garage` (くるまずかん — collect every car).

## What's Uber-like here

- **Home map** (`navMapSVG` in `art.js`) — a real navigation-style map: street grid with
  white roads + casings, buildings, water and a park, tappable destination pins, and a pulsing
  "you are here" dot.
- **Ride select** (`cars` screen) — a scrollable list of ride options, each with a fare
  estimate (`estFare`) and pickup ETA, like Uber's product picker. A route line is drawn on a
  slim map header. Confirm with a **slide-to-confirm slider** (`initSlider` in `app.js`,
  Pointer Events so it works by touch).
- **Searching → Found** — after sliding, a radar **`searching`** screen looks for a driver
  (auto-advances ~2.3 s), then a **`found`** screen reveals the matched driver with a ✓.
- **Pickup tracking** (`coming` screen) — the chosen car drives along the road to your pickup
  dot (SVG `animateMotion`), an ETA chip counts the minutes, and a **driver card** shows a
  named driver (`DRIVERS`), ⭐ rating, car and number plate, with 💬 / 📞 buttons.
- **Order snacks & drinks** during the ride — the riding screen has a
  「たべもの・のみものを ちゅうもんする」button that opens a bottom-sheet (`SNACKS`/`DRINKS` in
  `data.js`). Picks show as a tray, add to the fare, and appear on the done screen.

## Persistence, scenes, garage, unlock (built 2026-07-05)

- **Profile persists** via `localStorage` (`CONFIG.storeKey`) — rides, points, place-stamps,
  per-car ride counts and discovered cars survive a refresh. `loadProfile()` on boot,
  `saveProfile()` after each ride / car discovery. `resetProfile()` wipes it.
- **Per-destination scenes** — each `DESTS[].scene` (`city`/`forest`/`school`/`sea`/`houses`/
  `park`/`kinder`/`singapore`) draws a themed backdrop on the riding screen via `sceneSVG()`.
- **Garage / くるまずかん** — every car with a "seen" ✓, ride count, or a 🔒 lock. A car is
  marked seen the moment it's picked.
- **Spaceship unlocks after 5 rides** (`CARS` `locked`/`unlockRides`, `carUnlocked()`); a
  banner + warp sound celebrate the unlock on the done screen.
- **10 destinations** (added こうへいくんち / インター / こまばようちえん / シンガポール) and
  **18 cars** (added ダッジチャレンジャー / ランボルギーニ / ボルボ / トヨタ / プリウスα).
- **Installable PWA** — `manifest.webmanifest`, `sw.js` (offline cache), and `icons/` make it
  Add-to-Home-Screen on iOS, launching fullscreen. See the deploy section at the top.

## Common edits

- **Rename the child / change age:** `js/data.js` → `CONFIG`.
- **Add a destination:** push to `DESTS` in `data.js` (give it a `pos` for the map pin and a
  `scene` so the riding screen has a backdrop).
- **Add a car:** push to `CARS` with an `art` recipe. Reuse a `kind`
  (`taxi`, `sedan-taxi`, `sport`, `sedan`, `benz`, `tesla`, `van`, `police`, `ambulance`,
  `spaceship`) and pass `body` / `emblem` colors, or add a new `case` in `carInner()` in
  `art.js`. Set `mult` (fare vs base), `wait` (pickup min) and `tier` (list label).
- **Change ride length / base fare:** `CONFIG.rideMs`, `CONFIG.baseFare`.
- **Lock a car behind rides:** add `locked:true, unlockRides:N` (see the spaceship).
- **Reset saved progress:** call `resetProfile()` in the console, or clear the
  `CONFIG.storeKey` localStorage key.
- **Colors / theme:** CSS variables at the top of `css/styles.css`.

## Ideas to build next

- Give each destination its own **mini scene** — done, but they can get richer (animated
  clouds, moving trains, day/night by destination).
- Let Haru **name the driver**, or pick a favorite driver who always comes.
- A **sound toggle per car** or a horn Haru can tap while riding.
- A **weekly sticker** on the stamp card for riding every day.

## Rebuild the single-file version

```bash
node build.mjs      # writes dist/index.html (everything inlined)
```
