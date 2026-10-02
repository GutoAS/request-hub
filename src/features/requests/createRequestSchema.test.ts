import { describe, expect, it } from "vitest";
import { createRequestSchema } from "./createRequestSchema";

const valid = {
  title: "Unable to access customer portal",
  description: 'The customer receives "Account locked" after signing in.',
  category: "Access",
  priority: "HIGH",
  requesterName: "Example Customer",
  requesterEmail: "customer@example.com",
};

function errorsFor(input: Record<string, unknown>) {
  const result = createRequestSchema.safeParse(input);
  if (result.success) return {};
  return Object.fromEntries(
    result.error.issues
      .reverse()
      .map((issue) => [issue.path[0], issue.message]),
  );
}

describe("create request rules (from the contract)", () => {
  it("accepts a valid request and trims the text", () => {
    const result = createRequestSchema.parse({
      ...valid,
      title: "  Portal down  ",
      category: " Access ",
    });
    expect(result).toMatchObject({ title: "Portal down", category: "Access" });
  });

  it("says which fields are required", () => {
    expect(errorsFor({ ...valid, title: "   ", requesterEmail: "" })).toEqual({
      title: "Title is required.",
      requesterEmail: "Requester email is required.",
    });
  });

  it("checks the length limits", () => {
    expect(
      errorsFor({ ...valid, title: "Hi", description: "x".repeat(2001) }),
    ).toEqual({
      title: "Title must be at least 3 characters long.",
      description: "Description must be 2000 characters or fewer.",
    });
  });

  it("checks the email format and the priority value", () => {
    expect(
      errorsFor({
        ...valid,
        requesterEmail: "customer@example",
        priority: "URGENT",
      }),
    ).toEqual({
      requesterEmail: "Enter a valid email address.",
      priority: "Choose a priority.",
    });
  });
});
