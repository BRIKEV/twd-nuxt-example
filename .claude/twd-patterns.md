# TWD Project Patterns

## Project Configuration

- **Framework**: Nuxt 4 (Vue 3)
- **Vite base path**: /
- **Dev server port**: 3000
- **App URL**: http://localhost:3000
- **Dev command**: npm run dev
- **Default branch**: main
- **Entry point**: none — `twd()` (and `twdRemote()`) are registered under `vite.plugins` in `nuxt.config.ts`
- **Public folder**: public/
- **Closing run**: full suite

### Runner Commands

twd-cli drives its own headless browser — only the dev server has to be up (`npm run dev`).

```bash
# Run all tests
npm run test:ci

# Run specific tests by name (matches "suite > test", case-insensitive; repeatable)
npx twd-cli run --test "should render the list"
npx twd-cli run --test "should create" --test "should show the error"

# Only the tests this branch added or changed
npx twd-cli run --changed-since origin/main

# Record a run to video (one clip per matched test, needs ffmpeg)
npx twd-cli run --record --test "should render the list"
```

Every run writes `.twd/report/`: `run.json` (the result), `summary.md` and `index.html`. The folder is replaced on each run.

Nuxt dev compiles routes on first request, so warm a route (e.g. open `/todos`) before the first run, as CI does.

## Standard Imports

```typescript
import { twd, userEvent, screenDom, expect } from "twd-js";
import { describe, it, beforeEach, afterEach } from "twd-js/runner";
```

Tests live in `app/twd-tests/` and match `/**/*.twd.test.ts`.

## Visit Paths

Base path is `/`:

```typescript
await twd.visit("/");
await twd.visit("/todos");
```

## Standard beforeEach / afterEach

```typescript
beforeEach(() => {
  twd.clearRequestMockRules();
  twd.clearComponentMocks();
});

afterEach(() => {
  twd.clearRequestMockRules();
});
```

The existing todos suite runs against the real SQLite backend (no request mocks) and
resets it before each test instead:

```typescript
beforeEach(async () => {
  await fetch("/api/__test/reset", { method: "POST" });
});
```

## API Service Types

Server routes live in `server/api/` (Nitro); queries and schema in `server/utils/`.

## CSS / Component Library

- **Library**: Tailwind CSS v4 (via `@tailwindcss/vite`)

## Portals and Dialogs

Use `screenDomGlobal` instead of `screenDom` for elements rendered in portals (modals, dropdowns, tooltips):

```typescript
import { screenDomGlobal } from "twd-js";
const modal = screenDomGlobal.getByRole("dialog");
```
