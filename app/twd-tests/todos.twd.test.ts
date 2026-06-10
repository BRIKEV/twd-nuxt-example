import { twd, userEvent, screenDom, expect } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";

// These tests run against the REAL SQLite backend — no route mocking.
// Before each test we reset the database to its seeded state via the
// dev-only endpoint, so every test starts from a known, deterministic baseline.
//
// Seeded rows after a reset (newest first, list is ordered by id DESC):
//   id 3 "Test it with TWD"        (done: false)
//   id 2 "Build a real todo list"  (done: false)
//   id 1 "Learn Nuxt server routes" (done: true)
//
// Note on assertions: findAllByRole resolves as soon as >=1 item matches, so
// asserting an exact count right after it can race with rendering. We wrap
// exact-count checks in twd.waitFor(...) so the assertion retries until the
// list has settled.
describe("Todos Page (real SQLite backend)", () => {
  beforeEach(async () => {
    await fetch("/api/__test/reset", { method: "POST" });
  });

  const expectItemCount = (count: number) =>
    twd.waitFor(() => {
      const items = screenDom.getAllByRole("listitem");
      expect(items).to.have.length(count);
      return items;
    });

  describe("listing", () => {
    it("shows the seeded todos", async () => {
      await twd.visit("/todos");

      await expectItemCount(3);
      twd.should(await screenDom.findByText("Learn Nuxt server routes"), "be.visible");
      twd.should(await screenDom.findByText("Build a real todo list"), "be.visible");
      twd.should(await screenDom.findByText("Test it with TWD"), "be.visible");
    });
  });

  describe("create flow", () => {
    it("adds a todo and shows it in the list", async () => {
      await twd.visit("/todos");
      await expectItemCount(3); // wait for the initial load

      await userEvent.type(screenDom.getByTestId("todo-input"), "Buy milk");
      await userEvent.click(screenDom.getByTestId("todo-add"));

      // The new todo is persisted, the list refreshes, and the input clears.
      twd.should(await screenDom.findByText("Buy milk"), "be.visible");
      twd.should(screenDom.getByTestId("todo-input"), "have.value", "");
      await expectItemCount(4);
    });

    it("does not add anything when the input is blank", async () => {
      await twd.visit("/todos");
      await expectItemCount(3);

      await userEvent.click(screenDom.getByTestId("todo-add"));

      // addTodo() bails on a blank title, so the list stays at 3.
      await expectItemCount(3);
    });
  });

  describe("delete flow", () => {
    it("deletes a todo and the list updates", async () => {
      await twd.visit("/todos");
      await screenDom.findByText("Build a real todo list");

      // Seed id 2 is "Build a real todo list".
      await userEvent.click(screenDom.getByTestId("todo-delete-2"));

      await expectItemCount(2);
      expect(screenDom.queryByText("Build a real todo list")).to.equal(null);
    });
  });
});
