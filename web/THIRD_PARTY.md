# Third-party runtime in this page

- **EmulatorJS 4.2.3** (`data/`), GPL-3.0 — https://github.com/EmulatorJS/EmulatorJS
  (license text: `data/LICENSE.EmulatorJS`). Vendored unmodified.
- libretro Gambatte core (`data/cores/gambatte-*.data`), GPL-2.0 — https://github.com/libretro/gambatte-libretro, built by the EmulatorJS project.

`index.html` and `no-phone-home.js` are this project's own code.

**No ROM, and nothing extracted from a ROM, is distributed here.** The page runs the
Game Boy Color ROM the person loads from their own disk. It is read in the tab, handed to
the core as an in-memory `File`, and never sent anywhere: the content-security-policy in
`index.html` pins `connect-src` to `'self' blob: data:`, and `no-phone-home.js` refuses any
cross-origin request at runtime.
