# pokecrystal-web

Pokémon Crystal in the browser, bring your own ROM. Live at
https://andrewnakas.github.io/pokecrystal-web/ and listed on https://decompgames.com.

**No game data is in this repository or on the page.** You pick your own ROM; it is read
in the tab and never uploaded.

## What this is

- **Source project:** [pret/pokecrystal](https://github.com/pret/pokecrystal) at `3bc8daa4173e96a7f4011dad3922eb6fa5dad5c6`.
- **Matching build:** `make crystal11` with rgbds 1.0.4 produced a ROM whose SHA-1 is `f2f52230b536214ef7c9924f483392993e226cfb`, identical to the v1.1 cartridge.
- **Browser player:** EmulatorJS 4.2.3 with the libretro Gambatte core (WebAssembly). This is emulation of the rebuilt ROM, not a native
  port of the game's code to WebAssembly.

## Tested

New game to the player's bedroom, movement, an in-game SAVE, and the battery save read back in a fresh browser session (muted). Audio has not been listened to: every test ran muted. Nothing
beyond that scope has been played.

## Layout

- `web/` — the page (published as the `gh-pages` branch).
- `web/THIRD_PARTY.md` — licences of the vendored runtime.
