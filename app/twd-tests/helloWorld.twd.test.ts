import { twd } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Hello World Test", () => {
  it("should render todo list", async () => {
    await twd.visit("/todos");
  });
});
