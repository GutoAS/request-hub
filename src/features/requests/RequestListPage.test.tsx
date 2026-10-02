import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../../mocks/server";
import { renderApp } from "../../test/renderApp";

const summary = (text: string | RegExp) => screen.findAllByText(text);
const rows = () =>
  within(screen.getByRole("table")).getAllByRole("row").slice(1); // skip the header row

describe("request list", () => {
  it("shows the first page of requests", async () => {
    renderApp("/requests");
    await summary("32 requests");
    expect(rows()).toHaveLength(10);
    expect(
      screen.getByRole("navigation", { name: "Pagination" }),
    ).toHaveTextContent("Showing 1–10 of 32");
  });

  it("searches by title or requester", async () => {
    const { user } = renderApp("/requests");
    await summary("32 requests");
    await user.type(screen.getByLabelText("Search"), "portal");
    await summary("7 matching requests");
    for (const row of rows())
      expect(row.textContent?.toLowerCase()).toContain("portal");
  });

  it("filters by status", async () => {
    const { user } = renderApp("/requests");
    await summary("32 requests");
    await user.selectOptions(screen.getByLabelText("Status"), "CLOSED");
    await summary(/matching request/);
    for (const row of rows()) expect(row).toHaveTextContent("Closed");
  });

  it("shows an empty state with a way out", async () => {
    const { user } = renderApp("/requests?search=zzz");
    expect(
      await screen.findByText("No requests match your filters"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await summary("32 requests");
  });

  it("shows an API error and recovers with Try again", async () => {
    server.use(
      http.get("*/api/requests", () =>
        HttpResponse.json(
          {
            title: "Internal server error",
            status: 500,
            detail: "Try again later.",
            traceId: "8fa10c37bb45",
          },
          { status: 500 },
        ),
      ),
    );
    const { user } = renderApp("/requests");
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Internal server error");
    expect(alert).toHaveTextContent("Reference: 8fa10c37bb45");

    server.resetHandlers(); // the server is back
    await user.click(screen.getByRole("button", { name: "Try again" }));
    await summary("32 requests");
  });
});
