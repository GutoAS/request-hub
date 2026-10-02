import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../../mocks/server";
import { renderApp } from "../../test/renderApp";

async function fillValidForm(user: ReturnType<typeof renderApp>["user"]) {
  await user.type(screen.getByLabelText("Title"), "March statement missing");
  await user.type(
    screen.getByLabelText("Description"),
    "The customer cannot see the March statement.",
  );
  await user.type(screen.getByLabelText("Category"), "Billing");
  await user.type(screen.getByLabelText("Requester name"), "Example Customer");
  await user.type(
    screen.getByLabelText("Requester email"),
    "customer@example.com",
  );
}

describe("create request", () => {
  it("shows validation errors and sends nothing", async () => {
    let posts = 0;
    server.events.on("request:start", ({ request }) => {
      if (request.method === "POST") posts++;
    });
    const { user } = renderApp("/requests/new");
    await user.type(screen.getByLabelText("Title"), "Hi");
    await user.click(screen.getByRole("button", { name: "Create request" }));

    expect(
      await screen.findByText("Please fix 5 fields below."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveAccessibleDescription(
      "Title must be at least 3 characters long.",
    );
    expect(screen.getByLabelText("Title")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Title")).toHaveFocus();
    expect(posts).toBe(0);
    server.events.removeAllListeners();
  });

  it("puts the server's 422 messages under the matching fields", async () => {
    server.use(
      http.post("*/api/requests", () =>
        HttpResponse.json(
          {
            title: "Validation failed",
            status: 422,
            errors: { title: ["A request with this title already exists."] },
          },
          { status: 422 },
        ),
      ),
    );
    const { user } = renderApp("/requests/new");
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Create request" }));

    expect(
      await screen.findByText("Please fix 1 field below."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveAccessibleDescription(
      "A request with this title already exists.",
    );
    expect(screen.getByLabelText("Title")).toHaveFocus();
  });

  it("creates the request and opens it", async () => {
    const { user } = renderApp("/requests/new");
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Create request" }));

    expect(
      await screen.findByText("Request REQ-1033 created."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "March statement missing" }),
    ).toBeInTheDocument();
  });
});
