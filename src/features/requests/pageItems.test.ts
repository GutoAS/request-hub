import { describe, expect, it } from "vitest";
import { pageItems } from "./pageItems";

describe("pageItems", () => {
  it("shows every page when there are only a few", () => {
    expect(pageItems(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it("keeps the first, last and neighbouring pages, with gaps in between", () => {
    expect(pageItems(6, 12)).toEqual([1, "gap", 5, 6, 7, "gap", 12]);
  });

  it("has no gap next to the edges", () => {
    expect(pageItems(1, 12)).toEqual([1, 2, "gap", 12]);
    expect(pageItems(12, 12)).toEqual([1, "gap", 11, 12]);
  });
});
