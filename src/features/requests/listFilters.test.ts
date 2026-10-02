import { describe, expect, it } from "vitest";
import { parseListFilters, toApiParams, toSearchParams } from "./listFilters";

const parse = (query: string) => parseListFilters(new URLSearchParams(query));

describe("list filters in the URL", () => {
  it("reads valid values", () => {
    expect(
      parse("search=portal&status=OPEN&priority=HIGH&sort=createdAt&page=2"),
    ).toEqual({
      search: "portal",
      status: "OPEN",
      priority: "HIGH",
      sort: "createdAt",
      page: 2,
    });
  });

  it("falls back to defaults for anything typed by hand that the API would reject", () => {
    expect(
      parse("status=bogus&priority=urgent&sort=weird&page=-3&color=blue"),
    ).toEqual({
      search: "",
      status: undefined,
      priority: undefined,
      sort: "-createdAt",
      page: 1,
    });
  });

  it("leaves default values out of the URL", () => {
    expect(toSearchParams(parse("")).toString()).toBe("");
    expect(toSearchParams(parse("status=OPEN&page=3")).toString()).toBe(
      "status=OPEN&page=3",
    );
  });

  it("never sends an empty or blank search to the API", () => {
    expect(toApiParams(parse("search=%20%20")).search).toBeUndefined();
    expect(toApiParams(parse("search=%20portal%20"))).toMatchObject({
      search: "portal",
      pageSize: 10,
    });
  });
});
