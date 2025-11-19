# Copilot instructions for Pipe Middleware Manager

This file gives focused, actionable guidance to AI coding agents working on this repository.

- **Big picture:** This is a tiny zero-dependency library that implements a curried middleware "pipe" operator. The runtime is implemented in `lib/index.ts` and small utilities are in `lib/utils.ts` and `lib/common-middleware.ts`. Types live in `lib/types.ts`. The build bundles compiled JS into `build/` using `rollup.config.js`.

- **Core patterns:**

  - **Middleware shape:** Always follow the curried signature `(deps) => (input, ...rest) => MaybePromise<Out>`. See `lib/types.ts` and `lib/index.ts`.
  - **Stop mechanism:** Use `StopCall` (in `lib/types.ts`) to stop a pipeline; code treats `StopCall` specially (caught in `pipe`). Prefer the code's `StopCall` over README mentions of `StopError`.
  - **Concurrency contract:** `concurrency(...)` uses `Promise.allSettled` and returns `false` for rejected items (unless the rejection is a `StopCall`, which is re-thrown). See `lib/index.ts` and `lib/utils.ts`.
  - **Naming mismatch:** The code exports `pipAsMiddleware` (note missing "e") in `lib/index.ts` while the README refers to `pipeAsMiddleware`. Trust the code when making edits; update README if you change exports.

- **Where to edit:** Edit TypeScript sources under `lib/*.ts`. The build uses Rollup (see `rollup.config.js`) and the rollup TypeScript plugin is configured to compile from `lib/index.js` / `.ts` into `build/` outputs.

- **Build / run / test workflows:**

  - Build a distributable bundle with Rollup: `npx rollup -c` (or `npm run build` if project scripts exist).
  - Run unit tests: `npx vitest` (tests are in `test/`, e.g. `test/common-middleware.spec.ts`).
  - Quick smoke runner: `node test.spec.js` expects a prebuilt `build/bundle.js` — run the Rollup build before executing this script.

- **Editing guidance:**

  - Keep changes small and confined to `lib/*.ts` unless modifying packaging or docs.
  - When changing middleware signatures, update `lib/types.ts` first and ensure downstream helpers in `lib/index.ts` still compile.
  - Preserve the project’s small runtime assumptions: zero runtime dependencies and light bundle size. Prefer simple, synchronous fallbacks where appropriate.

- **Tests & validation:**

  - The `test/` directory uses `vitest` style imports. Run `npx vitest --run` to execute tests headlessly.
  - The top-level `test.spec.js` is a manual runner that uses `build/bundle.js`. Use it for quick integration checks after `npx rollup -c`.

- **Common-change checklist for PRs:**

  - Update `lib/*.ts` and ensure the compiled output still bundles (run Rollup).
  - Run `npx vitest` and verify `test/common-middleware.spec.ts` passes.
  - If you rename exports, update `README.md` examples and `test.spec.js` if necessary (watch for `pipeAsMiddleware` vs `pipAsMiddleware`).

- **Files to reference when reasoning about behaviour:**
  - `lib/index.ts` — core pipe implementation and helpers (`when`, `tryCatch`, `loop`, `concurrency`, etc.)
  - `lib/common-middleware.ts` — utility middleware (`throwError`, `stop`, `pushData`, `tap`, `map`)
  - `lib/types.ts` — `StopCall`, `MaybePromise`, `Middleware` type
  - `lib/utils.ts` — small Promise-settled helpers used by `concurrency`
  - `rollup.config.js` — bundling pipeline
  - `test/common-middleware.spec.ts` and `test.spec.js` — tests and smoke runner

If anything in this file looks incomplete or you want an expansion (examples, CI notes, or scripts to add to `package.json`), tell me which section to expand and I will update it.
