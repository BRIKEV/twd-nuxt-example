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
  create/update/delete call run in the browser, so they show up in the
  Network tab and can be observed/mocked by TWD's service worker.
- Because the DB persists, tests aren't isolated by default. Reset with
  `rm -rf .data` between runs if you need a clean slate.
