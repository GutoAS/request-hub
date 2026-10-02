import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../mocks/server";
import { renderApp } from "../test/renderApp";

const summary = (text: string) => screen.findAllByText(text);

describe("sign-in", () => {
  it("sends signed-out users to the login page, then back where they wanted to go", async () => {
    const { user } = renderApp("/requests/REQ-1002", { signedOut: true });
    expect(
      await screen.findByRole("heading", { name: "Access Your Workspace" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(
      await screen.findByRole("heading", {
        name: "Duplicate invoice on February statement",
      }),
    ).toBeInTheDocument();
  });

  it("signs out", async () => {
    const { user } = renderApp("/requests");
    await summary("32 requests");
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(
      await screen.findByRole("heading", { name: "Access Your Workspace" }),
    ).toBeInTheDocument();
  });

  it("asks to sign in again when the API answers 401", async () => {
    server.use(
      http.get("*/api/requests", () =>
        HttpResponse.json(
          {
            title: "Unauthorized",
            status: 401,
            detail: "The access token has expired.",
          },
          { status: 401 },
        ),
      ),
    );
    renderApp("/requests");
    expect(
      await screen.findByText("Your session expired."),
    ).toBeInTheDocument();
  });

  it("explains a 403 without signing the user out", async () => {
    server.use(
      http.patch("*/api/requests/:id/status", () =>
        HttpResponse.json(
          {
            title: "Forbidden",
            status: 403,
            detail: "Scope 'service-requests.write' is required.",
          },
          { status: 403 },
        ),
      ),
    );
    const { user } = renderApp("/requests/REQ-1002");
    await user.selectOptions(
      await screen.findByLabelText("New status"),
      "RESOLVED",
    );
    await user.click(screen.getByRole("button", { name: "Update status" }));

    expect(
      await screen.findByText("You don't have permission to do this."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
  });
});
