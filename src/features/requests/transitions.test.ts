import { describe, expect, it } from "vitest";
import { canTransition, isFinalStatus, nextStatuses } from "./transitions";

describe("status transitions (from the API contract)", () => {
  it.each([
    ["OPEN", ["IN_PROGRESS", "CLOSED"]],
    ["IN_PROGRESS", ["RESOLVED", "OPEN"]],
    ["RESOLVED", ["CLOSED", "IN_PROGRESS"]],
    ["CLOSED", []],
  ] as const)("%s can move to %j", (from, expected) => {
    expect(nextStatuses(from)).toEqual(expected);
  });

  it("treats CLOSED as final", () => {
    expect(isFinalStatus("CLOSED")).toBe(true);
    expect(isFinalStatus("RESOLVED")).toBe(false);
    expect(canTransition("CLOSED", "OPEN")).toBe(false);
  });

  it("rejects jumps the contract does not allow", () => {
    expect(canTransition("OPEN", "RESOLVED")).toBe(false);
    expect(canTransition("OPEN", "OPEN")).toBe(false);
  });
});
