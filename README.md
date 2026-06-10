# TWD Nuxt Example

A small **Nuxt 4** app used to explore in-browser testing with [TWD](https://brikev.github.io/twd/).
It ships a real **Todo list** backed by **SQLite**, styled with **Tailwind CSS v4**.

## Stack

| Concern | Choice |
|---|---|
| Framework | Nuxt 4 (Vue 3, Nitro server) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Database | SQLite via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) |
| Testing | TWD (`twd-js` + `twd-relay`) |

## Routes

| Route | What it does |
|---|---|
| `/` | Home with link |
| `/todos` | Todo list — create, list, delete |

### Todo API

| Method | Endpoint | Action |
|---|---|---|
| `GET` | `/api/todos` | List todos (newest first) |
| `POST` | `/api/todos` | Create — body `{ "title": string }` |
| `DELETE` | `/api/todos/:id` | Delete by id |

## Setup

Requires **Node 20+** (developed on Node 24).

```bash
npm install
```

> `better-sqlite3` is a native module. `npm install` downloads a prebuilt
> binary for your platform. If you switch Node major versions, run
> `npm rebuild better-sqlite3` to recompile it.

## Database

There's **nothing to start** — SQLite is an embedded file database, not a
separate server. On the first request the server:

1. Creates the file `.data/todos.sqlite` (the `.data/` dir is gitignored),
2. Creates the `todos` table if it doesn't exist,
3. Seeds three example rows the very first time.

The schema and connection live in [`server/utils/db.ts`](server/utils/db.ts);
the queries live in [`server/utils/todos.ts`](server/utils/todos.ts).

**Reset the database** — just delete the file and restart:

```bash
rm -rf .data
```

It will be recreated and re-seeded on the next request.

> Inspect it manually with the SQLite CLI if you have it:
> `sqlite3 .data/todos.sqlite "SELECT * FROM todos;"`

## Development

Start the dev server on `http://localhost:3000` (the TWD sidebar appears in-browser):

```bash
npm run dev
```

In a second terminal, start the TWD relay (lets external tools / AI agents drive test runs):

```bash
npm run relay
```

## Production

```bash
npm run build      # build
npm run preview    # preview the production build locally
```

> In production the SQLite file is created relative to the working directory
> where the server runs (`.data/todos.sqlite`).

## Notes for testing with TWD

- The UI exposes stable `data-testid` hooks: `todo-form`, `todo-input`,
  `todo-add`, `todo-list`, `todo-error`, and per-item
  `todo-item-${id}` and `todo-delete-${id}`.
- On **client-side navigation** to `/todos`, the list `GET` and every
  create/delete call run in the browser, so they show up in the Network tab.

### Testing against the real database (instead of mocking routes)

Because this app has a real backend, TWD tests can exercise the actual API +
SQLite instead of mocking each route. To keep tests isolated, there's a
**dev-only** reset endpoint that restores the seeded state:

```
POST /api/__test/reset
```

It deletes all rows, resets the id sequence (so ids are a deterministic
`1, 2, 3…` every time), re-seeds, and returns `{ ok, todos }`. It's guarded by
`import.meta.dev`, so in a production build it returns `404` and is never
reachable.

Call it from a `beforeEach` so every test starts from the same known state:

```ts
import { twd, screenDom, userEvent } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";

describe("Todo List (real SQLite backend)", () => {
  beforeEach(async () => {
    // Reset the DB to its seeded state — no route mocking needed.
    await fetch("/api/__test/reset", { method: "POST" });
  });

  it("creates a todo end-to-end", async () => {
    await twd.visit("/todos");
    await userEvent.type(await screenDom.getByTestId("todo-input"), "Write a TWD test");
    await userEvent.click(await screenDom.getByTestId("todo-add"));
    twd.should(await screenDom.findByText("Write a TWD test"), "be.visible");
  });
});
```

> Seeded rows after a reset: id `1` "Learn Nuxt server routes" (done),
> id `2` "Build a real todo list", id `3` "Test it with TWD".

If you ever need a clean slate outside of tests, delete the file: `rm -rf .data`.
