import { twd } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Hello World Test", () => {
  it("should render home page test message", async () => {
    await twd.visit("/message");
    await twd.visit("/todos");
  });
});
