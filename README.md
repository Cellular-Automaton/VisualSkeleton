# VisualSkeleton — Plug‑and‑Code Template for CAMI Visuals

[![codecov](https://codecov.io/gh/Cellular-Automaton/VisualSkeleton/graph/badge.svg?token=SFODF2QFVM)](https://codecov.io/gh/Cellular-Automaton/VisualSkeleton) ![Lint](https://github.com/Cellular-Automaton/VisualSkeleton/actions/workflows/lint.yaml/badge.svg)

This repository is a zero‑configuration template to build visuals for the CAMI (Cellular Automata) host application. Everything is already wired: Vite, React, Tailwind, linting, and the messaging bridge with the host app. You can start coding your visualization logic immediately — no setup overhead.

— TL;DR: clone, `npm i`, `npm run dev`, then implement your renderer in `src`.

![Example](./public/example.gif)

## What You Get

- React 18 + Vite 7: fast dev server and optimized builds.
- Tailwind v4 via `@tailwindcss/vite`: utility‑first styling, no config.
- MUI ready: accessible UI controls out of the box.
- PIXI.js stack: ready to render large grids efficiently if you choose to.
- ESLint 9 (React hooks + refresh): sane defaults and CI‑friendly rules.
- Single JS bundle output: the build produces one self‑contained file for easy embedding in CAMI.

## Requirements

- Node.js 18+ recommended
- CAMI host application (for integration and messaging)

## Quick Start

```powershell
git clone https://github.com/Cellular-Automaton/VisualSkeleton.git
cd VisualSkeleton
npm install
npm run dev
```

Open the dev URL printed by Vite. Start editing files in `src/` — hot reload is enabled.

## Build and Output

```powershell
npm run build
```

The build is configured in library mode to emit a single ES module with CSS injected into JS:

- Output directory: `dist/`
- File name: `GameOfLifeVisual.js`
- Format: `es` (ES module)

You can preview the production build locally:

```powershell
npm run preview
```

## Project Structure

```
src/
    App.jsx            # Example UI and message handlers
    main.jsx           # Entry point (library build)
    index.css          # Tailwind entry
    hooks/
        useGrid.js       # Minimal grid state helper (example)
    components/        # Add your renderer components here
```

Key config files:

- `vite.config.js`: library build, single‑file output, CSS injected.
- `eslint.config.js`: recommended rules, React hooks, refresh.
- `package.json`: `dev`, `build`, `preview`, `lint` scripts.

## Messaging Contract with the Host

The visual communicates with the CAMI host through a thin API exposed in Electron. Messages are plain objects of the shape:

```js
{
    action: "ACTION_NAME",
    data?: any
}
```

Send messages to the host:

```js
window.electronAPI.sendToHost({ action: "PLAY_SIMULATION", data: { /* ... */ } });
```

Listen for messages from the host:

```js
window.addEventListener("message", (event) => {
    const { action, data } = event.data;
    // handle(action, data)
});
```

Supported actions and payloads implemented in this template:

- `UPDATE_TABLE` (from host):
    - `{ data: { table: number[] } }`
    - Updates the current grid state. Length must match the number of cells.

- `PARAMETERS` (from host):
    - `{ data: { parameters: Record<string, unknown> } }`
    - Provides algorithm parameters. Extend handling as needed.

- `IMPORTED_DATA` (from host):
    - `{ data: { table: number[], parameters: Record<string, unknown> } }`
    - Loads a saved grid and parameters.

- `PLAY_SIMULATION` (from visual):
    - `{ data: { parameters: Record<string, unknown>, table: number[] } }`
    - Signals the host to start computation from the provided initial state.

- `PAUSE_SIMULATION` (from visual):
    - No `data` field. Pauses the host computation.

- `EXPORT` (from visual):
    - `{ data: { table: number[], parameters: Record<string, { value: unknown, type: string }> } }`
    - Asks the host to persist the current visual state.

- `IMPORT` (from visual):
    - No `data` field. Asks the host to provide saved data via `IMPORTED_DATA`.

See `src/App.jsx` for working examples of all handlers above.

## How To Adapt This Template

Note: You do not have to use the example grid state (`useGrid`) or a grid at all. You can implement your own state model and renderer (Canvas/WebGL, PIXI, Three.js, DOM, typed arrays, etc.). The only constraints are:

- Respect the messaging contract with the host (actions and payloads).
- If the host sends `UPDATE_TABLE`, translate that payload into your internal model (or adapt your protocol if your host integration expects a different shape).
- Keep the build single‑file as configured (library mode + no CSS splitting).
- Keep the public entry at `src/main.jsx` or update `vite.config.js` accordingly.

1) Implement your renderer in `src/components/` and use it from `App.jsx`.
- Your renderer receives the grid (`cells`, `rows`, `cols`) and UI callbacks.

2) Define your simulation parameters in `App.jsx`.
- Store them in the `parameters` state. They are sent to the host with `PLAY_SIMULATION` and included in `EXPORT`.

3) Handle host messages according to your automaton.
- Ensure incoming `table` lengths match `rows * cols`.
- Maintain a frames buffer if you want time‑scrubbing.

4) Keep the build single‑file.
- Library mode + `inlineDynamicImports` + `cssCodeSplit: false` ensures one JS file. If you add code‑splitting, revisit `vite.config.js`.

## Linting

```powershell
npm run lint
```

Rules are set to be strict on unused variables and React hooks best practices.

## Troubleshooting

- `window.electronAPI` is undefined:
    - You’re running in a plain browser. The host (Electron) injects this API. For standalone dev, guard calls or mock the API.

- Output isn’t a single file:
    - Check `vite.config.js` for `build.lib`, `inlineDynamicImports: true`, and `cssCodeSplit: false`.

- Table length mismatch errors:
    - Ensure `table.length === rows * cols`. Recreate the grid when parameters change.

## License

This repository is provided as a template for building visuals for the CAMI host application. See the repository’s LICENSE if/when added by your project.